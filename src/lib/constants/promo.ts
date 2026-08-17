/**
 * Launch promo — SWMS free for a limited run.
 *
 * Two switches, and they must move together:
 *   NEXT_PUBLIC_PROMO_FREE=1   → the UI advertises free
 *   STRIPE_PROMO_COUPON=<id>   → checkout applies that 100%-off coupon
 *
 * Stripe owns the hard limits (redemption cap + expiry date) on the coupon
 * itself, so the promo cannot outrun them even if these flags are left on.
 * If the coupon dies while the flags are still set, checkout falls back to
 * full price — so unset NEXT_PUBLIC_PROMO_FREE when the run ends.
 */
export const PROMO_FREE = process.env.NEXT_PUBLIC_PROMO_FREE === "1";

/** Human-readable end date for the offer copy. */
export const PROMO_ENDS = "31 AUG";

export const PRICE_SINGLE = "$7.99";
export const PRICE_THREE_PACK = "$19.99";
