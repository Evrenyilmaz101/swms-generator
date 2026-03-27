import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/stripe-server";
import {
  createPurchase,
  createTokensForPurchase,
  findPurchaseByStripeSession,
} from "@/lib/supabase/purchases";
import type Stripe from "stripe";

// Stripe sends raw body — we need to handle it manually
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    // In development without webhook secret, still process the event
    // In production, ALWAYS require signature verification
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Missing signature or webhook secret" },
        { status: 400 }
      );
    }
  }

  let event: Stripe.Event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      event = getStripe().webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      // Dev mode — parse without verification
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const plan = (session.metadata?.plan || "single") as "single" | "three_pack";
  const email =
    session.customer_email || session.customer_details?.email || null;

  console.log("Payment completed:", {
    plan,
    email,
    amount: session.amount_total,
    sessionId: session.id,
  });

  try {
    // Check if we already processed this (idempotency)
    const existing = await findPurchaseByStripeSession(session.id);
    if (existing) {
      console.log("Purchase already processed:", existing.id);
      return;
    }

    // Create purchase record
    const purchase = await createPurchase({
      stripe_session_id: session.id,
      email,
      purchase_type: plan,
      amount_paid: session.amount_total || 0,
    });

    console.log("Purchase created:", purchase.id);

    // Create download tokens
    const tokenCount = plan === "three_pack" ? 3 : 1;
    const tokens = await createTokensForPurchase(purchase.id, tokenCount);

    console.log(
      `Created ${tokens.length} token(s):`,
      tokens.map((t) => t.token.slice(0, 8) + "...")
    );

    // For 3-pack: send email with redemption links
    if (plan === "three_pack" && email) {
      // TODO: Wire up email delivery (Resend, SendGrid, or Cloudflare Email Workers)
      console.log(`TODO: Send ${tokens.length} redemption links to ${email}`);
      console.log(
        "Links:",
        tokens.map((t) => `/redeem/${t.token}`)
      );
    }
  } catch (error) {
    console.error("Failed to process checkout:", error);
    // Don't return error to Stripe — it would retry. Log and alert instead.
  }
}
