import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzePhoto } from "@/lib/ai/analyze-photo";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/utils/rate-limit";

const requestSchema = z.object({
  image_base64: z
    .string()
    .min(100, "Image data is too small")
    .max(10_000_000, "Image is too large (max ~7MB)"),
  job_description: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = getClientIp(request);
    const limit = rateLimit(`photo:${ip}`, RATE_LIMITS.analyzePhoto);
    if (!limit.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: parsed.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const hazards = await analyzePhoto(
      parsed.data.image_base64,
      parsed.data.job_description
    );

    return NextResponse.json({
      success: true,
      hazards,
    });
  } catch (error) {
    console.error("Photo analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze photo. Please try again.",
      },
      { status: 500 }
    );
  }
}
