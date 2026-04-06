import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import {
  createPurchase,
  createTokensForPurchase,
  findPurchaseByStripeSession,
} from "@/lib/supabase/purchases";
import { sendRedemptionEmail } from "@/lib/email/send-redemption-email";

// Manual Stripe signature verification (avoids Stripe SDK HTTP client issues on Vercel/Node 24)
function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string,
  tolerance = 300 // 5 minutes
): boolean {
  const parts = signature.split(",").reduce(
    (acc, part) => {
      const [key, val] = part.split("=");
      if (key === "t") acc.timestamp = val;
      if (key === "v1") acc.signatures.push(val);
      return acc;
    },
    { timestamp: "", signatures: [] as string[] }
  );

  if (!parts.timestamp || parts.signatures.length === 0) return false;

  // Check timestamp tolerance
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(parts.timestamp)) > tolerance) return false;

  // Compute expected signature
  const payload = `${parts.timestamp}.${body}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  // Compare using timing-safe comparison
  return parts.signatures.some((sig) => {
    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
    } catch {
      return false;
    }
  });
}

interface StripeSession {
  id: string;
  payment_status: string;
  amount_total: number | null;
  customer_email: string | null;
  customer_details?: { email: string | null };
  metadata?: Record<string, string>;
}

interface StripeEvent {
  type: string;
  data: { object: StripeSession };
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  console.log("[webhook] Received event, sig present:", !!signature, "secret present:", !!secret);

  if (!signature || !secret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Missing signature or webhook secret" },
        { status: 400 }
      );
    }
  }

  let event: StripeEvent;

  try {
    if (secret && signature) {
      if (!verifyStripeSignature(body, signature, secret)) {
        console.error("[webhook] Signature verification failed");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        );
      }
      event = JSON.parse(body) as StripeEvent;
    } else {
      event = JSON.parse(body) as StripeEvent;
    }
  } catch (err) {
    console.error("[webhook] Parse/verify error:", err);
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    );
  }

  console.log("[webhook] Event type:", event.type);

  switch (event.type) {
    case "checkout.session.completed": {
      await handleCheckoutCompleted(event.data.object);
      break;
    }
    default:
      console.log(`[webhook] Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: StripeSession) {
  const plan = (session.metadata?.plan || "single") as "single" | "three_pack";
  const email =
    session.customer_email || session.customer_details?.email || null;

  console.log("[webhook] Payment completed:", {
    plan,
    email,
    amount: session.amount_total,
    sessionId: session.id,
  });

  try {
    // Check if we already processed this (idempotency)
    const existing = await findPurchaseByStripeSession(session.id);
    if (existing) {
      console.log("[webhook] Purchase already processed:", existing.id);
      return;
    }

    // Create purchase record
    const purchase = await createPurchase({
      stripe_session_id: session.id,
      email,
      purchase_type: plan,
      amount_paid: session.amount_total || 0,
    });

    console.log("[webhook] Purchase created:", purchase.id);

    // Create download tokens
    const tokenCount = plan === "three_pack" ? 3 : 1;
    const tokens = await createTokensForPurchase(purchase.id, tokenCount);

    console.log(
      `[webhook] Created ${tokens.length} token(s):`,
      tokens.map((t: { token: string }) => t.token.slice(0, 8) + "...")
    );

    // For 3-pack: send email with redemption links
    if (plan === "three_pack" && email) {
      try {
        await sendRedemptionEmail({
          to: email,
          tokens: tokens.map((t: { token: string }) => t.token),
          amountPaid: session.amount_total || 1999,
        });
        console.log(`[webhook] Redemption email sent to ${email}`);
      } catch (emailErr) {
        console.error("[webhook] Failed to send redemption email:", emailErr);
      }
    }
  } catch (error) {
    console.error("[webhook] Failed to process checkout:", error);
  }
}
