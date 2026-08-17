import { NextResponse } from "next/server";

/**
 * GET /api/promo — is the launch offer actually free right now?
 *
 * The UI's build-time NEXT_PUBLIC_PROMO_FREE flag is only an *intent*: it is
 * frozen into the JS bundle, so it cannot know that the coupon has hit its
 * redemption cap or passed its expiry. This asks Stripe, which is the only
 * thing that actually decides. Clients call it to correct the UI, so the site
 * can never promise free and then present a bill.
 */
export const revalidate = 0;

let cache: { at: number; free: boolean } | null = null;
const CACHE_MS = 60_000;

export async function GET() {
  const coupon = (process.env.STRIPE_PROMO_COUPON || "").trim();
  if (!coupon) return NextResponse.json({ free: false });

  if (cache && Date.now() - cache.at < CACHE_MS) {
    return NextResponse.json({ free: cache.free, cached: true });
  }

  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return NextResponse.json({ free: false });

  try {
    const res = await fetch(
      `https://api.stripe.com/v1/coupons/${encodeURIComponent(coupon)}`,
      { headers: { Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) {
      cache = { at: Date.now(), free: false };
      return NextResponse.json({ free: false });
    }
    const c = await res.json();
    // Stripe flips `valid` to false once the coupon expires or is exhausted.
    const free = c?.valid === true;
    cache = { at: Date.now(), free };
    return NextResponse.json({ free });
  } catch {
    // Unreachable Stripe: claim nothing rather than over-promise.
    return NextResponse.json({ free: false });
  }
}
