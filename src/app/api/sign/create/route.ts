import { NextRequest, NextResponse } from "next/server";
import { createSignOffSession } from "@/lib/supabase/sign-offs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_name, job_description, state, worker_count } = body;

    if (!business_name || !job_description || !state) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await createSignOffSession({
      business_name,
      job_description,
      state,
      worker_count: worker_count || 6,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Failed to create sign-off session" },
        { status: 500 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://swms-generator.vercel.app";
    const sign_url = `${siteUrl}/sign/${result.sign_code}`;

    return NextResponse.json({
      success: true,
      sign_code: result.sign_code,
      sign_url,
      session_id: result.id,
    });
  } catch (error) {
    console.error("Sign create error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
