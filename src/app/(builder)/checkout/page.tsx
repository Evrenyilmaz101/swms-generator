"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { makeDocNo, pdfPayload, whenHydrated } from "@/lib/utils/builder-doc";
import { PROMO_FREE, PROMO_ENDS, PRICE_SINGLE, PRICE_THREE_PACK } from "@/lib/constants/promo";

const MONO = "'IBM Plex Mono', monospace";
const COND = "'Barlow Condensed', sans-serif";

type Plan = "single" | "three_pack";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    generatedSwms, businessDetails, jobDetails, excludedSteps,
    docNo, setDocNo, redemptionToken, setRedemptionToken, setCurrentStep, reset,
  } = useBuilderStore();

  const [plan, setPlan] = useState<Plan>("single");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signOffUrl, setSignOffUrl] = useState<string | null>(null);
  const [signOffCode, setSignOffCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  /* Proof of purchase for downloads. Survives redemptionToken being cleared
     from the store when the credit is spent — the Done screen's retry button
     still has to be able to fetch the PDF. */
  const paidTokenRef = useRef<string | null>(null);

  /* PROMO_FREE is baked in at build time and cannot know the coupon has been
     exhausted or expired. Ask the server and correct ourselves, so the page
     never promises free once it isn't. */
  const [isFree, setIsFree] = useState(PROMO_FREE);
  useEffect(() => {
    if (!PROMO_FREE) return;
    let alive = true;
    fetch("/api/promo")
      .then((r) => r.json())
      .then((d) => { if (alive) setIsFree(d?.free === true); })
      .catch(() => { if (alive) setIsFree(false); });
    return () => { alive = false; };
  }, []);

  const hasToken = !!redemptionToken;

  useEffect(() => {
    setCurrentStep("checkout");
    const unsub = whenHydrated(() => {
      const s = useBuilderStore.getState();
      if (!s.generatedSwms) { router.push("/job"); return; }
      if (!s.docNo) setDocNo(makeDocNo());
    });
    // Coming back from Stripe via the browser's Back button can restore this
    // page from bfcache with isLoading frozen true — reset on pageshow
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setIsLoading(false);
        setIsDownloading(false);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => {
      unsub?.();
      window.removeEventListener("pageshow", onPageShow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildPdfPayload = useCallback(() => {
    const s = useBuilderStore.getState();
    return pdfPayload({
      business: s.businessDetails,
      job: s.jobDetails,
      swms: s.generatedSwms!,
      excluded: s.excludedSteps,
      complianceScore: s.complianceScore,
      docNo: s.docNo || makeDocNo(),
    });
  }, []);

  const createSignOff = useCallback(async (): Promise<string | null> => {
    try {
      // Reuse the session from a previous visit: every create mints a NEW
      // code, and signatures collected under the old code silently vanish
      // from copies downloaded under a fresh one
      const docNo = useBuilderStore.getState().docNo;
      const cacheKey = docNo ? `swms_signcode_${docNo}` : null;
      if (cacheKey) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const check = await fetch(`/api/sign/validate?code=${cached}`)
            .then((r) => r.json())
            .catch(() => null);
          if (check?.valid) {
            setSignOffUrl(`${window.location.origin}/sign/${cached}`);
            setSignOffCode(cached);
            return cached;
          }
        }
      }

      const res = await fetch("/api/sign/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessDetails.business_name.trim() || "—",
          job_description: jobDetails.job_description,
          state: businessDetails.state,
          // Stored server-side so signed re-downloads work from any device
          document: buildPdfPayload(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSignOffUrl(data.sign_url);
        setSignOffCode(data.sign_code);
        if (cacheKey) localStorage.setItem(cacheKey, data.sign_code);
        if (data.owner_key) localStorage.setItem(`swms_ownerkey_${data.sign_code}`, data.owner_key);
        localStorage.setItem(`swms_doc_${data.sign_code}`, JSON.stringify(buildPdfPayload()));
        return data.sign_code;
      }
    } catch { /* sign-off is a bonus — never block the download on it */ }
    return null;
  }, [businessDetails, jobDetails, buildPdfPayload]);

  const downloadPdf = useCallback(async () => {
    const res = await fetch("/api/download/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // The redemption token is this flow's proof of purchase.
      body: JSON.stringify({ ...buildPdfPayload(), token: paidTokenRef.current ?? redemptionToken }),
    });
    if (!res.ok) throw new Error("PDF generation failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${useBuilderStore.getState().docNo || "SWMS"}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [buildPdfPayload, redemptionToken]);

  /* ── Token flow: consume a 3-pack credit, then download ── */
  const handleTokenDownload = useCallback(async () => {
    if (!redemptionToken || !generatedSwms) return;
    setIsDownloading(true);
    setError(null);
    try {
      const consumeRes = await fetch("/api/redeem/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: redemptionToken,
          job_description: jobDetails.job_description,
          business_name: businessDetails.business_name.trim() || "—",
          state: businessDetails.state,
          generated_content: generatedSwms,
        }),
      });
      const consumeData = await consumeRes.json();
      if (!consumeData.success) {
        setError(consumeData.error || "That token didn't want to redeem.");
        return;
      }
      // Token is spent — the document is theirs from this point, so move to
      // the Done screen regardless of download hiccups. Its DOWNLOAD PDF
      // button retries without touching the token, so a failed first
      // download can't burn the credit.
      paidTokenRef.current = redemptionToken;
      setRedemptionToken(null);
      setDownloaded(true);
      createSignOff();
      try {
        await downloadPdf();
      } catch {
        setError("The download hiccupped — hit DOWNLOAD PDF below to try again. Your token is safe.");
      }
    } catch {
      setError("Couldn't reach the server to redeem that token. Check your signal and try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [redemptionToken, generatedSwms, businessDetails, jobDetails, setRedemptionToken, createSignOff, downloadPdf]);

  /* ── Stripe flow ── */
  async function handleCheckout() {
    setIsLoading(true);
    setError(null);
    try {
      const swmsSessionId = `swms_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(`swms_data_${swmsSessionId}`, JSON.stringify(buildPdfPayload()));
      sessionStorage.setItem("pending_swms_session", swmsSessionId);
      // Create the document's sign-off session BEFORE payment so the code can
      // ride through Stripe metadata — the webhook emails the buyer their
      // permanent document link, so losing the browser tab loses nothing
      const signCode = await createSignOff();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          swms_session_id: swmsSessionId,
          sign_code: signCode || undefined,
          // What the button said. The server refuses to hand back a paid
          // session when this is true — no bait-and-switch.
          expect_free: isFree,
        }),
      });
      const data = await res.json();
      if (data.promoEnded) {
        setIsFree(false);
        setError(`The free launch offer just ran out. It's ${plan === "three_pack" ? PRICE_THREE_PACK : PRICE_SINGLE} now — hit the button again if you still want it.`);
        setIsLoading(false);
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Couldn't open the payment page. Try again in a tick.");
        setIsLoading(false);
      }
    } catch {
      setError("Connection dropped before payment. Nothing's been charged — try again.");
      setIsLoading(false);
    }
  }

  if (!generatedSwms) return null;

  /* ── DONE (token download complete) ── */
  if (downloaded) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 28px", textAlign: "center", width: "100%" }}>
          <div style={{ width: 88, height: 88, margin: "0 auto 28px", border: "2px solid var(--ink)", background: "var(--swa)", boxShadow: "7px 7px 0 var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700 }}>✓</div>
          <h1 style={{ margin: "0 0 12px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(48px,5.4vw,72px)", lineHeight: 0.95, textTransform: "uppercase" }}>Done. Go build.</h1>
          <p style={{ margin: "0 0 34px", fontSize: 16.5, color: "rgba(26,25,23,.72)" }}>Your SWMS is ready — get the crew to sign it before the work starts.</p>
          <div style={{ border: "2px solid var(--ink)", background: "var(--card)", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600 }}>{docNo}.pdf</div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(26,25,23,.55)", marginTop: 3 }}>A4 · {businessDetails.state} COMPLIANT</div>
            </div>
            <button onClick={() => downloadPdf().catch(() => setError("Download hiccup — try again."))} className="sw-btn-ink" style={{ padding: "13px 24px", fontSize: 18, boxShadow: "5px 5px 0 rgba(26,25,23,.3)" }}>
              DOWNLOAD PDF ↓
            </button>
          </div>
          {signOffCode && (
            <button onClick={() => router.push(`/documents/${signOffCode}`)} className="sw-btn" style={{ width: "100%", padding: 16, fontSize: 19, marginBottom: 22 }}>
              OPEN YOUR DOCUMENT PAGE →
            </button>
          )}
          {signOffUrl && (
            <div style={{ border: "2px solid var(--ink)", background: "var(--card)", padding: "16px 20px", marginBottom: 22, textAlign: "left" }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".12em", color: "rgba(26,25,23,.6)", marginBottom: 8 }}>DIGITAL SIGN-OFF — SEND TO THE CREW</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200, fontFamily: MONO, fontSize: 12, color: "rgba(26,25,23,.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{signOffUrl}</div>
                <button onClick={() => { navigator.clipboard.writeText(signOffUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="sw-chip-ghost" style={{ padding: "8px 14px", fontSize: 11, fontWeight: 600, letterSpacing: ".08em" }}>
                  {copied ? "COPIED ✓" : "COPY LINK"}
                </button>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, color: "rgba(26,25,23,.5)", marginTop: 8 }}>WORKERS SIGN ON THEIR PHONES · CREW SIGNATURES LAND ON YOUR DOCUMENT PAGE</div>
            </div>
          )}
          {error && <div style={{ fontFamily: MONO, fontSize: 12, color: "var(--sorange)", marginBottom: 18 }}>{error.toUpperCase()}</div>}
          <div style={{ display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
            <button onClick={() => { reset(); router.push("/job"); }} className="sw-ghost" style={{ padding: "13px 24px", fontSize: 17 }}>START ANOTHER SWMS</button>
            <button onClick={() => router.push("/")} style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", color: "var(--ink)" }}>BACK TO HOME →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "56px 28px 80px", width: "100%", boxSizing: "border-box" }}>
      <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".16em", color: "rgba(26,25,23,.6)", marginBottom: 12 }}>STEP 04 — PAY &amp; DOWNLOAD</div>
      <h1 style={{ margin: "0 0 12px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(44px,5vw,64px)", lineHeight: 0.95, textTransform: "uppercase" }}>Square up.</h1>
      <p style={{ margin: "0 0 34px", fontSize: 16.5, color: "rgba(26,25,23,.72)" }}>
        {hasToken ? "You've got tokens on this pack — this one's already paid for." : "No account. Pay, download on the spot — receipt straight to your inbox."}
      </p>

      {hasToken ? (
        /* ── Token redemption ── */
        <div style={{ border: "2px solid var(--ink)", background: "var(--card)", boxShadow: "8px 8px 0 rgba(26,25,23,.12)", padding: 28, marginBottom: 30 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 600, letterSpacing: ".14em", marginBottom: 6 }}>3-PACK TOKEN</div>
              <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 34, lineHeight: 1 }}>PAID &amp; READY</div>
            </div>
            <div style={{ background: "var(--swa)", border: "2px solid var(--ink)", padding: "6px 12px", fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".1em" }}>1 TOKEN = THIS SWMS</div>
          </div>
          <button onClick={handleTokenDownload} disabled={isDownloading} className="sw-btn" style={{ width: "100%", padding: 17, fontSize: 21 }}>
            {isDownloading ? "BUILDING YOUR PDF…" : "USE A TOKEN — GET MY SWMS ↓"}
          </button>
          {error && <div style={{ fontFamily: MONO, fontSize: 12, color: "var(--sorange)", marginTop: 14 }}>{error.toUpperCase()}</div>}
        </div>
      ) : (
        <>
          {/* ── Plan cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 16, marginBottom: 30 }}>
            <button onClick={() => setPlan("single")} style={{ border: "2px solid var(--ink)", background: plan === "single" ? "var(--card)" : "transparent", padding: "22px 24px", cursor: "pointer", boxShadow: plan === "single" ? "6px 6px 0 var(--ink)" : "none", textAlign: "left", fontFamily: "var(--f-body)", color: "var(--ink)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 600, letterSpacing: ".14em" }}>SINGLE SWMS</div>
                <div style={{ width: 20, height: 20, border: "2px solid var(--ink)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: plan === "single" ? "var(--ink)" : "transparent" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 46, lineHeight: 1 }}>{isFree ? "FREE" : PRICE_SINGLE}</div>
                {isFree && <div style={{ fontFamily: COND, fontWeight: 700, fontSize: 21, lineHeight: 1, color: "rgba(26,25,23,.45)", textDecoration: "line-through" }}>{PRICE_SINGLE}</div>}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(26,25,23,.6)", marginTop: 6 }}>THIS DOCUMENT, ONE-OFF</div>
            </button>
            <button onClick={() => setPlan("three_pack")} style={{ border: "2px solid var(--ink)", background: plan === "three_pack" ? "var(--card)" : "transparent", padding: "22px 24px", cursor: "pointer", position: "relative", boxShadow: plan === "three_pack" ? "6px 6px 0 var(--ink)" : "none", textAlign: "left", fontFamily: "var(--f-body)", color: "var(--ink)" }}>
              <div style={{ position: "absolute", top: -13, right: 14, background: "var(--ink)", color: "var(--swa)", padding: "4px 10px", fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: ".1em" }}>SAVE $3.98</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 600, letterSpacing: ".14em" }}>3-PACK</div>
                <div style={{ width: 20, height: 20, border: "2px solid var(--ink)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: plan === "three_pack" ? "var(--ink)" : "transparent" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 46, lineHeight: 1 }}>{isFree ? "FREE" : PRICE_THREE_PACK}</div>
                {isFree && <div style={{ fontFamily: COND, fontWeight: 700, fontSize: 21, lineHeight: 1, color: "rgba(26,25,23,.45)", textDecoration: "line-through" }}>{PRICE_THREE_PACK}</div>}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(26,25,23,.6)", marginTop: 6 }}>THIS ONE + 2 TOKENS, NEVER EXPIRE</div>
            </button>
          </div>

          {/* ── Pay ── */}
          <div style={{ border: "2px solid var(--ink)", background: "var(--card)", boxShadow: "8px 8px 0 rgba(26,25,23,.12)", padding: 28, marginBottom: 30 }}>
            <button onClick={handleCheckout} disabled={isLoading} className="sw-btn" style={{ width: "100%", padding: 17, fontSize: 21 }}>
              {isLoading
                ? "OPENING SECURE CHECKOUT…"
                : isFree
                  ? "GET MY SWMS — FREE →"
                  : `PAY ${plan === "three_pack" ? PRICE_THREE_PACK : PRICE_SINGLE} — GET MY SWMS`}
            </button>
            <div style={{ textAlign: "center", marginTop: 14, fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", color: "rgba(26,25,23,.5)" }}>
              {isFree
                ? `LAUNCH OFFER · NO CARD NEEDED · FREE UNTIL ${PROMO_ENDS}`
                : "SECURED BY STRIPE · CARD, APPLE PAY & GOOGLE PAY · FULL REFUND WITHIN 7 DAYS IF IT'S NOT USABLE"}
            </div>
            {error && <div style={{ fontFamily: MONO, fontSize: 12, color: "var(--sorange)", marginTop: 14, textAlign: "center" }}>{error.toUpperCase()}</div>}
          </div>
        </>
      )}

      <button onClick={() => router.push("/preview")} style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: MONO, fontSize: 12.5, fontWeight: 600, letterSpacing: ".1em", padding: 0, color: "var(--ink)" }}>← BACK TO PREVIEW</button>
    </div>
  );
}
