"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ── Design tokens (see globals.css :root for CSS vars) ── */
const MONO = "'IBM Plex Mono', monospace";
const COND = "'Barlow Condensed', sans-serif";
const STRIPE = (px: number) =>
  `repeating-linear-gradient(-45deg, #1A1917 0 ${px}px, var(--swa) ${px}px ${px * 2}px)`;

/* ── Live demo data (verbatim from design handoff) ── */
type DemoRow = { step: string; hz: string; r1: Risk; ctrl: string; r2: Risk };
type Risk = "H" | "M" | "L";
const RISK: Record<Risk, [string, string]> = {
  H: ["#D6491B", "#fff"],
  M: ["#E3B90F", "#1A1917"],
  L: ["#3F9C55", "#fff"],
};
const TRADES: [string, string][] = [
  ["roofer", "ROOFER"],
  ["sparky", "SPARKY"],
  ["concreter", "CONCRETER"],
  ["excavator", "EXCAVATOR"],
];
const DEMO: Record<string, DemoRow[]> = {
  roofer: [
    { step: "1. Install edge protection", hz: "FALLS >2M · FALLING OBJECTS", r1: "H", ctrl: "Guardrail to AS 4994 installed by ticketed crew; no-go zone below the work face.", r2: "M" },
    { step: "2. Strip existing tiles", hz: "ASBESTOS (PRE-1990) · DUST", r1: "H", ctrl: "Pre-start asbestos check — stop work and call a licensed assessor if suspect; P2 masks.", r2: "M" },
    { step: "3. Fix Colorbond sheets", hz: "WIND-CAUGHT SHEETS · POWER TOOLS", r1: "H", ctrl: "No sheet handling in winds over 35km/h; sheets passed hand-to-hand; RCD-protected tools.", r2: "M" },
    { step: "4. Waste off-site", hz: "MANUAL HANDLING", r1: "M", ctrl: "Waste lowered by chute — nothing dropped from height; team lifts over 20kg.", r2: "L" },
  ],
  sparky: [
    { step: "1. Isolate & prove dead", hz: "CONTACT WITH ENERGISED PARTS", r1: "H", ctrl: "Lock-out tag-out at the main; test for dead before touching any conductor.", r2: "L" },
    { step: "2. Remove old switchboard", hz: "ASBESTOS BACKING PANEL", r1: "H", ctrl: "Pre-1990 panels treated as ACM — licensed removal, never drilled or broken.", r2: "M" },
    { step: "3. Fit & wire new board", hz: "ARC FLASH · HAND TOOLS", r1: "H", ctrl: "Insulated tools only; arc-rated PPE; circuits labelled as terminated.", r2: "M" },
    { step: "4. Test & re-energise", hz: "SHOCK ON RE-ENERGISE", r1: "M", ctrl: "Staged re-energise; RCD trip times tested and logged before handover.", r2: "L" },
  ],
  concreter: [
    { step: "1. Formwork & mesh", hz: "MANUAL HANDLING · SHARPS", r1: "M", ctrl: "Team lifts on forms; caps on all starter bars; gloves for mesh handling.", r2: "L" },
    { step: "2. Pump & pour", hz: "LINE WHIP · PLANT MOVEMENT", r1: "H", ctrl: "Exclusion zone around the boom; spotter for the agi truck; hoses clamped.", r2: "M" },
    { step: "3. Screed & finish", hz: "CONCRETE BURNS", r1: "M", ctrl: "Gloves and eye protection worn; wash water on site for skin contact.", r2: "L" },
    { step: "4. Cut control joints", hz: "SILICA DUST", r1: "H", ctrl: "Wet cutting only — no dry cuts; P2 respirators; bystanders cleared.", r2: "M" },
  ],
  excavator: [
    { step: "1. Locate services", hz: "UNDERGROUND SERVICE STRIKE", r1: "H", ctrl: "DBYD plans on site; potholing by hand within 500mm of marked services.", r2: "M" },
    { step: "2. Excavate trench", hz: "COLLAPSE · ENGULFMENT", r1: "H", ctrl: "Batter, bench or shore anything over 1.5m; spoil kept 1m back from the edge.", r2: "M" },
    { step: "3. Work in trench", hz: "FALLS · ACCESS", r1: "H", ctrl: "Ladder access within 9m of workers; no entry to unprotected sections.", r2: "M" },
    { step: "4. Backfill & compact", hz: "PLANT + PEDESTRIANS", r1: "M", ctrl: "Spotter when reversing; exclusion zone held until reinstatement done.", r2: "L" },
  ],
};

const eyebrow: React.CSSProperties = {
  fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".16em",
  marginBottom: 14, color: "rgba(26,25,23,.6)",
};
const h2Style: React.CSSProperties = {
  margin: 0, fontFamily: COND, fontWeight: 800,
  fontSize: "clamp(40px,4.4vw,60px)", lineHeight: 1, textTransform: "uppercase",
};
const monoLabel = (extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: MONO, fontWeight: 600, ...extra,
});

function RiskChip({ r, size = 11 }: { r: Risk; size?: number }) {
  const [bg, fg] = RISK[r];
  return (
    <span style={{ background: bg, color: fg, padding: "2px 8px", fontFamily: MONO, fontSize: size, fontWeight: 600 }}>
      {r}
    </span>
  );
}

