import { createHmac, timingSafeEqual } from "crypto";

/** Deterministic owner key for a sign-off code — the buyer proves ownership
 *  of a document without any account. Derived server-side (never guessable
 *  from the code alone), handed out once at purchase: in the create response
 *  and in the buyer's document email. Crew members only ever see the bare
 *  sign link, so they can sign but never remove signatures. */
export function ownerKeyFor(code: string): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!secret) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  return createHmac("sha256", secret)
    .update(`swms-owner:${code.toUpperCase()}`)
    .digest("hex")
    .slice(0, 16);
}

export function isValidOwnerKey(code: string, key: string): boolean {
  try {
    const expected = ownerKeyFor(code);
    return (
      key.length === expected.length &&
      timingSafeEqual(Buffer.from(expected), Buffer.from(key))
    );
  } catch {
    return false;
  }
}
