import { tokenBelongsToOrder } from "@/lib/supabase/purchases";

/**
 * Is the caller entitled to the finished, unwatermarked SWMS PDF?
 *
 * Two ways to prove it, matching the two ways a document gets paid for:
 *   sessionId — a completed Stripe Checkout Session (the card flow, and also
 *               the $0 promo flow, which settles as "no_payment_required")
 *   token     — a generation token from a purchase (3-pack redemptions)
 *
 * Kept deliberately server-side: before this existed the paywall was enforced
 * only by the client, so anyone could POST the payload and get the real PDF.
 */
export async function isEntitledToDownload(params: {
  sessionId?: unknown;
  token?: unknown;
}): Promise<boolean> {
  const sessionId = typeof params.sessionId === "string" ? params.sessionId.trim() : "";
  const token = typeof params.token === "string" ? params.token.trim() : "";

  if (token && (await tokenBelongsToOrder(token))) return true;
  if (sessionId && (await stripeSessionSettled(sessionId))) return true;
  return false;
}

async function stripeSessionSettled(sessionId: string): Promise<boolean> {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return false;
  // Cheap sanity check before spending a Stripe call.
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return false;

  try {
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: { Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) return false;
    const session = await res.json();
    return (
      session?.payment_status === "paid" ||
      session?.payment_status === "no_payment_required"
    );
  } catch {
    return false;
  }
}
