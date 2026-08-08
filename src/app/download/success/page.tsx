"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const MONO = "'IBM Plex Mono', monospace";
const COND = "'Barlow Condensed', sans-serif";

interface PaymentInfo {
  plan: string;
  email: string | null;
  amount: number;
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <div style={{ textAlign: "center", padding: "100px 0", fontFamily: MONO, fontSize: 12, letterSpacing: ".1em", color: "rgba(26,25,23,.6)" }}>
            LOADING…
          </div>
        </Shell>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [signOffUrl, setSignOffUrl] = useState<string | null>(null);
  const [signOffCode, setSignOffCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [docLabel, setDocLabel] = useState("SWMS");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  // Survives sessionStorage cleanup so DOWNLOAD AGAIN keeps working
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payloadRef = useRef<any>(null);

  useEffect(() => {
    const pendingSessionId = sessionStorage.getItem("pending_swms_session");
    const stored = pendingSessionId ? sessionStorage.getItem(`swms_data_${pendingSessionId}`) : null;
    if (stored) {
      try { setDocLabel(JSON.parse(stored).document_reference || "SWMS"); } catch { /* keep default */ }
    }
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setError("No payment session found. Please contact support.");
      setVerifying(false);
      return;
    }
    async function verifyPayment() {
      try {
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const data = await response.json();
        if (data.success) {
          setPaymentInfo(data.payment);
          // Surface the document page straight away — the sign-off session
          // already exists (created before payment), so this just reuses it
          try {
            const pendingSessionId = sessionStorage.getItem("pending_swms_session");
            const stored = pendingSessionId ? sessionStorage.getItem(`swms_data_${pendingSessionId}`) : null;
            if (stored) {
              const payload = JSON.parse(stored);
              payloadRef.current = payload;
              createSignOff(
                payload.business_name || "",
                payload.swms_data?.scope_of_work || payload.job_description || "",
                payload.state || "",
                payload
              );
            }
          } catch { /* non-critical — the download button path retries */ }
        }
        else setError(data.error || "Payment verification failed. Please contact support.");
      } catch {
        setError("Unable to verify payment. Please contact support.");
      } finally {
        setVerifying(false);
      }
    }
    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function createSignOff(
    businessName: string,
    jobDescription: string,
    state: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    documentPayload?: any
  ) {
    try {
      // Reuse the session from a previous visit: every create mints a NEW
      // code, and signatures collected under the old code silently vanish
      // from copies downloaded under a fresh one
      const docRef = documentPayload?.document_reference;
      const cacheKey = docRef ? `swms_signcode_${docRef}` : null;
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
          business_name: businessName,
          job_description: jobDescription,
          state,
          // Stored server-side so signed re-downloads work from any device
          document: documentPayload,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSignOffUrl(data.sign_url);
        setSignOffCode(data.sign_code);
        if (cacheKey) localStorage.setItem(cacheKey, data.sign_code);
        return data.sign_code;
      }
    } catch { /* not critical */ }
    return null;
  }

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      // Prefer the in-memory copy — sessionStorage may already be cleaned up
      let swmsPayload = payloadRef.current;
      if (!swmsPayload) {
        const pendingSessionId = sessionStorage.getItem("pending_swms_session");
        const storedData = pendingSessionId ? sessionStorage.getItem(`swms_data_${pendingSessionId}`) : null;
        if (!storedData) {
          setDownloadError("SWMS data not found in this browser session. If you closed the tab, please contact support with your payment confirmation.");
          return;
        }
        swmsPayload = JSON.parse(storedData);
        payloadRef.current = swmsPayload;
      }

      const response = await fetch("/api/download/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(swmsPayload),
      });
      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${swmsPayload.document_reference || "SWMS"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloaded(true);

      if (!signOffCode) {
        const signResult = await createSignOff(
          swmsPayload.business_name || "",
          swmsPayload.swms_data?.scope_of_work || swmsPayload.job_description || "",
          swmsPayload.state || "",
          swmsPayload
        );
        if (signResult) {
          try { localStorage.setItem(`swms_doc_${signResult}`, JSON.stringify(swmsPayload)); } catch { /* full — not critical */ }
        }
      }
      // sessionStorage keys are left in place deliberately: they're tab-scoped
      // anyway, and clearing them made every re-download a support ticket.
    } catch {
      setDownloadError("The download hiccupped. Give it another go — your payment is safe.");
    } finally {
      setIsDownloading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signOffCode]);

  if (verifying) {
    return (
      <Shell>
        <div style={{ textAlign: "center", padding: "100px 0", fontFamily: MONO, fontSize: 12, letterSpacing: ".1em", color: "rgba(26,25,23,.6)" }}>
          ▶ VERIFYING YOUR PAYMENT…
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 0", textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".14em", color: "var(--sorange)", marginBottom: 14 }}>⚠ SOMETHING WENT SIDEWAYS</div>
          <h1 style={{ margin: "0 0 16px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(36px,4.5vw,52px)", lineHeight: 0.95, textTransform: "uppercase" }}>Hold up.</h1>
          <p style={{ margin: "0 0 30px", fontSize: 16, color: "rgba(26,25,23,.72)" }}>{error}</p>
          <Link href="/" className="sw-ghost" style={{ padding: "13px 24px", fontSize: 17 }}>BACK TO HOME</Link>
          <p style={{ marginTop: 22, fontFamily: MONO, fontSize: 11, letterSpacing: ".05em", color: "rgba(26,25,23,.5)" }}>
            NEED A HAND? <a href="mailto:support@swmssorted.com.au" style={{ color: "var(--ink)" }}>SUPPORT@SWMSSORTED.COM.AU</a>
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 0", textAlign: "center" }}>
        <div style={{ width: 88, height: 88, margin: "0 auto 28px", border: "2px solid var(--ink)", background: "var(--swa)", boxShadow: "7px 7px 0 var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700 }}>✓</div>
        <h1 style={{ margin: "0 0 12px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(48px,5.4vw,72px)", lineHeight: 0.95, textTransform: "uppercase" }}>Done. Go build.</h1>
        <p style={{ margin: "0 0 34px", fontSize: 16.5, color: "rgba(26,25,23,.72)" }}>Payment sorted — your SWMS is ready. Your receipt and your document link are on their way to your inbox, so nothing gets lost.</p>

        {paymentInfo && (
          <div style={{ border: "2px solid var(--ink)", background: "var(--card)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, marginBottom: 22, fontFamily: MONO, fontSize: 12, textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "rgba(26,25,23,.55)" }}>PLAN</span><span style={{ fontWeight: 600 }}>{paymentInfo.plan === "single" ? "SINGLE SWMS" : "3-PACK"}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "rgba(26,25,23,.55)" }}>AMOUNT</span><span style={{ fontWeight: 600 }}>${(paymentInfo.amount / 100).toFixed(2)} AUD</span></div>
            {paymentInfo.email && (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span style={{ color: "rgba(26,25,23,.55)" }}>RECEIPT TO</span><span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>{paymentInfo.email.toUpperCase()}</span></div>
            )}
            {paymentInfo.plan !== "single" && (
              <div style={{ borderTop: "1px solid rgba(26,25,23,.2)", paddingTop: 8, color: "rgba(26,25,23,.6)", letterSpacing: ".04em" }}>
                2 TOKENS LEFT ON THIS PACK — LINK&apos;S IN YOUR EMAIL, NO ACCOUNT NEEDED
              </div>
            )}
          </div>
        )}

        <div style={{ border: "2px solid var(--ink)", background: "var(--card)", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600 }}>{docLabel}.pdf</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(26,25,23,.55)", marginTop: 3 }}>A4 · PRINT-READY · SIGN-OFF SHEET INCLUDED</div>
          </div>
          <button onClick={handleDownload} disabled={isDownloading} className="sw-btn-ink" style={{ padding: "13px 24px", fontSize: 18, boxShadow: "5px 5px 0 rgba(26,25,23,.3)" }}>
            {isDownloading ? "BUILDING PDF…" : downloaded ? "DOWNLOAD AGAIN ↓" : "DOWNLOAD PDF ↓"}
          </button>
        </div>
        {downloadError && (
          <div style={{ fontFamily: MONO, fontSize: 12, color: "var(--sorange)", marginBottom: 22, textAlign: "left" }}>
            {downloadError.toUpperCase()}
          </div>
        )}

        {signOffUrl && (
          <div style={{ border: "2px solid var(--ink)", background: "var(--card)", padding: "18px 22px", marginBottom: 22, textAlign: "left" }}>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".12em", color: "rgba(26,25,23,.6)", marginBottom: 10 }}>DIGITAL SIGN-OFF — SEND TO THE CREW</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
              <div style={{ flex: 1, minWidth: 200, fontFamily: MONO, fontSize: 12, color: "rgba(26,25,23,.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{signOffUrl}</div>
              <button onClick={() => { navigator.clipboard.writeText(signOffUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="sw-chip-ghost" style={{ padding: "8px 14px", fontSize: 11, fontWeight: 600, letterSpacing: ".08em" }}>
                {copied ? "COPIED ✓" : "COPY LINK"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              <a href={`sms:?body=Sign off on the SWMS before you get to site: ${signOffUrl}`} className="sw-chip-ghost" style={{ padding: "8px 16px", fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textDecoration: "none" }}>TEXT</a>
              <a href={`https://wa.me/?text=${encodeURIComponent(`Sign off on the SWMS before you get to site: ${signOffUrl}`)}`} target="_blank" rel="noopener noreferrer" className="sw-chip-ghost" style={{ padding: "8px 16px", fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textDecoration: "none" }}>WHATSAPP</a>
              <a href={`mailto:?subject=SWMS Sign-Off Required&body=Please sign off on the SWMS before arriving on site: ${signOffUrl}`} className="sw-chip-ghost" style={{ padding: "8px 16px", fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textDecoration: "none" }}>EMAIL</a>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10.5, color: "rgba(26,25,23,.5)" }}>
              CODE: {signOffCode} · VALID 12 MONTHS
            </div>
          </div>
        )}

        {signOffCode && (
          <Link href={`/documents/${signOffCode}`} className="sw-btn" style={{ display: "block", padding: 16, fontSize: 19, marginBottom: 10, textDecoration: "none", textAlign: "center" }}>
            OPEN YOUR DOCUMENT PAGE →
          </Link>
        )}
        {signOffCode && (
          <p style={{ margin: "0 0 22px", fontFamily: MONO, fontSize: 10.5, letterSpacing: ".05em", color: "rgba(26,25,23,.55)" }}>
            RE-DOWNLOADS, TOOLBOX TALK &amp; CREW SIGNATURES LIVE THERE — LINK&apos;S ALSO IN YOUR EMAIL
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
          <Link href="/job" className="sw-ghost" style={{ padding: "13px 24px", fontSize: 17 }}>START ANOTHER SWMS</Link>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", padding: "13px 10px", textDecoration: "none", fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", color: "var(--ink)" }}>BACK TO HOME →</Link>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)", fontFamily: "var(--f-body)" }}>
      <div style={{ background: "var(--paper)", borderBottom: "2px solid var(--ink)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "10px 28px", display: "flex", alignItems: "center" }}>
          <Link href="/" className="sw-link" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 25, height: 25, border: "2px solid var(--ink)", background: "repeating-linear-gradient(-45deg, #1A1917 0 5px, var(--swa) 5px 10px)" }} />
            <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 20, letterSpacing: ".05em", color: "var(--ink)" }}>SWMS SORTED</div>
          </Link>
        </div>
      </div>
      <main style={{ padding: "0 28px" }}>{children}</main>
    </div>
  );
}
