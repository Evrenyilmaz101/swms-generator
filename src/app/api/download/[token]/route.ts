import { NextRequest, NextResponse } from "next/server";
import { renderSwmsPdf } from "@/lib/pdf/render-pdf";
import { validateToken } from "@/lib/supabase/purchases";
import type { SwmsDocument } from "@/types/swms";

/**
 * GET /api/download/[token] — Token-based download (for 3-pack redemptions and paid downloads)
 * Validates the token against Supabase before generating the PDF.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: "Invalid download token" },
        { status: 400 }
      );
    }

    // Validate token against database
    const result = await validateToken(token);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.reason },
        { status: 403 }
      );
    }

    const tokenData = result.token;

    // Token must have a linked document
    if (!tokenData.document_id) {
      return NextResponse.json(
        {
          error:
            "This token hasn't been used to generate a SWMS yet. Please use the builder first.",
        },
        { status: 400 }
      );
    }

    // Fetch the document content from the token's linked purchase
    // For now we return a message — the full flow stores document data in swms_documents
    return NextResponse.json(
      { error: "Token-based re-download coming soon. Use the builder flow." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Token download error:", error);
    return NextResponse.json(
      { error: "Failed to process download" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/download/[token] — Direct download with document data (used by success page)
 * Also supports pre-payment preview flow.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.swms_data || !body.business_name || !body.state) {
      return NextResponse.json(
        { error: "Missing required document data" },
        { status: 400 }
      );
    }

    const doc: SwmsDocument = {
      id: body.id || crypto.randomUUID(),
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
        "Content-Disposition": `attachment; filename="SWMS-${doc.business_name.replace(/[^a-zA-Z0-9]/g, "_")}-${doc.document_reference}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF. Please try again." },
      { status: 500 }
    );
  }
}
