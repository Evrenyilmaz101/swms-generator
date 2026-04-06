import { NextRequest, NextResponse } from "next/server";
import { validateSignCode } from "@/lib/supabase/sign-offs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code || code.length < 6) {
    return NextResponse.json(
      { valid: false, error: "Invalid sign-off code" },
      { status: 400 }
    );
  }

  try {
    const result = await validateSignCode(code);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      business_name: result.session!.business_name,
      job_description: result.session!.job_description,
      state: result.session!.state,
      worker_count: result.session!.worker_count,
      signature_count: result.signature_count,
    });
  } catch (error) {
    console.error("Sign validate error:", error);
    return NextResponse.json(
      { valid: false, error: "Server error" },
      { status: 500 }
    );
  }
}
