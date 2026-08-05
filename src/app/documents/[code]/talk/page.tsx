"use client";

// On-site Toolbox Talk mode: the tradie reads the briefing off their phone,
// then hands it around the crew for sign-on. Designed for outdoor screens —
// big type, high contrast, works offline once loaded (service worker).

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const MONO = "'IBM Plex Mono', monospace";
const COND = "'Barlow Condensed', sans-serif";

interface TalkData {
  business_name: string;
  state: string;
  document_reference: string;
  toolbox_talk: string;
  hrcw: string[];
  steps: { n: number; title: string; hazards: string[]; residual?: string }[];
  ppe: string[];
  signature_count: number;
}

export default function ToolboxTalkPage() {
  const params = useParams();
  const code = (params.code as string)?.toUpperCase();

  const [data, setData] = useState<TalkData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/sign/talk?code=${code}`);
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || "Couldn't load the talk.");
    } catch {
      setError("No connection and no saved copy on this phone yet. Open this page once with signal and it'll work offline after that.");
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    if (code) load();
  }, [code, load]);

  const paragraphs = (data?.toolbox_talk || "")
    .split(/\n+/)
    .flatMap((p) => p.split(/(?<=[.!?])\s+(?=[A-Z"“])/))
    .reduce<string[]>((acc, sentence) => {
      // Group sentences into readable chunks of ~2
      const last = acc[acc.length - 1];
      if (last && last.split(/[.!?]/).filter(Boolean).length < 2 && last.length < 180) {
        acc[acc.length - 1] = `${last} ${sentence}`;
      } else {
        acc.push(sentence);
      }
      return acc;
    }, [])
    .filter((p) => p.trim());

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)", fontFamily: "var(--f-body)" }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--paper)", borderBottom: "2px solid var(--ink)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Link href={`/documents/${code}`} className="sw-link" style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".1em" }}>← DOCUMENT</Link>
          <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".1em", color: "rgba(26,25,23,.55)" }}>{data?.document_reference || code}</div>
        </div>
        <div style={{ height: 6, background: "repeating-linear-gradient(-45deg, #1A1917 0 14px, var(--swa) 14px 28px)" }} />
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 80px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0", fontFamily: MONO, fontSize: 12, letterSpacing: ".1em", color: "rgba(26,25,23,.6)" }}>
            LOADING THE TALK…
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".14em", color: "var(--sorange)", marginBottom: 14 }}>⚠ CAN&apos;T RUN THE TALK</div>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(26,25,23,.75)" }}>{error}</p>
          </div>
        )}

        {data && (
          <>
            <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".16em", color: "rgba(26,25,23,.6)", marginBottom: 10 }}>
              TOOLBOX TALK — PRE-START BRIEFING
            </div>
            <h1 style={{ margin: "0 0 6px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(34px,8vw,52px)", lineHeight: 0.95, textTransform: "uppercase" }}>
              Gather the crew.
            </h1>
            <p style={{ margin: "0 0 26px", fontFamily: MONO, fontSize: 12, letterSpacing: ".05em", color: "rgba(26,25,23,.6)" }}>
              {data.business_name.toUpperCase()} · {data.state} · READ IT OUT LOUD, THEN PASS THE PHONE AROUND
            </p>

            {/* HRCW warning strip */}
            {data.hrcw.length > 0 && (
              <div style={{ border: "2px solid var(--ink)", background: "var(--swa)", padding: "12px 16px", marginBottom: 18 }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: ".14em", marginBottom: 4 }}>⚠ HIGH-RISK WORK ON THIS JOB</div>
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 500, lineHeight: 1.5 }}>{data.hrcw.join(" · ").toUpperCase()}</div>
              </div>
            )}

            {/* The talk — big readable card per chunk */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {paragraphs.map((p, i) => (
                <div key={i} style={{ border: "2px solid var(--ink)", background: "var(--card)", padding: "18px 20px", boxShadow: "5px 5px 0 rgba(26,25,23,.10)" }}>
                  <div style={{ fontSize: "clamp(18px,4.6vw,22px)", lineHeight: 1.55, fontWeight: 500 }}>{p}</div>
                </div>
              ))}
            </div>

            {/* Today's steps + hazards quick-scan */}
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".14em", color: "rgba(26,25,23,.6)", marginBottom: 10 }}>
              TODAY&apos;S STEPS — CALL OUT THE HAZARDS
            </div>
            <div style={{ border: "2px solid var(--ink)", marginBottom: 18 }}>
              {data.steps.map((s, i) => (
                <div key={s.n} style={{ display: "flex", gap: 12, padding: "10px 14px", borderTop: i > 0 ? "1px solid rgba(26,25,23,.2)" : "none", background: i % 2 ? "rgba(26,25,23,.03)" : "var(--card)" }}>
                  <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 18, minWidth: 22 }}>{s.n}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{s.title}</div>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: "var(--sorange)", marginTop: 2 }}>{s.hazards.join(" · ").toUpperCase()}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* PPE reminder */}
            {data.ppe.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 34 }}>
                {data.ppe.map((p) => (
                  <div key={p} style={{ border: "1px solid var(--ink)", padding: "4px 10px", fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: ".04em" }}>
                    {p.toUpperCase()}
                  </div>
                ))}
              </div>
            )}

            {/* Sign-on CTA */}
            <div style={{ borderTop: "2px solid var(--ink)", paddingTop: 22, textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".12em", color: "rgba(26,25,23,.6)", marginBottom: 14 }}>
                TALK DONE? {data.signature_count > 0 ? `${data.signature_count} ALREADY SIGNED · ` : ""}PASS THE PHONE AROUND —
              </div>
              <Link href={`/sign/${code}?crew=1`} className="sw-btn" style={{ padding: "17px 32px", fontSize: 21 }}>
                CREW SIGN-ON <span style={{ fontFamily: MONO, fontSize: 15 }}>→</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