export default function Home() {
  // Animations arm only once the page is painting — a render stall can
  // never leave animated content invisible.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  /* Scroll progress bar */
  const progressRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const el = progressRef.current;
      if (!el) return;
      const h = document.documentElement;
      el.style.width = Math.min(100, (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100) + "%";
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, []);

  /* Scroll reveals for [data-rv] blocks */
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(pageRef.current?.querySelectorAll<HTMLElement>("[data-rv]") ?? []);
    els.forEach((el) => { el.style.opacity = "0"; el.style.transform = "translateY(26px)"; });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target as HTMLElement;
        const d = +(el.getAttribute("data-rvd") || 0);
        el.style.transition = `opacity .65s ease ${d}ms, transform .65s cubic-bezier(.2,.7,.3,1) ${d}ms`;
        el.style.opacity = "1";
        el.style.transform = "none";
        io.unobserve(el);
      }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* Live demo — starts when section scrolls into view */
  const [trade, setTrade] = useState("roofer");
  const [rev, setRev] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const demoRef = useRef<HTMLDivElement>(null);
  const startDemo = (t: string) => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setTrade(t);
    setRev(0);
    [1, 2, 3, 4, 5].forEach((v) =>
      timersRef.current.push(setTimeout(() => setRev(v), 430 * v + 150))
    );
  };
  useEffect(() => {
    const el = demoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((en) => {
        if (!en.isIntersecting) return;
        startDemo("roofer");
        io.disconnect();
      }),
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => { io.disconnect(); timersRef.current.forEach(clearTimeout); };
  }, []);

  const demoRows = DEMO[trade];
  const demoDone = rev >= 5;
  const hzN = demoRows.reduce((a, r) => a + r.hz.split("·").length, 0);

  return (
    <div
      ref={pageRef}
      className={ready ? "sw-ready" : ""}
      style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)", fontFamily: "var(--f-body)" }}
    >
      {/* ═══════════ NAV ═══════════ */}
      <div style={{ position: "sticky", top: 0, zIndex: 60, background: "var(--paper)", borderBottom: "2px solid var(--ink)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "10px 32px", minHeight: 46, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px 24px" }}>
          <Link href="/" className="sw-link" style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 28, height: 28, border: "2px solid var(--ink)", background: STRIPE(6) }} />
            <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 23, letterSpacing: ".05em", color: "var(--ink)" }}>SWMS SORTED</div>
          </Link>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 28px", fontFamily: MONO, fontSize: 12, fontWeight: 500, letterSpacing: ".08em" }}>
            <a href="#how" className="sw-link">HOW IT WORKS</a>
            <a href="#sample" className="sw-link">WHAT YOU GET</a>
            <a href="#pricing" className="sw-link">PRICING</a>
            <a href="#faq" className="sw-link">FAQ</a>
          </div>
          <Link href="/job" className="sw-btn sw-btn-sm" style={{ padding: "10px 20px", fontSize: 17 }}>BUILD YOUR SWMS</Link>
        </div>
        <div style={{ height: 4, background: "rgba(26,25,23,.08)" }}>
          <div ref={progressRef} style={{ height: "100%", width: "0%", background: STRIPE(12) }} />
        </div>
      </div>

      {/* ═══════════ HERO ═══════════ */}
      <div style={{ borderBottom: "2px solid var(--ink)", overflow: "hidden" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 32px 84px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,470px),1fr))", gap: 56, alignItems: "center" }}>
          <div>
            <div className="swHeroRise" style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28, animationDelay: ".05s" }}>
              <div style={{ background: "var(--ink)", color: "var(--paper)", padding: "7px 13px", ...monoLabel({ fontSize: 11.5, letterSpacing: ".12em" }) }}>BUILT FOR AUSSIE TRADES</div>
              <div style={{ border: "2px solid var(--ink)", padding: "5px 13px", ...monoLabel({ fontSize: 11.5, letterSpacing: ".12em" }) }}>WHS-COMPLIANT · ALL 8 STATES</div>
            </div>
            <h1 className="swHeroRise" style={{ margin: "0 0 24px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(56px,6.6vw,94px)", lineHeight: 0.94, letterSpacing: "-.005em", textTransform: "uppercase", animationDelay: ".12s" }}>
              SWMS SORTED BEFORE THE{" "}
              <span style={{ background: "var(--swa)", padding: "0 10px", boxShadow: "4px 4px 0 var(--ink)", display: "inline-block" }}>KETTLE&apos;S</span>{" "}
              BOILED.
            </h1>
            <p className="swHeroRise" style={{ margin: "0 0 34px", maxWidth: 540, fontSize: 18, lineHeight: 1.6, color: "rgba(26,25,23,.78)", animationDelay: ".2s" }}>
              Describe the job like you&apos;d tell your apprentice — type it, talk it, or snap a photo. We build the job steps, hazards, controls and PPE for your state, ready to sign and take to site. No templates, no account.
            </p>
            <div className="swHeroRise" style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 34, animationDelay: ".28s" }}>
              <Link href="/job" className="sw-btn" style={{ padding: "17px 30px", fontSize: 21 }}>
                BUILD YOUR SWMS <span style={{ fontFamily: MONO, fontSize: 16 }}>→</span>
              </Link>
              <a href="#sample" className="sw-ghost" style={{ padding: "17px 30px", fontSize: 21 }}>SEE WHAT YOU GET</a>
            </div>
            <div className="swHeroRise" style={{ display: "flex", flexWrap: "wrap", gap: 22, fontFamily: MONO, fontSize: 12, fontWeight: 500, letterSpacing: ".06em", color: "rgba(26,25,23,.75)", animationDelay: ".36s" }}>
              <span>✓ NO SIGN-UP</span><span>✓ PAY WHEN IT&apos;S READY</span><span>✓ FROM $7.99</span>
            </div>
          </div>

          {/* Document mock */}
          <div style={{ position: "relative", minHeight: 660, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="swHeroDoc2" style={{ position: "absolute", width: "min(400px,82vw)", aspectRatio: "1/1.414", background: "#EAE6DA", border: "2px solid var(--ink)", transform: "rotate(4deg) translate(30px,-16px)" }} />
            <div className="swHeroDoc" style={{ position: "relative", width: "min(418px,86vw)", aspectRatio: "1/1.414", background: "var(--card)", border: "2px solid var(--ink)", transform: "rotate(-2deg)", boxShadow: "12px 12px 0 rgba(26,25,23,.18)", padding: 20, display: "flex", flexDirection: "column", gap: 9 }}>
              <div style={{ height: 10, background: STRIPE(8), border: "1px solid var(--ink)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 17.5, letterSpacing: ".02em" }}>SAFE WORK METHOD STATEMENT</div>
                <div style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 600, whiteSpace: "nowrap" }}>SWMS-2608-041 · REV A</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--ink)", border: "1px solid var(--ink)" }}>
                {[
                  ["PCBU", "Harbour City Roofing Pty Ltd", 1],
                  ["PRINCIPAL CONTRACTOR", "MG Constructions", 1],
                  ["DATE", "02 AUG 2026", 1],
                  ["PROJECT / LOCATION", "Roof replacement — 14 Keeler St, Parramatta NSW", 2],
                  ["STATE / REGS", "NSW · WHS Reg 2017", 1],
                ].map(([label, val, span]) => (
                  <div key={label as string} style={{ background: "var(--card)", padding: "5px 7px", gridColumn: span === 2 ? "span 2" : undefined }}>
                    <div style={{ fontFamily: MONO, fontSize: 5.5, letterSpacing: ".1em", color: "rgba(26,25,23,.55)" }}>{label}</div>
                    <div style={{ fontSize: 8, fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                <div style={{ fontFamily: MONO, fontSize: 6, letterSpacing: ".1em", color: "rgba(26,25,23,.55)" }}>HRCW:</div>
                {["FALL RISK >2M", "ASBESTOS (POTENTIAL)"].map((h) => (
                  <div key={h} style={{ border: "1px solid var(--ink)", padding: "2px 6px", fontFamily: MONO, fontSize: 6.5, fontWeight: 600, background: "var(--swa)" }}>{h}</div>
                ))}
              </div>
              <div style={{ border: "1px solid var(--ink)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr .38fr 1.5fr .38fr", background: "var(--ink)", color: "var(--paper)" }}>
                  {["JOB STEP", "HAZARDS", "RISK", "CONTROL MEASURES", "RES."].map((h) => (
                    <div key={h} style={{ padding: "3px 6px", fontFamily: MONO, fontSize: 5.5, letterSpacing: ".08em" }}>{h}</div>
                  ))}
                </div>
                {[
                  ["1. Site set-up & access", "Public access · deliveries", "M", "Exclusion zone + signage; deliveries booked off-peak", "L"],
                  ["2. Install edge protection", "Falls >2m · falling objects", "H", "Guardrail to AS 4994 by ticketed crew; no-go zone below", "M"],
                  ["3. Strip existing tiles", "Falls · asbestos · dust", "H", "Pre-start asbestos check — stop work if suspect; P2 masks", "M"],
                ].map(([step, hz, r1, ctrl, r2]) => (
                  <div key={step as string} style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr .38fr 1.5fr .38fr", borderTop: "1px solid rgba(26,25,23,.25)" }}>
                    <div style={{ padding: "4px 6px", fontSize: 7, fontWeight: 600 }}>{step}</div>
                    <div style={{ padding: "4px 6px", fontSize: 6.8, color: "rgba(26,25,23,.8)" }}>{hz}</div>
                    <div style={{ padding: "4px 6px" }}><span style={{ background: RISK[r1 as Risk][0], color: RISK[r1 as Risk][1], padding: "1px 4px", fontFamily: MONO, fontSize: 6, fontWeight: 600 }}>{r1}</span></div>
                    <div style={{ padding: "4px 6px", fontSize: 6.8, color: "rgba(26,25,23,.8)" }}>{ctrl}</div>
                    <div style={{ padding: "4px 6px" }}><span style={{ background: RISK[r2 as Risk][0], color: RISK[r2 as Risk][1], padding: "1px 4px", fontFamily: MONO, fontSize: 6, fontWeight: 600 }}>{r2}</span></div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <div style={{ fontFamily: MONO, fontSize: 6, letterSpacing: ".1em", color: "rgba(26,25,23,.55)" }}>PPE:</div>
                {["HARD HAT", "HI-VIS", "BOOTS", "GLOVES", "HARNESS", "P2 MASK"].map((p) => (
                  <div key={p} style={{ border: "1px solid var(--ink)", padding: "2px 6px", fontFamily: MONO, fontSize: 6.5, fontWeight: 600 }}>{p}</div>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {["PREPARED BY / SIGNATURE", "REVIEWED BY (COMPETENT PERSON)"].map((s) => (
                  <div key={s}>
                    <div style={{ borderBottom: "1px solid var(--ink)", height: 16 }} />
                    <div style={{ fontFamily: MONO, fontSize: 5.5, letterSpacing: ".1em", color: "rgba(26,25,23,.55)", marginTop: 3 }}>{s}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 5.5, color: "rgba(26,25,23,.5)" }}>
                <span>SWMS SORTED · GENERATED 02/08/2026</span><span>PAGE 1 OF 6</span>
              </div>
            </div>
            <div className="swHeroStamp" style={{ position: "absolute", top: 44, right: -2, transform: "rotate(-9deg)", border: "3px solid var(--sorange)", color: "var(--sorange)", padding: "8px 14px", fontFamily: MONO, fontWeight: 600, fontSize: 13, letterSpacing: ".14em", background: "rgba(253,252,247,.85)" }}>GENERATED IN 47 SEC</div>
            <div className="swHeroTag" style={{ position: "absolute", bottom: 30, left: 2, transform: "rotate(2.5deg)", background: "var(--swa)", border: "2px solid var(--ink)", boxShadow: "5px 5px 0 var(--ink)", padding: "9px 16px", fontFamily: COND, fontWeight: 700, fontSize: 17, letterSpacing: ".06em" }}>READY TO SIGN. READY FOR SITE.</div>
          </div>
        </div>
      </div>

      {/* ═══════════ TRADE TICKER ═══════════ */}
      <div style={{ background: "var(--ink)", color: "var(--paper)", borderBottom: "2px solid var(--ink)", overflow: "hidden", padding: "13px 0" }} aria-hidden="true">
        <div className="sw-marquee">
          {[0, 1].map((copy) => (
            <div key={copy} style={{ fontFamily: COND, fontWeight: 700, fontSize: 19, letterSpacing: ".18em", whiteSpace: "nowrap" }}>
              {["SPARKIES", "CHIPPIES", "PLUMBERS", "ROOFERS", "CONCRETERS", "SCAFFOLDERS", "PAINTERS", "GLAZIERS", "DEMO CREWS", "EXCAVATORS", "TILERS", "BRICKIES"].map((t) => (
                <span key={t}>{t} <span style={{ color: "var(--swa)" }}>✦</span>{" "}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ LIVE DEMO ═══════════ */}
      <div ref={demoRef} style={{ borderBottom: "2px solid var(--ink)", background: "var(--paper)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "88px 32px 92px" }}>
          <div data-rv="1" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap", marginBottom: 34 }}>
            <div>
              <div style={eyebrow}>DEMO — THE 60-SECOND BIT</div>
              <h2 style={h2Style}>Pick a trade. Watch it write.</h2>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TRADES.map(([key, label]) => (
                <button key={key} onClick={() => startDemo(key)} style={{ border: "2px solid var(--ink)", padding: "10px 18px", cursor: "pointer", fontFamily: COND, fontWeight: 700, fontSize: 17, letterSpacing: ".08em", background: trade === key ? "var(--ink)" : "transparent", color: trade === key ? "var(--paper)" : "var(--ink)" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div data-rv="1" data-rvd="120" style={{ border: "2px solid var(--ink)", background: "var(--card)", boxShadow: "8px 8px 0 rgba(26,25,23,.12)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr .5fr 1.7fr .5fr", background: "var(--ink)", color: "var(--paper)" }}>
              {["JOB STEP", "HAZARDS", "RISK", "CONTROL MEASURES", "RESIDUAL"].map((h) => (
                <div key={h} style={{ padding: "8px 14px", fontFamily: MONO, fontSize: 10, letterSpacing: ".1em" }}>{h}</div>
              ))}
            </div>
            {demoRows.map((r, i) => (
              <div key={`${trade}-${i}`} style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr .5fr 1.7fr .5fr", borderTop: "1px solid rgba(26,25,23,.18)", opacity: rev > i ? 1 : 0, transform: rev > i ? "none" : "translateY(8px)", transition: "opacity .35s ease, transform .35s ease" }}>
                <div style={{ padding: "13px 14px", fontWeight: 600, fontSize: 14.5 }}>{r.step}</div>
                <div style={{ padding: "13px 14px", fontFamily: MONO, fontSize: 11.5, lineHeight: 1.5, color: "var(--sorange)" }}>{r.hz}</div>
                <div style={{ padding: "13px 14px" }}><RiskChip r={r.r1} /></div>
                <div style={{ padding: "13px 14px", fontSize: 13.5, lineHeight: 1.5, color: "rgba(26,25,23,.85)" }}>{r.ctrl}</div>
                <div style={{ padding: "13px 14px" }}><RiskChip r={r.r2} /></div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", borderTop: "2px solid var(--ink)", padding: 14, background: "var(--paper)" }}>
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".08em", color: demoDone ? "#3F9C55" : "var(--sorange)" }}>
                {demoDone ? `✓ DONE — 4 STEPS, ${hzN} HAZARDS, 2.1 SEC` : "▶ WRITING THE METHOD…"}
              </div>
              <Link href="/job" className="sw-btn sw-btn-sm" style={{ padding: "9px 18px", fontSize: 18 }}>NOW DO YOURS →</Link>
            </div>
          </div>
          <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 11, letterSpacing: ".06em", color: "rgba(26,25,23,.5)" }}>
            CONDENSED FOR THE DEMO — YOUR REAL SWMS RUNS THE FULL METHOD, PPE + EMERGENCY PLAN.
          </div>
        </div>
      </div>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <div id="how" style={{ borderBottom: "2px solid var(--ink)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "92px 32px 96px" }}>
          <div data-rv="1" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginBottom: 44, flexWrap: "wrap" }}>
            <div>
              <div style={eyebrow}>HOW IT WORKS — 01 → 03</div>
              <h2 style={h2Style}>THREE STEPS. NO DRAMA.</h2>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: ".04em", color: "rgba(26,25,23,.6)", maxWidth: 260, textAlign: "right" }}>
              YOUR SMOKO TAKES LONGER THAN THIS.
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 2, background: "var(--ink)", border: "2px solid var(--ink)" }}>
            {/* 01 */}
            <div data-rv="1" style={{ flex: "1 1 290px", background: "var(--paper)", padding: "32px 30px 34px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 64, lineHeight: 1, color: "transparent", WebkitTextStroke: "1.5px var(--ink)" }}>01</div>
              <div style={{ fontFamily: COND, fontWeight: 700, fontSize: 27, letterSpacing: ".02em", textTransform: "uppercase" }}>Tell us the job</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "rgba(26,25,23,.75)" }}>Type it, say it, or snap a photo of the site. Use whatever slang you want — sparky, chippie, dogman. We speak tradie.</p>
              <div style={{ marginTop: "auto", border: "2px solid var(--ink)", background: "var(--card)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, background: "var(--sorange)", borderRadius: "50%", animation: "swPulse 1.4s infinite" }} />
                <div style={{ fontFamily: MONO, fontSize: 12, color: "rgba(26,25,23,.75)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  two-storey re-roof, colorbond, crew of 3<span style={{ animation: "swBlink 1.1s step-end infinite" }}>▌</span>
                </div>
              </div>
            </div>
            {/* 02 */}
            <div data-rv="1" data-rvd="110" style={{ flex: "1 1 290px", background: "var(--paper)", padding: "32px 30px 34px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 64, lineHeight: 1, color: "transparent", WebkitTextStroke: "1.5px var(--ink)" }}>02</div>
              <div style={{ fontFamily: COND, fontWeight: 700, fontSize: 27, letterSpacing: ".02em", textTransform: "uppercase" }}>We build the doc</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "rgba(26,25,23,.75)" }}>Job steps, hazards, controls, PPE, emergency procedures — matched to your state&apos;s WHS regs, with high-risk work flagged.</p>
              <div style={{ marginTop: "auto", border: "2px solid var(--ink)", background: "var(--card)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 5, fontFamily: MONO, fontSize: 11.5 }}>
                <div>15 HAZARDS MATCHED <span style={{ color: "#3F9C55", fontWeight: 600 }}>✓</span></div>
                <div>CONTROLS + PPE WRITTEN <span style={{ color: "#3F9C55", fontWeight: 600 }}>✓</span></div>
                <div>2 HRCW CATEGORIES FLAGGED <span style={{ color: "#3F9C55", fontWeight: 600 }}>✓</span></div>
              </div>
            </div>
            {/* 03 */}
            <div data-rv="1" data-rvd="220" style={{ flex: "1 1 290px", background: "var(--paper)", padding: "32px 30px 34px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 64, lineHeight: 1, color: "transparent", WebkitTextStroke: "1.5px var(--ink)" }}>03</div>
              <div style={{ fontFamily: COND, fontWeight: 700, fontSize: 27, letterSpacing: ".02em", textTransform: "uppercase" }}>Sign &amp; go</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "rgba(26,25,23,.75)" }}>Review it, tweak anything, pay, download the A4 PDF. Rock up with the paperwork sorted and get on with the actual job.</p>
              <div style={{ marginTop: "auto", border: "2px solid var(--ink)", background: "var(--ink)", color: "var(--paper)", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 12 }}>
                <span>SWMS-2608-041.pdf · 6 PAGES</span>
                <span style={{ background: "var(--swa)", color: "var(--ink)", padding: "2px 8px", fontWeight: 600 }}>↓ PDF</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ VOICE + PHOTO ═══════════ */}
      <div style={{ borderBottom: "2px solid var(--ink)", background: "var(--paper2)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "92px 32px 96px" }}>
          <div style={eyebrow}>INPUT — ANY WAY YOU LIKE</div>
          <h2 data-rv="1" style={{ ...h2Style, margin: "0 0 44px" }}>Not your grandpa&apos;s safety form.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: 2, background: "var(--ink)", border: "2px solid var(--ink)" }}>
            {/* Voice */}
            <div data-rv="1" style={{ background: "var(--paper)", padding: "36px 34px", display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "inline-flex" }}><div style={{ background: "var(--ink)", color: "var(--paper)", padding: "6px 12px", fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".14em" }}>VOICE INPUT</div></div>
              <div style={{ fontFamily: COND, fontWeight: 700, fontSize: 32, textTransform: "uppercase" }}>Talk it out.</div>
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "rgba(26,25,23,.75)", maxWidth: 460 }}>Can&apos;t be bothered typing? Tap the mic and describe the job — slang and all. A twenty-second ramble comes out the other side as proper job steps, hazards and controls.</p>
              <div style={{ border: "2px solid var(--ink)", background: "var(--card)", padding: 18, display: "flex", flexDirection: "column", gap: 14, marginTop: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 46, height: 46, border: "2px solid var(--ink)", background: "var(--swa)", display: "flex", alignItems: "center", justifyContent: "center", animation: "swPulse 1.6s infinite", flexShrink: 0 }}>
                    <div style={{ width: 12, height: 12, background: "var(--sorange)", borderRadius: "50%" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 30 }}>
                    {[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((d) => (
                      <div key={d} style={{ width: 4, height: "100%", background: "var(--ink)", animation: `swBar 1s ease-in-out ${d}s infinite`, transformOrigin: "bottom" }} />
                    ))}
                  </div>
                  <div style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".1em", color: "var(--sorange)" }}>● REC 0:14</div>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.6, color: "rgba(26,25,23,.8)" }}>
                  &quot;Roof replacement on a two-storey in Parramatta. Ripping off the tiles, re-sheeting with Colorbond, crew of three…&quot;
                </div>
              </div>
            </div>
            {/* Photo */}
            <div data-rv="1" data-rvd="130" style={{ background: "var(--paper)", padding: "36px 34px", display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "inline-flex" }}><div style={{ background: "var(--ink)", color: "var(--paper)", padding: "6px 12px", fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".14em" }}>PHOTO SCAN</div></div>
              <div style={{ fontFamily: COND, fontWeight: 700, fontSize: 32, textTransform: "uppercase" }}>Snap the site.</div>
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "rgba(26,25,23,.75)", maxWidth: 460 }}>Photo of the work area in, hazards out. Overhead lines, open penetrations, missing edge protection — spotted and written straight into the document.</p>
              <div style={{ border: "2px solid var(--ink)", background: "var(--card)", padding: 18, display: "flex", flexDirection: "column", gap: 12, marginTop: "auto" }}>
                <div style={{ height: 150, border: "2px dashed rgba(26,25,23,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11, letterSpacing: ".08em", color: "rgba(26,25,23,.45)", background: "repeating-linear-gradient(-45deg, transparent 0 14px, rgba(26,25,23,.03) 14px 28px)" }}>
                  JOB-SITE PHOTO
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".12em", color: "rgba(26,25,23,.6)" }}>HAZARDS DETECTED</div>
                  <div style={{ background: "var(--sorange)", color: "#fff", fontFamily: MONO, fontSize: 11, fontWeight: 600, padding: "2px 8px" }}>3</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: MONO, fontSize: 12 }}>
                  {["OPEN TRENCH — NO BARRIERS", "MISSING EDGE PROTECTION AT 4M", "OVERHEAD POWER WITHIN 3M"].map((h) => (
                    <div key={h} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 9, height: 9, background: "var(--sorange)", flexShrink: 0 }} />{h}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ WHAT YOU GET ═══════════ */}
      <div id="sample" style={{ borderBottom: "2px solid var(--ink)", overflow: "hidden" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "92px 32px 96px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,430px),1fr))", gap: 64, alignItems: "center" }}>
          <div data-rv="1">
            <div style={eyebrow}>THE DOCUMENT</div>
            <h2 style={{ ...h2Style, margin: "0 0 18px" }}>What lands in your PDF.</h2>
            <p style={{ margin: "0 0 36px", fontSize: 16, lineHeight: 1.6, color: "rgba(26,25,23,.75)", maxWidth: 520 }}>
              Every SWMS follows the Safe Work Australia model format — the layout builders and site supervisors expect to see at induction.
            </p>
            <div style={{ display: "flex", flexDirection: "column", borderTop: "2px solid var(--ink)" }}>
              {[
                "Project & PCBU details",
                "High-risk construction work categories",
                "Job steps with hazards & controls",
                "Risk matrix — before & after controls",
                "PPE & plant register",
                "Permits & emergency procedures",
                "Worker sign-off sheet",
              ].map((title, i, arr) => (
                <div key={title} style={{ display: "flex", gap: 18, alignItems: "baseline", padding: "13px 4px", borderBottom: i === arr.length - 1 ? "2px solid var(--ink)" : "1px solid rgba(26,25,23,.25)" }}>
                  <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: "rgba(26,25,23,.5)" }}>{String(i + 1).padStart(2, "0")}</div>
                  <div style={{ fontFamily: COND, fontWeight: 700, fontSize: 21, letterSpacing: ".02em", textTransform: "uppercase" }}>{title}</div>
                </div>
              ))}
            </div>
            <a href="/sample-swms.pdf" target="_blank" rel="noopener noreferrer" className="sw-btn-ink" style={{ display: "inline-flex", padding: "14px 26px", fontSize: 18, marginTop: 26, textDecoration: "none" }}>
              READ A FULL SAMPLE — FREE ↗
            </a>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".06em", color: "rgba(26,25,23,.55)", marginTop: 10 }}>
              REAL 5-PAGE DOCUMENT · ROOF REPLACEMENT, PARRAMATTA · NO EMAIL NEEDED
            </div>
          </div>
          <div data-rv="1" data-rvd="150" style={{ position: "relative", minHeight: 560, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", width: 330, aspectRatio: "1/1.414", background: "#EAE6DA", border: "2px solid var(--ink)", transform: "rotate(6deg) translate(56px,10px)" }} />
            <div style={{ position: "absolute", width: 330, aspectRatio: "1/1.414", background: "#F1EDE2", border: "2px solid var(--ink)", transform: "rotate(-5deg) translate(-48px,6px)" }} />
            <div style={{ position: "relative", width: 340, aspectRatio: "1/1.414", background: "var(--card)", border: "2px solid var(--ink)", boxShadow: "10px 10px 0 rgba(26,25,23,.18)", padding: 18, display: "flex", flexDirection: "column", gap: 9 }}>
              <div style={{ height: 9, background: STRIPE(8), border: "1px solid var(--ink)" }} />
              <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 15 }}>SAFE WORK METHOD STATEMENT</div>
              <div style={{ fontFamily: MONO, fontSize: 7, color: "rgba(26,25,23,.6)" }}>SWMS-2608-041 · REV A · PAGE 2 OF 6</div>
              <div style={{ border: "1px solid var(--ink)", padding: "7px 8px" }}>
                <div style={{ fontFamily: MONO, fontSize: 6, letterSpacing: ".12em", color: "rgba(26,25,23,.55)", marginBottom: 5 }}>RISK MATRIX</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--ink)", border: "1px solid var(--ink)" }}>
                  <div style={{ background: "#3F9C55", color: "#fff", padding: 4, fontFamily: MONO, fontSize: 6, textAlign: "center" }}>LOW</div>
                  <div style={{ background: "#E3B90F", padding: 4, fontFamily: MONO, fontSize: 6, textAlign: "center" }}>MED</div>
                  <div style={{ background: "#D6491B", color: "#fff", padding: 4, fontFamily: MONO, fontSize: 6, textAlign: "center" }}>HIGH</div>
                  <div style={{ background: "#7A1B0C", color: "#fff", padding: 4, fontFamily: MONO, fontSize: 6, textAlign: "center" }}>EXTREME</div>
                </div>
              </div>
              <div style={{ border: "1px solid var(--ink)", padding: "7px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontFamily: MONO, fontSize: 6, letterSpacing: ".12em", color: "rgba(26,25,23,.55)" }}>JOB STEPS 4 — 6</div>
                {[96, 88, 92, 70, 90, 64].map((w, i) => (
                  <div key={i} style={{ height: 5, background: "rgba(26,25,23,.14)", width: `${w}%` }} />
                ))}
              </div>
              <div style={{ border: "1px solid var(--ink)", padding: "7px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontFamily: MONO, fontSize: 6, letterSpacing: ".12em", color: "rgba(26,25,23,.55)" }}>EMERGENCY PROCEDURES</div>
                {[90, 80, 86].map((w, i) => (
                  <div key={i} style={{ height: 5, background: "rgba(26,25,23,.14)", width: `${w}%` }} />
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: MONO, fontSize: 6, color: "rgba(26,25,23,.5)" }}>A4 · PRINT-READY</div>
                <div style={{ border: "2px solid #3F9C55", color: "#3F9C55", padding: "3px 8px", fontFamily: MONO, fontSize: 8, fontWeight: 600, letterSpacing: ".12em", transform: "rotate(-5deg)" }}>MODEL FORMAT ✓</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ COMPLIANCE ═══════════ */}
      <div style={{ background: "var(--ink)", color: "var(--paper)", borderBottom: "2px solid var(--ink)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "84px 32px 88px" }}>
          <div style={{ ...eyebrow, color: "var(--swa)" }}>COMPLIANCE</div>
          <h2 data-rv="1" style={{ ...h2Style, margin: "0 0 20px", maxWidth: 820 }}>Compliant in every state and territory.</h2>
          <p data-rv="1" data-rvd="90" style={{ margin: "0 0 30px", fontSize: 16, lineHeight: 1.6, color: "rgba(244,241,233,.72)", maxWidth: 640 }}>
            Built on the model WHS Regulations and your state&apos;s codes of practice. The 18 high-risk construction work categories are flagged automatically wherever they apply to your job.
          </p>
          <div data-rv="1" data-rvd="180" style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 44 }}>
            {["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"].map((s) => (
              <div key={s} style={{ border: "2px solid rgba(244,241,233,.9)", padding: "9px 18px", fontFamily: MONO, fontSize: 13, fontWeight: 600, letterSpacing: ".1em" }}>{s}</div>
            ))}
          </div>
          <div data-rv="1" data-rvd="260" style={{ border: "2px solid var(--swa)", padding: 0, maxWidth: 760 }}>
            <div style={{ height: 8, background: STRIPE(8) }} />
            <div style={{ padding: "22px 26px" }}>
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".16em", color: "var(--swa)", marginBottom: 8 }}>STRAIGHT UP —</div>
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "rgba(244,241,233,.85)" }}>
                A SWMS must be reviewed and signed by a competent person before work starts, and workers must be consulted on it. We build the document properly — the sign-off stays with you, exactly as the regs intend.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ PRICING ═══════════ */}
      <div id="pricing" style={{ borderBottom: "2px solid var(--ink)", background: "var(--paper2)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "92px 32px 96px" }}>
          <div data-rv="1" style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={eyebrow}>PRICING — PAY PER DOCUMENT</div>
            <h2 style={h2Style}>Cheaper than a slab.</h2>
            <p style={{ margin: "14px 0 0", fontSize: 16, color: "rgba(26,25,23,.7)" }}>No account. No subscription. Pay when your SWMS is ready.</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "stretch", gap: 32, flexWrap: "wrap" }}>
            {/* Single */}
            <div data-rv="1" style={{ width: 380, background: "var(--paper)", border: "2px solid var(--ink)", boxShadow: "8px 8px 0 rgba(26,25,23,.18)", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "28px 30px 0" }}>
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".14em", marginBottom: 16 }}>SINGLE SWMS</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 74, lineHeight: 1 }}>$7.99</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: "rgba(26,25,23,.6)" }}>ONE-OFF</div>
                </div>
                <p style={{ margin: "10px 0 22px", fontSize: 14.5, color: "rgba(26,25,23,.7)" }}>For one-off jobs, or giving it a crack.</p>
              </div>
              <div style={{ borderTop: "2px solid var(--ink)", padding: "22px 30px", display: "flex", flexDirection: "column", gap: 11, fontSize: 15, flex: 1 }}>
                {["Full A4 PDF — editable before download", "Compliant in all 8 states & territories", "Voice & photo input", "Free regeneration if it's not right"].map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10 }}><span style={{ color: "#3F9C55", fontWeight: 700 }}>✓</span>{f}</div>
                ))}
              </div>
              <div style={{ padding: "0 30px 30px" }}>
                <Link href="/job" className="sw-ghost" style={{ display: "flex", padding: 15, fontSize: 19 }}>START A SWMS</Link>
              </div>
            </div>
            {/* 3-Pack */}
            <div data-rv="1" data-rvd="140" style={{ width: 380, background: "var(--paper)", border: "2px solid var(--ink)", boxShadow: "8px 8px 0 var(--ink)", display: "flex", flexDirection: "column", position: "relative" }}>
              <div style={{ background: "var(--swa)", borderBottom: "2px solid var(--ink)", padding: "9px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 600, letterSpacing: ".14em" }}>BEST VALUE</div>
                <div style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 600, letterSpacing: ".1em" }}>SAVE $3.98</div>
              </div>
              <div style={{ padding: "24px 30px 0" }}>
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".14em", marginBottom: 16 }}>3-PACK</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 74, lineHeight: 1 }}>$19.99</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: "rgba(26,25,23,.6)" }}>3 SWMS</div>
                </div>
                <p style={{ margin: "10px 0 22px", fontSize: 14.5, color: "rgba(26,25,23,.7)" }}>For crews juggling more than one site.</p>
              </div>
              <div style={{ borderTop: "2px solid var(--ink)", padding: "22px 30px", display: "flex", flexDirection: "column", gap: 11, fontSize: 15, flex: 1 }}>
                {["Everything in Single", "Tokens never expire — use anytime", "$6.66 per SWMS"].map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10 }}><span style={{ color: "#3F9C55", fontWeight: 700 }}>✓</span>{f}</div>
                ))}
              </div>
              <div style={{ padding: "0 30px 30px" }}>
                <Link href="/job" className="sw-btn" style={{ display: "flex", padding: 15, fontSize: 19, boxShadow: "5px 5px 0 var(--ink)" }}>GET THE 3-PACK</Link>
              </div>
            </div>
          </div>
          <div data-rv="1" style={{ textAlign: "center", marginTop: 40, fontFamily: MONO, fontSize: 12.5, fontWeight: 600, letterSpacing: ".08em", color: "rgba(26,25,23,.7)" }}>
            NOT USABLE? REGENERATE FREE — OR FULL REFUND WITHIN 7 DAYS. NO FORMS, NO ARGUMENT.{" "}
            <a href="/sample-swms.pdf" target="_blank" rel="noopener noreferrer" className="sw-link" style={{ whiteSpace: "nowrap" }}>READ A SAMPLE FIRST ↗</a>
          </div>
        </div>
      </div>

      {/* ═══════════ FAQ ═══════════ */}
      <div id="faq" style={{ borderBottom: "2px solid var(--ink)" }}>
        <div style={{ maxWidth: 840, margin: "0 auto", padding: "92px 32px 96px" }}>
          <div style={{ ...eyebrow, textAlign: "center" }}>FAQ</div>
          <h2 data-rv="1" style={{ ...h2Style, fontSize: "clamp(40px,4.4vw,56px)", margin: "0 0 44px", textAlign: "center" }}>Fair questions.</h2>
          <div data-rv="1" data-rvd="100" style={{ borderBottom: "2px solid var(--ink)" }}>
            {[
              ["Is it actually WHS-compliant?", "Every document follows the Safe Work Australia model SWMS format and is matched to your state's WHS regulations and codes of practice, with high-risk construction work categories flagged. Like any SWMS — bought, templated or written by hand — it must be reviewed and signed by a competent person before work starts."],
              ["Do I need an account?", "No. Describe the job, review the document, pay, download your PDF on the spot. A receipt goes to your email — that's the whole relationship."],
              ["Can I edit the SWMS before I pay?", "Yes — every job step, hazard and control is fully editable before you pay. Reword anything, untick what doesn't apply, add what's missing. You only pay when it reads right."],
              ["Which trades does it cover?", "Any construction trade — electrical, carpentry, plumbing, roofing, concreting, scaffolding, demolition, excavation and the rest. If the job's unusual, just describe it plainly and the method comes out specific to it."],
              ["What if the builder knocks it back?", "Regenerate it free with the feedback you got. Still not usable? Full refund within 7 days — no forms, no argument."],
            ].map(([q, a]) => (
              <details key={q} style={{ borderTop: "2px solid var(--ink)" }}>
                <summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "19px 4px", cursor: "pointer", fontFamily: COND, fontWeight: 700, fontSize: 22, letterSpacing: ".02em", textTransform: "uppercase" }}>
                  {q}<span style={{ fontFamily: MONO, fontSize: 16, color: "rgba(26,25,23,.5)" }}>+</span>
                </summary>
                <p style={{ margin: 0, padding: "0 4px 22px", fontSize: 15, lineHeight: 1.6, color: "rgba(26,25,23,.75)" }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <div style={{ background: "var(--swa)", borderBottom: "2px solid var(--ink)" }}>
        <div style={{ height: 12, background: "repeating-linear-gradient(-45deg, #1A1917 0 10px, transparent 10px 20px)" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "88px 32px", textAlign: "center" }}>
          <h2 data-rv="1" style={{ margin: "0 0 18px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(52px,6vw,86px)", lineHeight: 0.95, textTransform: "uppercase" }}>
            Right. Let&apos;s knock it over.
          </h2>
          <p data-rv="1" data-rvd="80" style={{ margin: "0 0 36px", fontSize: 17, color: "rgba(26,25,23,.75)" }}>
            Describe the job now — you don&apos;t pay until the SWMS is sitting there ready.
          </p>
          <Link data-rv="1" data-rvd="160" href="/job" className="sw-btn-ink" style={{ padding: "20px 40px", fontSize: 24 }}>
            BUILD YOUR SWMS NOW <span style={{ fontFamily: MONO, fontSize: 18 }}>→</span>
          </Link>
          <div style={{ marginTop: 22, fontFamily: MONO, fontSize: 12, letterSpacing: ".08em", color: "rgba(26,25,23,.65)" }}>
            NO ACCOUNT NEEDED · PAY WHEN YOU&apos;RE HAPPY
          </div>
        </div>
        <div style={{ height: 12, background: "repeating-linear-gradient(-45deg, #1A1917 0 10px, transparent 10px 20px)" }} />
      </div>

      {/* ═══════════ FOOTER ═══════════ */}
      <div style={{ background: "var(--ink)", color: "var(--paper)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 32px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 32, flexWrap: "wrap", marginBottom: 44 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 28, height: 28, border: "2px solid var(--paper)", background: STRIPE(6) }} />
              <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 23, letterSpacing: ".05em" }}>SWMS SORTED</div>
            </div>
            <div style={{ display: "flex", gap: 26, flexWrap: "wrap", fontFamily: MONO, fontSize: 12, letterSpacing: ".08em" }}>
              <Link href="/privacy" className="sw-link-paper">PRIVACY</Link>
              <Link href="/terms" className="sw-link-paper">TERMS</Link>
              <Link href="/refunds" className="sw-link-paper">REFUNDS</Link>
              <a href="mailto:support@swmssorted.com.au" className="sw-link-paper">CONTACT</a>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(244,241,233,.25)", paddingTop: 22, display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap", fontFamily: MONO, fontSize: 11, letterSpacing: ".05em", color: "rgba(244,241,233,.55)" }}>
            <span>© {new Date().getFullYear()} SWMS SORTED · BUILT IN AUSTRALIA</span>
            <span>SWMS DOCUMENTS MUST BE REVIEWED BY A COMPETENT PERSON BEFORE USE ON SITE.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
