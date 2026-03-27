import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, STRIPE_PRICES } from "@/lib/stripe/stripe-server";
import { rateLimit, getClientIp } from "@/lib/utils/rate-limit";

const requestSchema = z.object({
  plan: z.enum(["single", "three_pack"]),
  // We store the SWMS data reference so we know what to generate after payment
  swms_session_id: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const limit = rateLimit(`checkout:${ip}`, {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { plan, swms_session_id } = parsed.data;

    // Check Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payment system not configured. Contact support." },
        { status: 503 }
      );
    }

    const priceId = plan === "single" ? STRIPE_PRICES.single : STRIPE_PRICES.three_pack;

    if (!priceId) {
      return NextResponse.json(
        { error: "Product not configured. Contact support." },
        { status: 503 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        plan,
        swms_session_id,
      },
      // Collect email for 3-pack link delivery
      ...(plan === "three_pack" && {
        customer_email: undefined, // Let Stripe collect it
      }),
      success_url: `${siteUrl}/download/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
