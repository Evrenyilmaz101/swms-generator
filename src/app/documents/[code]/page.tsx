"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const MONO = "'IBM Plex Mono', monospace";
const COND = "'Barlow Condensed', sans-serif";

interface SignatureInfo {
  id: string;
  worker_name: string;
  worker_role: string | null;
  signed_at: string;
}

interface DocStatus {
  business_name: string;
  job_description: string;
  worker_count: number;
  signature_count: number;
  signatures: SignatureInfo[];
}

export default function DocumentStatusPage() {
  const params = useParams();
  const code = (params.code as string)?.toUpperCase();

  const [status, setStatus] = useState<DocStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [ownerKey, setOwnerKey] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState("");

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const signOffUrl = `${siteUrl}/sign/${code}`;

  // Fetch status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/sign/status?code=${code}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setStatus(data);
      }
    } catch {
      setError("Failed to load document status");
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    if (!code) return;
    fetchStatus();

    // Owner key: arrives once via the buyer's email link (?key=…) and is
    // then remembered on this device — crew links never carry it
    try {
      const urlKey = new URLSearchParams(window.location.search).get("key");
      if (urlKey) {
        localStorage.setItem(`swms_ownerkey_${code}`, urlKey);
        setOwnerKey(urlKey);
        // Tidy the URL so screenshots / copied links don't leak the key
        window.history.replaceState(null, "", `/documents/${code}`);
      } else {
        setOwnerKey(localStorage.getItem(`swms_ownerkey_${code}`));
      }
    } catch { /* storage unavailable — viewer mode */ }

    // Store in localStorage for return visits
    try {
      const recent = JSON.parse(localStorage.getItem("swms_recent_docs") || "[]");
      if (!recent.includes(code)) {
        recent.unshift(code);
        localStorage.setItem("swms_recent_docs", JSON.stringify(recent.slice(0, 5)));
      }
    } catch {
      // ignore
    }

    // Is a PDF saved on this device for offline use?
    if ("caches" in window) {
      caches.open("swms-docs")
        .then((c) => c.match(`/offline-pdf/${code}`))
        .then((hit) => setOfflineSaved(!!hit))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, fetchStatus]);

  async function removeSignature(sig: SignatureInfo) {
    if (!ownerKey) return;
    if (!window.confirm(`Remove ${sig.worker_name}'s sign-on from this document?`)) return;
    setRemoving(sig.id);
    setRemoveError("");
    try {
      const res = await fetch("/api/sign/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, signature_id: sig.id, owner_key: ownerKey }),
      });
      const data = await res.json();
      if (!data.success) {
        setRemoveError(data.error || "Couldn't remove that signature.");
      } else {
        await fetchStatus();
      }
    } catch {
      setRemoveError("Couldn't remove that signature — check your signal and try again.");
    } finally {
      setRemoving(null);
    }
  }

  // Keep the freshly generated PDF on-device so it opens with no signal
  async function saveOffline(blob: Blob) {
    try {
      if (!("caches" in window)) return;
      const cache = await caches.open("swms-docs");
      await cache.put(
        `/offline-pdf/${code}`,
        new Response(blob, { headers: { "Content-Type": "application/pdf" } })
      );
      setOfflineSaved(true);
    } catch {
      // Offline saving is best-effort
    }
  }

  async function openOfflineCopy() {
    try {
      const cache = await caches.open("swms-docs");
      const hit = await cache.match(`/offline-pdf/${code}`);
      if (!hit) {
        alert("No saved copy on this device yet — download the PDF once with signal first.");
        return;
      }
      const blob = await hit.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      alert("Couldn't open the saved copy.");
    }
  }

  // Re-download with signatures
  async function handleRedownload() {
    setDownloading(true);

    try {
      // Server-first: the document payload is stored in the DB at sign-off
      // creation, so just the code works from any device
      let res = await fetch("/api/sign/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      // Legacy fallback for docs created before server-side storage:
      // retry with the payload this browser saved at purchase time
      if (!res.ok) {
        let stored = localStorage.getItem(`swms_doc_${code}`);
        if (!stored) {
          const pendingId = sessionStorage.getItem("pending_swms_session");
          const dataKey = pendingId ? `swms_data_${pendingId}` : null;
          stored = dataKey ? sessionStorage.getItem(dataKey) : null;
        }
        if (stored) {
          res = await fetch("/api/sign/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, ...JSON.parse(stored) }),
          });
        }
      }

      if (!res.ok) {
        alert("SWMS document data not found for this code. If this is an older document, download from the original browser or re-generate the SWMS.");
        setDownloading(false);
        return;
      }

      const blob = await res.blob();
      await saveOffline(blob); // keep a copy on-device for no-signal sites
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SWMS-${status?.business_name?.replace(/[^a-zA-Z0-9]/g, "_") || "signed"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <Shell>
        <div style={{ textAlign: "center", padding: "110px 0", fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".12em", color: "rgba(26,25,23,.6)" }}>
          ▶ PULLING UP YOUR DOCUMENT…
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "90px 0", textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".14em", color: "var(--sorange)", marginBottom: 14 }}>⚠ DOCUMENT NOT FOUND</div>
          <h1 style={{ margin: "0 0 16px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(36px,4.5vw,52px)", lineHeight: 0.95, textTransform: "uppercase" }}>No dice.</h1>
          <p style={{ margin: "0 0 30px", fontSize: 16, color: "rgba(26,25,23,.72)" }}>{error}</p>
          <Link href="/" className="sw-ghost" style={{ padding: "13px 24px", fontSize: 17 }}>BACK TO HOME</Link>
        </div>
      </Shell>
    );
  }

  if (!status) return null;

  return (
    <Shell>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 0 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 30 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".16em", color: "rgba(26,25,23,.6)", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
              SWMS DOCUMENT
              {ownerKey && (
                <span style={{ background: "var(--swa)", border: "1px solid var(--ink)", padding: "2px 8px", fontSize: 9.5, letterSpacing: ".12em" }}>OWNER</span>
              )}
            </div>
            <h1 style={{ margin: "0 0 8px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(34px,4.5vw,50px)", lineHeight: 0.95, textTransform: "uppercase", overflowWrap: "anywhere" }}>
              {status.business_name}
            </h1>
            <p style={{ margin: 0, fontSize: 15, color: "rgba(26,25,23,.72)", maxWidth: 460 }}>{status.job_description}</p>
          </div>
          <div style={{ textAlign: "right", border: "2px solid var(--ink)", background: "var(--card)", padding: "10px 14px", boxShadow: "5px 5px 0 rgba(26,25,23,.12)" }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 600, letterSpacing: ".12em", color: "rgba(26,25,23,.55)" }}>CODE</div>
            <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 600, letterSpacing: ".1em" }}>{code}</div>
          </div>
        </div>

        {/* Sign-on register */}
        <div style={{ border: "2px solid var(--ink)", background: "var(--card)", boxShadow: "8px 8px 0 rgba(26,25,23,.12)", marginBottom: 26 }}>
          <div style={{ background: "var(--ink)", color: "var(--paper)", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: COND, fontWeight: 800, fontSize: 19, letterSpacing: ".04em" }}>WORKER SIGN-ON</span>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: "rgba(244,241,233,.75)" }}>{status.signature_count} SIGNED</span>
          </div>

          {status.signatures.length > 0 ? (
            <div>
              {status.signatures.map((sig) => {
                const date = new Date(sig.signed_at).toLocaleDateString("en-AU", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                });
                return (
                  <div key={sig.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: "1px solid rgba(26,25,23,.15)" }}>
                    <div style={{ width: 22, height: 22, border: "2px solid var(--ink)", background: "#3F9C55", color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600, overflowWrap: "anywhere" }}>{sig.worker_name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10.5, color: "rgba(26,25,23,.55)", letterSpacing: ".04em" }}>{(sig.worker_role || "WORKER").toUpperCase()}</div>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 10.5, color: "rgba(26,25,23,.5)", whiteSpace: "nowrap" }}>{date.toUpperCase()}</div>
                    {ownerKey && (
                      <button
                        onClick={() => removeSignature(sig)}
                        disabled={removing === sig.id}
                        style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: ".08em", color: "#7A1B0C", padding: "4px 2px", flexShrink: 0 }}
                      >
                        {removing === sig.id ? "…" : "✕ REMOVE"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: "26px 16px", textAlign: "center", fontFamily: MONO, fontSize: 12, color: "rgba(26,25,23,.5)", letterSpacing: ".06em" }}>
              NO SIGNATURES YET — SEND THE CREW THE LINK BELOW
            </div>
          )}
          {removeError && (
            <div style={{ padding: "10px 16px", fontFamily: MONO, fontSize: 11.5, fontWeight: 600, color: "var(--sorange)", borderTop: "1px solid rgba(26,25,23,.15)" }}>{removeError.toUpperCase()}</div>
          )}

          {/* Share link */}
          <div style={{ padding: "14px 16px", borderTop: "2px solid var(--ink)" }}>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".12em", color: "rgba(26,25,23,.6)", marginBottom: 8 }}>CREW SIGN-OFF LINK</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 180, fontFamily: MONO, fontSize: 12, color: "rgba(26,25,23,.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", border: "1px solid rgba(26,25,23,.3)", background: "var(--paper)", padding: "8px 10px" }}>{signOffUrl}</div>
              <button
                onClick={() => { navigator.clipboard.writeText(signOffUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="sw-chip-ghost"
                style={{ padding: "8px 14px", fontSize: 11, fontWeight: 600, letterSpacing: ".08em" }}
              >
                {copied ? "COPIED ✓" : "COPY"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a href={`sms:?body=Sign off on the SWMS before you get to site: ${signOffUrl}`} className="sw-chip-ghost" style={{ padding: "7px 14px", fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textDecoration: "none" }}>TEXT</a>
              <a href={`https://wa.me/?text=${encodeURIComponent(`Sign off on the SWMS before you get to site: ${signOffUrl}`)}`} target="_blank" rel="noopener noreferrer" className="sw-chip-ghost" style={{ padding: "7px 14px", fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textDecoration: "none" }}>WHATSAPP</a>
              <a href={`mailto:?subject=SWMS Sign-Off&body=Sign off on the SWMS: ${signOffUrl}`} className="sw-chip-ghost" style={{ padding: "7px 14px", fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textDecoration: "none" }}>EMAIL</a>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href={`/documents/${code}/talk`} className="sw-btn" style={{ display: "block", padding: 16, fontSize: 19, textAlign: "center", textDecoration: "none" }}>
            RUN TOOLBOX TALK &amp; CREW SIGN-ON →
          </Link>
          <button onClick={handleRedownload} disabled={downloading} className="sw-btn-ink" style={{ width: "100%", padding: 15, fontSize: 18 }}>
            {downloading ? "BUILDING YOUR PDF…" : "DOWNLOAD PDF WITH SIGNATURES ↓"}
          </button>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {offlineSaved && (
              <button onClick={openOfflineCopy} className="sw-ghost" style={{ flex: 1, minWidth: 200, padding: "11px 16px", fontSize: 14 }}>
                OPEN SAVED COPY (OFFLINE OK)
              </button>
            )}
            <button onClick={fetchStatus} className="sw-ghost" style={{ flex: 1, minWidth: 140, padding: "11px 16px", fontSize: 14 }}>
              REFRESH ⟳
            </button>
          </div>
        </div>

        <p style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", color: "rgba(26,25,23,.5)", textAlign: "center", marginTop: 26 }}>
          BOOKMARK THIS PAGE — CODE VALID 12 MONTHS
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 10, background: "repeating-linear-gradient(-45deg, #1A1917 0 10px, var(--swa) 10px 20px)", borderBottom: "2px solid var(--ink)" }} />
      <header style={{ borderBottom: "2px solid var(--ink)", background: "var(--paper)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--ink)" }}>
            <div style={{ width: 24, height: 24, border: "2px solid var(--ink)", background: "repeating-linear-gradient(-45deg, #1A1917 0 6px, var(--swa) 6px 12px)" }} />
            <span style={{ fontFamily: COND, fontWeight: 800, fontSize: 19, letterSpacing: ".04em" }}>SWMS SORTED</span>
          </Link>
          <Link href="/job" style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 600, letterSpacing: ".1em", color: "var(--ink)", textDecoration: "none" }}>
            NEW SWMS →
          </Link>
        </div>
      </header>
      <main style={{ padding: "0 20px", flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
