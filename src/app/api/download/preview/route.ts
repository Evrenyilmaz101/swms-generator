import { NextRequest, NextResponse } from "next/server";
import { renderSwmsPdf } from "@/lib/pdf/render-pdf";
import type { SwmsDocument } from "@/types/swms";

// Preview/MVP download endpoint — generates PDF directly from POST body
// In production, this is behind Stripe payment verification
// The [token] route handles paid/authenticated downloads

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.swms_data || !body.business_name || !body.state) {
      return NextResponse.json(
        { error: "Missing required document data" },
        { status: 400 }
      );
    }

    const doc: SwmsDocument = {
      id: crypto.randomUUID(),
      business_name: body.business_name,
      abn: body.abn || "",
      contact_name: body.contact_name || "",
      phone: body.phone || "",
      state: body.state,
      logo_base64: body.logo_base64 || "",
      job_description: body.job_description || "",
      site_address: body.site_address || "",
      principal_contractor: body.principal_contractor || "",
      job_reference: body.job_reference || "",
      swms_data: body.swms_data,
      compliance_score: body.compliance_score || 0,
      document_reference: body.document_reference || `SWMS-${Date.now()}`,
      revision_number: body.revision_number || 1,
      created_at: body.created_at || new Date().toLocaleDateString("en-AU"),
    };

    const pdfBuffer = await renderSwmsPdf(doc);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="SWMS-${doc.business_name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF preview generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
