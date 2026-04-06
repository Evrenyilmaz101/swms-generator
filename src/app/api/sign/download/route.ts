import { NextRequest, NextResponse } from "next/server";
import { renderSwmsPdf } from "@/lib/pdf/render-pdf";
import { getSessionWithSignatures } from "@/lib/supabase/sign-offs";
import QRCode from "qrcode";
import type { SwmsDocument } from "@/types/swms";

// Re-download PDF with collected digital signatures embedded
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, ...docFields } = body;

    if (!code || !docFields.swms_data || !docFields.business_name) {
      return NextResponse.json(
        { error: "Missing sign-off code or document data" },
        { status: 400 }
      );
    }

    // Get signatures from DB
    const result = await getSessionWithSignatures(code);
    const signatures = result?.signatures.map((s) => ({
      worker_name: s.worker_name,
      worker_role: s.worker_role,
      licence_number: s.licence_number,
      signature_base64: s.signature_base64,
      signed_at: s.signed_at,
    })) || [];

    // Generate QR code for the sign-off URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://swms-generator.vercel.app";
    const signOffUrl = `${siteUrl}/sign/${code}`;
    let signOffQrBase64: string | undefined;

    try {
      signOffQrBase64 = await QRCode.toDataURL(signOffUrl, {
        width: 120,
        margin: 1,
        color: { dark: "#0E2A4D", light: "#FFFFFF" },
      });
    } catch {
      // QR generation failed — not critical
    }

    const doc: SwmsDocument = {
      id: crypto.randomUUID(),
      business_name: docFields.business_name,
      abn: docFields.abn || "",
      contact_name: docFields.contact_name || "",
      phone: docFields.phone || "",
      state: docFields.state,
      logo_base64: docFields.logo_base64 || "",
      job_description: docFields.job_description || "",
      site_address: docFields.site_address || "",
      principal_contractor: docFields.principal_contractor || "",
      job_reference: docFields.job_reference || "",
      swms_data: docFields.swms_data,
      compliance_score: docFields.compliance_score || 0,
      document_reference: docFields.document_reference || `SWMS-${Date.now()}`,
      revision_number: docFields.revision_number || 1,
      created_at: docFields.created_at || new Date().toLocaleDateString("en-AU"),
    };

    const pdfBuffer = await renderSwmsPdf(doc, {
      signatures,
      signOffUrl,
      signOffQrBase64,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="SWMS-${doc.business_name.replace(/[^a-zA-Z0-9]/g, "_")}-signed.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Signed PDF download error:", error);
    return NextResponse.json(
      { error: "Failed to generate signed PDF" },
      { status: 500 }
    );
  }
}
