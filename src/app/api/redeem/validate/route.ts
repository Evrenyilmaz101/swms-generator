import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/lib/supabase/purchases";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Missing token" },
        { status: 400 }
      );
    }

    const result = await validateToken(token);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.reason },
        { status: 400 }
      );
    }

    // Return token info without sensitive data
    const tokenData = result.token;
    return NextResponse.json({
      valid: true,
      plan: tokenData.purchases?.purchase_type || "three_pack",
      creditsUsed: tokenData.purchases
        ? (tokenData.purchases.purchase_type === "three_pack" ? 3 : 1) -
          tokenData.purchases.credits_remaining
        : 0,
      creditsTotal: tokenData.purchases?.purchase_type === "three_pack" ? 3 : 1,
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Validation failed" },
      { status: 500 }
    );
  }
}
