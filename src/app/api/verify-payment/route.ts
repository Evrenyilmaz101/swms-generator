import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing session_id" },
        { status: 400 }
      );
    }

    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key) {
      return NextResponse.json(
        { success: false, error: "Payment system not configured" },
        { status: 503 }
      );
    }

    // Use native fetch — Stripe Node SDK HTTP clients fail on Vercel/Node 24
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: { "Authorization": `Bearer ${key}` } }
    );
    const session = await res.json();

    if (!res.ok) {
      console.error("Stripe session retrieve error:", session.error?.message);
      return NextResponse.json(
        { success: false, error: "Failed to verify payment" },
        { status: 500 }
      );
    }

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
