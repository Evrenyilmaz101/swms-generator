// Server-side Stripe instance (lazy initialization)
// Only import this in API routes (server-only)

import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY not set. Add it to .env.local to enable payments."
      );
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

// Product IDs — create these in Stripe Dashboard (test mode first)
// Then paste the price IDs here
export const STRIPE_PRICES = {
  single: process.env.STRIPE_PRICE_SINGLE || "",
  three_pack: process.env.STRIPE_PRICE_THREE_PACK || "",
};
