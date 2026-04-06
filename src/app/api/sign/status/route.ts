import { NextRequest, NextResponse } from "next/server";
import { getSessionWithSignatures } from "@/lib/supabase/sign-offs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const result = await getSessionWithSignatures(code);

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      business_name: result.session.business_name,
      job_description: result.session.job_description,
      worker_count: result.session.worker_count,
      signature_count: result.signatures.length,
      signatures: result.signatures.map((s) => ({
        worker_name: s.worker_name,
        worker_role: s.worker_role,
        signed_at: s.signed_at,
      })),
    });
  } catch (error) {
    console.error("Sign status error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
