import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/stripe-server";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing session_id" },
        { status: 400 }
      );
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { success: false, error: "Payment not completed" },
        { status: 402 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        plan: session.metadata?.plan || "single",
        email:
          session.customer_email || session.customer_details?.email || null,
        amount: session.amount_total || 0,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
