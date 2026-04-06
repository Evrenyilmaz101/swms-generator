// Supabase queries for SWMS digital sign-off feature
// Manages sign-off sessions and worker signatures

import { getSupabase } from "./client";
import crypto from "crypto";

// Generate a short, URL-safe sign-off code (8 chars uppercase alphanumeric)
function generateSignCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I/O/0/1 to avoid confusion
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

export interface SignOffSession {
  id: string;
  document_id: string | null;
  sign_code: string;
  business_name: string;
  job_description: string;
  state: string;
  worker_count: number;
  expires_at: string;
  created_at: string;
}

export interface Signature {
  id: string;
  session_id: string;
  worker_name: string;
  worker_role: string | null;
  licence_number: string | null;
  signature_base64: string;
  signed_at: string;
}

// Create a new sign-off session for a SWMS document
export async function createSignOffSession(params: {
  document_id?: string;
  business_name: string;
  job_description: string;
  state: string;
  worker_count?: number;
}): Promise<{ sign_code: string; id: string } | null> {
  const supabase = getSupabase();
  const sign_code = generateSignCode();

  // Expires in 12 months
  const expires_at = new Date();
  expires_at.setFullYear(expires_at.getFullYear() + 1);

  const { data, error } = await supabase
    .from("swms_sign_off_sessions")
    .insert({
      document_id: params.document_id || null,
      sign_code,
      business_name: params.business_name,
      job_description: params.job_description.slice(0, 500),
      state: params.state,
      worker_count: params.worker_count || 6,
      expires_at: expires_at.toISOString(),
    })
    .select("id, sign_code")
    .single();

  if (error) {
    console.error("Failed to create sign-off session:", error);
    return null;
  }

  return data;
}

// Validate a sign-off code — returns session details + signature count
export async function validateSignCode(code: string): Promise<{
  valid: boolean;
  session?: SignOffSession;
  signature_count?: number;
  error?: string;
}> {
  const supabase = getSupabase();

  const { data: session, error } = await supabase
    .from("swms_sign_off_sessions")
    .select("*")
    .eq("sign_code", code.toUpperCase())
    .single();

  if (error || !session) {
    return { valid: false, error: "Sign-off code not found" };
  }

  // Check expiry
  if (new Date(session.expires_at) < new Date()) {
    return { valid: false, error: "This sign-off link has expired" };
  }

  // Get signature count
  const { count } = await supabase
    .from("swms_signatures")
    .select("*", { count: "exact", head: true })
    .eq("session_id", session.id);

  return {
    valid: true,
    session,
    signature_count: count || 0,
  };
}

// Add a worker signature
export async function addSignature(params: {
  session_id: string;
  worker_name: string;
  worker_role?: string;
  licence_number?: string;
  signature_base64: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  const { error } = await supabase.from("swms_signatures").insert({
    session_id: params.session_id,
    worker_name: params.worker_name,
    worker_role: params.worker_role || null,
    licence_number: params.licence_number || null,
    signature_base64: params.signature_base64,
  });

  if (error) {
    console.error("Failed to save signature:", error);
    return { success: false, error: "Failed to save signature" };
  }

  return { success: true };
}

// Get all signatures for a session
export async function getSignatures(
  session_id: string
): Promise<Signature[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("swms_signatures")
    .select("*")
    .eq("session_id", session_id)
    .order("signed_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch signatures:", error);
    return [];
  }

  return data || [];
}

// Get session + signatures by sign code
export async function getSessionWithSignatures(code: string): Promise<{
  session: SignOffSession;
  signatures: Signature[];
} | null> {
  const validation = await validateSignCode(code);
  if (!validation.valid || !validation.session) return null;

  const signatures = await getSignatures(validation.session.id);
  return { session: validation.session, signatures };
}
