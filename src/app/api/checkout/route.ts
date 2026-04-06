import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/utils/rate-limit";

// Inline price IDs to avoid importing stripe-server.ts (which pulls in the Stripe SDK)
const PRICES = {
  single: () => (process.env.STRIPE_PRICE_SINGLE || "").trim(),
  three_pack: () => (process.env.STRIPE_PRICE_THREE_PACK || "").trim(),
};

const requestSchema = z.object({
  plan: z.enum(["single", "three_pack"]),
  swms_session_id: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    console.log("[checkout-v3] Handler invoked");

    const ip = getClientIp(request);
    const limit = rateLimit(`checkout:${ip}`, {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { plan, swms_session_id } = parsed.data;

    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key) {
      return NextResponse.json(
        { error: "Payment system not configured. Contact support." },
        { status: 503 }
      );
    }

    const priceId = plan === "single" ? PRICES.single() : PRICES.three_pack();
    if (!priceId) {
      return NextResponse.json(
        { error: "Product not configured. Contact support." },
        { status: 503 }
      );
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")).trim();

    console.log("[checkout-v3] siteUrl:", siteUrl, "priceId:", priceId, "keyLen:", key.length);

    // Use native fetch — Stripe Node SDK HTTP clients fail on Vercel/Node 24
    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("payment_method_types[0]", "card");
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    params.set("metadata[plan]", plan);
    params.set("metadata[swms_session_id]", swms_session_id);
    params.set("success_url", `${siteUrl}/download/success?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${siteUrl}/checkout`);

    console.log("[checkout-v3] Calling Stripe API...");

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();
    console.log("[checkout-v3] Stripe response status:", res.status);

    if (!res.ok) {
      const errMsg = data?.error?.message || `Stripe error ${res.status}`;
      console.error("[checkout-v3] Stripe error:", errMsg);
      return NextResponse.json(
        { error: "Failed to create checkout session", detail: errMsg },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.url, sessionId: data.id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[checkout-v3] Catch error:", msg);
    return NextResponse.json(
      { error: "Failed to create checkout session", detail: msg },
      { status: 500 }
    );
  }
}
