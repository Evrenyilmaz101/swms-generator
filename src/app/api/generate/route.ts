import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateSwms } from "@/lib/ai/generate-swms";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/utils/rate-limit";

const requestSchema = z.object({
  job_description: z.string().min(10).max(2000),
  state: z.enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"]),
  site_address: z.string().max(300).optional(),
  principal_contractor: z.string().max(200).optional(),
  additional_hazards: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = getClientIp(request);
    const limit = rateLimit(`generate:${ip}`, RATE_LIMITS.generate);
    if (!limit.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((limit.resetAt - Date.now()) / 1000)
            ),
          },
        }
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

    const result = await generateSwms(parsed.data);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("SWMS generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
