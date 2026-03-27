import { getSupabase } from "./client";

/**
 * Create a purchase record after successful Stripe payment.
 * For single: 1 credit. For 3-pack: 3 credits.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createPurchase(params: {
  stripe_session_id: string;
  email: string | null;
  purchase_type: "single" | "three_pack";
  amount_paid: number;
}): Promise<any> {
  const db = getSupabase();
  const credits = params.purchase_type === "three_pack" ? 3 : 1;

  const { data, error } = await db
    .from("purchases")
    .insert({
      stripe_session_id: params.stripe_session_id,
      email: params.email,
      purchase_type: params.purchase_type,
      credits_remaining: credits,
      amount_paid: params.amount_paid,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create purchase: ${error.message}`);
  return data;
}

/**
 * Create download tokens for a purchase.
 * Single = 1 token, 3-pack = 3 tokens.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createTokensForPurchase(purchaseId: string, count: number): Promise<any[]> {
  const db = getSupabase();

  const tokens: { purchase_id: string }[] = [];
  for (let i = 0; i < count; i++) {
    tokens.push({ purchase_id: purchaseId });
  }

  const { data, error } = await db
    .from("generation_tokens")
    .insert(tokens)
    .select();

  if (error) throw new Error(`Failed to create tokens: ${error.message}`);
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TokenRecord = any;

type TokenResult =
  | { valid: true; token: TokenRecord }
  | { valid: false; reason: string };

/**
 * Validate a download token. Returns the token record if valid.
 */
export async function validateToken(token: string): Promise<TokenResult> {
  const db = getSupabase();

  const { data, error } = await db
    .from("generation_tokens")
    .select("*, purchases(*)")
    .eq("token", token)
    .single();

  if (error || !data) {
    return { valid: false, reason: "Token not found" };
  }

  if (data.used) {
    return { valid: false, reason: "Token already used" };
  }

  if (new Date(data.expires_at) < new Date()) {
    return { valid: false, reason: "Token expired" };
  }

  return { valid: true, token: data };
}

/**
 * Mark a token as used and store the generated document.
 */
export async function redeemToken(params: {
  token: string;
  job_description: string;
  business_name: string;
  state: string;
  generated_content: Record<string, unknown>;
}) {
  const db = getSupabase();

  // Get the token
  const tokenResult = await validateToken(params.token);
  if (!tokenResult.valid) {
    throw new Error(tokenResult.reason);
  }

  const tokenData = tokenResult.token;

  // Create the document
  const { data: doc, error: docError } = await db
    .from("swms_documents")
    .insert({
      purchase_id: tokenData.purchase_id,
      job_description: params.job_description,
      business_name: params.business_name,
      state: params.state,
      generated_content: params.generated_content,
    })
    .select()
    .single();

  if (docError) throw new Error(`Failed to save document: ${docError.message}`);

  // Mark token as used
  const { error: updateError } = await db
    .from("generation_tokens")
    .update({ used: true, document_id: doc.id })
    .eq("token", params.token);

  if (updateError)
    throw new Error(`Failed to mark token used: ${updateError.message}`);

  // Decrement credits on purchase
  if (tokenData.purchase_id) {
    const { error: creditError } = await db.rpc("decrement_credits" as never, {
      p_id: tokenData.purchase_id,
    });

    // Non-critical — log but don't fail
    if (creditError) {
      console.error("Failed to decrement credits:", creditError);
    }
  }

  return doc;
}

/**
 * Find a purchase by Stripe session ID.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function findPurchaseByStripeSession(stripeSessionId: string): Promise<any | null> {
  const db = getSupabase();

  const { data, error } = await db
    .from("purchases")
    .select("*, generation_tokens(*)")
    .eq("stripe_session_id", stripeSessionId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Find all tokens for a given email (for "resend my links" feature).
 */
export async function findTokensByEmail(email: string) {
  const db = getSupabase();

  const { data, error } = await db
    .from("purchases")
    .select("*, generation_tokens(*)")
    .eq("email", email)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}
