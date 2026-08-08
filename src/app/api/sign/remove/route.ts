import { NextRequest, NextResponse } from "next/server";
import { validateSignCode, deleteSignature } from "@/lib/supabase/sign-offs";
import { isValidOwnerKey } from "@/lib/utils/owner-key";

// Owner-only: remove a signature from a document's sign-on register.
// The owner key is issued once at purchase (create response + document
// email) — crew members holding the bare sign link can't reach this.
export async function POST(request: NextRequest) {
  try {
    const { code, signature_id, owner_key } = await request.json();

    if (!code || !signature_id || !owner_key) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidOwnerKey(code, owner_key)) {
      return NextResponse.json(
        { success: false, error: "Not authorised to modify this document" },
        { status: 403 }
      );
    }

    const validation = await validateSignCode(code);
    if (!validation.valid || !validation.session) {
      return NextResponse.json(
        { success: false, error: validation.error || "Invalid code" },
        { status: 404 }
      );
    }

    const result = await deleteSignature(validation.session.id, signature_id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sign remove error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
