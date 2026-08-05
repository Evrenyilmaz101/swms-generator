import { NextRequest, NextResponse } from "next/server";
import { validateSignCode, getSignOffDocument } from "@/lib/supabase/sign-offs";
import type { SwmsData } from "@/types/swms";

// Toolbox-talk data for a sign-off code — powers the on-site
// "run the toolbox talk" mode. GET so the service worker can cache it
// and the talk still opens with no reception.
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.json({ success: false, error: "Missing code" }, { status: 400 });
    }

    const validation = await validateSignCode(code);
    if (!validation.valid || !validation.session) {
      return NextResponse.json(
        { success: false, error: validation.error || "Code not found" },
        { status: 404 }
      );
    }

    const session = validation.session;
    if (!session.document_id) {
      return NextResponse.json(
        { success: false, error: "No document stored for this code — toolbox talk mode is available for documents created from August 2026." },
        { status: 404 }
      );
    }

    const payload = await getSignOffDocument(session.document_id);
    const swms = payload?.swms_data as SwmsData | undefined;
    if (!swms) {
      return NextResponse.json(
        { success: false, error: "Document data unavailable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      business_name: session.business_name,
      state: session.state,
      document_reference: (payload?.document_reference as string) || "",
      toolbox_talk: swms.toolbox_talk || "",
      hrcw: swms.hrcw_activities || [],
      steps: (swms.steps || []).map((s) => ({
        n: s.step_number,
        title: s.activity,
        hazards: s.hazards,
        residual: s.residual_risk?.rating,
      })),
      ppe: swms.ppe_requirements || [],
      signature_count: validation.signature_count || 0,
    });
  } catch (error) {
    console.error("Talk fetch error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
