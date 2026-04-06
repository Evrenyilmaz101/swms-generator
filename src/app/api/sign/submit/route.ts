import { NextRequest, NextResponse } from "next/server";
import { validateSignCode, addSignature } from "@/lib/supabase/sign-offs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, worker_name, worker_role, licence_number, signature_base64 } = body;

    if (!code || !worker_name || !signature_base64) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: code, worker_name, signature" },
        { status: 400 }
      );
    }

    // Validate the code
    const validation = await validateSignCode(code);
    if (!validation.valid || !validation.session) {
      return NextResponse.json(
        { success: false, error: validation.error || "Invalid sign-off code" },
        { status: 400 }
      );
    }

    // Save the signature
    const result = await addSignature({
      session_id: validation.session.id,
      worker_name: worker_name.trim(),
      worker_role: worker_role?.trim() || undefined,
      licence_number: licence_number?.trim() || undefined,
      signature_base64,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signature_count: (validation.signature_count || 0) + 1,
      worker_count: validation.session.worker_count,
    });
  } catch (error) {
    console.error("Sign submit error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit signature" },
      { status: 500 }
    );
  }
}
