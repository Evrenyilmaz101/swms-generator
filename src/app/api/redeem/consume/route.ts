import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { redeemToken } from "@/lib/supabase/purchases";

const requestSchema = z.object({
  token: z.string().min(1),
  job_description: z.string().min(1),
  business_name: z.string().min(1),
  state: z.string().min(1),
  generated_content: z.record(z.string(), z.unknown()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request" },
        { status: 400 }
      );
    }

    const doc = await redeemToken(parsed.data);

    return NextResponse.json({
      success: true,
      documentId: doc.id,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Token consumption error:", msg);

    // Return user-friendly error for known cases
    if (msg.includes("already used")) {
      return NextResponse.json(
        { success: false, error: "This link has already been used" },
        { status: 400 }
      );
    }
    if (msg.includes("expired")) {
      return NextResponse.json(
        { success: false, error: "This link has expired" },
        { status: 400 }
      );
    }
    if (msg.includes("not found")) {
      return NextResponse.json(
        { success: false, error: "Invalid redemption link" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to process redemption" },
      { status: 500 }
    );
  }
}
