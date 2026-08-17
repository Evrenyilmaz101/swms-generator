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

/* The POST handler that used to live here took the document data and rendered
   the finished PDF while ignoring the [token] segment entirely — an
   unauthenticated copy of the paid deliverable. Nothing called it. Removed
   rather than secured; /api/download/preview is the single rendering entry
   point and it now checks entitlement. */
