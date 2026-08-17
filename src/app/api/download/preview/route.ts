import { NextRequest, NextResponse } from "next/server";
import { renderSwmsPdf } from "@/lib/pdf/render-pdf";
import { isEntitledToDownload } from "@/lib/utils/entitlement";
import { rateLimit, getClientIp } from "@/lib/utils/rate-limit";
import type { SwmsDocument } from "@/types/swms";

// Renders a SWMS PDF from the posted document data.
//   watermark: true  → open. It's the stamped PREVIEW copy, not the deliverable.
//   watermark: false → the paid deliverable, so it demands proof of purchase
//                      (a settled Stripe session id, or a purchase token).

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`download:${ip}`, {
      maxRequests: 30,
      windowMs: 60 * 60 * 1000,
    });
    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const watermark = body.watermark === true;

    if (!body.swms_data || !body.business_name || !body.state) {
      return NextResponse.json(
        { error: "Missing required document data" },
        { status: 400 }
      );
    }

    if (!watermark) {
      const entitled = await isEntitledToDownload({
        sessionId: body.session_id,
        token: body.token,
      });
      if (!entitled) {
        return NextResponse.json(
          { error: "This download needs a completed order." },
          { status: 402 }
        );
      }
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

    const pdfBuffer = await renderSwmsPdf(doc, { watermark });

    // Watermarked previews are inline (shown in iframe), not downloaded
    const disposition = watermark
      ? "inline"
      : `attachment; filename="SWMS-${doc.business_name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
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
