"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PROMO_FREE, PRICE_SINGLE } from "@/lib/constants/promo";

const MONO = "'IBM Plex Mono', monospace";
const COND = "'Barlow Condensed', sans-serif";

const JOB_TEXT =
  "Replacing the colorbond roof on a two-storey weatherboard house in Newcastle. Strip the old sheets, new battens and insulation blanket, re-sheet with Colorbond. Crew of three, scissor lift and harnesses, about two days.";

type Row = { n: string; step: string; hz: string; risk: "H" | "M" };
const ROWS: Row[] = [
  { n: "01", step: "Set up exclusion zone, position scissor lift", hz: "FALLING DEBRIS · PLANT MOVEMENT · OVERHEAD POWER", risk: "H" },
  { n: "02", step: "Install roof anchors and static lines", hz: "FALL FROM HEIGHT >2M · ANCHOR FAILURE", risk: "H" },
  { n: "03", step: "Strip existing sheeting and battens", hz: "SHARP EDGES · DUST · FALLING MATERIAL", risk: "H" },
  { n: "04", step: "Lay insulation blanket and new battens", hz: "MANUAL HANDLING · FRAGILE SURFACE", risk: "M" },
  { n: "05", step: "Fix new Colorbond sheeting", hz: "WIND-CAUGHT SHEETS · POWER TOOLS", risk: "H" },
  { n: "06", step: "Clear waste, demobilise, final inspection", hz: "MANUAL HANDLING · SITE ACCESS", risk: "M" },
];

const ACTS = [
  { key: "01", label: "YOU TYPE IT" },
  { key: "02", label: "IT WRITES THE METHOD" },
  { key: "03", label: "HIGH-RISK WORK FLAGGED" },
  { key: "04", label: "SITE-READY PDF" },
];

/* Act boundaries as a fraction of the scroller. */
const A1: [number, number] = [0.00, 0.20];
const A2: [number, number] = [0.20, 0.58];
const A3: [number, number] = [0.58, 0.76];
const A4: [number, number] = [0.76, 0.97];

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const seg = (p: number, [a, b]: [number, number]) => clamp((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function ScrollBuild() {
  const wrapRef = useRef<HTMLElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const jobBoxRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stepCountRef = useRef<HTMLSpanElement>(null);
  const hazCountRef = useRef<HTMLSpanElement>(null);
  const hrcwRef = useRef<HTMLDivElement>(null);
  const pdfHeadRef = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const page3Ref = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const hudRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Rendered markup is the *finished* state, so the section still reads with
  // JS off. Animation only takes over once we're mounted.
  const [pinned, setPinned] = useState(false);

  /* Phones get a genuinely smaller artifact — fewer steps, tighter type —
     rather than the full one scaled down past the point of legibility. */
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const width = matchMedia("(max-width: 620px)");
    /* Short viewports lose so much height to the sticky nav that the pinned
       artifact would have to shrink past legibility — those get the plain
       finished document instead of the scroll sequence. */
    const short = matchMedia("(max-height: 699px)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setCompact(width.matches);
      setPinned(!reduce.matches && !short.matches);
    };
    sync();
    [width, short, reduce].forEach((m) => m.addEventListener("change", sync));
    return () => [width, short, reduce].forEach((m) => m.removeEventListener("change", sync));
  }, []);

  const rows = compact ? ROWS.slice(0, 4) : ROWS;
  const countRef = useRef(rows.length);
  countRef.current = rows.length;

  useEffect(() => {
    if (!pinned) return;

    /* The artifact is tallest at its finished state, and on a phone that
       overflows the pinned viewport. Measure that finished height and scale
       the whole stage down to fit rather than letting it clip. */
    const fitToViewport = () => {
      const inner = innerRef.current;
      if (!inner) return;

      // The site nav is sticky and sits over the pinned stage — the artifact
      // has to fit in what's left, and centre below it.
      const navH = document.querySelector("[data-sticky-nav]")?.getBoundingClientRect().height ?? 0;
      if (stageRef.current) stageRef.current.style.paddingTop = `${navH}px`;

      const hrcw = hrcwRef.current;
      const head = pdfHeadRef.current;
      const job = jobBoxRef.current;
      const saved = [hrcw?.style.cssText, head?.style.cssText, job?.style.cssText];

      inner.style.transform = "none";
      if (hrcw) { hrcw.style.maxHeight = "110px"; hrcw.style.opacity = "1"; }
      if (head) { head.style.height = "52px"; head.style.opacity = "1"; }
      if (job) { job.style.maxHeight = "52px"; }
      const natural = inner.getBoundingClientRect().height;

      if (hrcw && saved[0] !== undefined) hrcw.style.cssText = saved[0];
      if (head && saved[1] !== undefined) head.style.cssText = saved[1];
      if (job && saved[2] !== undefined) job.style.cssText = saved[2];

      const s = clamp((innerHeight - navH - 28) / Math.max(1, natural), 0.62, 1);
      inner.style.transform = s < 1 ? `scale(${s.toFixed(3)})` : "none";
    };

    let raf = 0;
    const paint = () => {
      raf = 0;
      const wrap = wrapRef.current;
      if (!wrap) return;

      // Progress across the scroller, 0 when its top hits the viewport top.
      const r = wrap.getBoundingClientRect();
      const travel = Math.max(1, r.height - innerHeight);
      const p = clamp(-r.top / travel);

      /* ── 01 · typing ── */
      const t1 = seg(p, A1);
      if (typedRef.current) {
        const n = Math.round(t1 * JOB_TEXT.length);
        typedRef.current.textContent = JOB_TEXT.slice(0, n);
      }
      // display, not opacity — the blink keyframes own opacity and would
      // override an inline value, leaving the caret up after typing ends.
      if (caretRef.current) caretRef.current.style.display = t1 < 1 ? "inline-block" : "none";

      /* Job box shrinks to a header line once the method starts writing. */
      const shrink = seg(p, [A2[0], A2[0] + 0.08]);
      if (jobBoxRef.current) {
        jobBoxRef.current.style.maxHeight = `${lerp(150, 52, shrink)}px`;
        jobBoxRef.current.style.fontSize = `${lerp(15.5, 12.5, shrink)}px`;
      }

      /* ── 02 · rows land one at a time ── */
      const t2 = seg(p, A2);
      const n = countRef.current;
      rowRefs.current.slice(0, n).forEach((el, i) => {
        if (!el) return;
        const local = clamp(t2 * n - i);
        el.style.opacity = String(local);
        el.style.transform = `translate3d(0,${(1 - local) * 16}px,0)`;
      });
      if (stepCountRef.current) stepCountRef.current.textContent = String(Math.round(t2 * 10));
      if (hazCountRef.current) hazCountRef.current.textContent = String(Math.round(t2 * 31));

      /* ── 03 · HRCW banner ── */
      const t3 = seg(p, A3);
      if (hrcwRef.current) {
        hrcwRef.current.style.opacity = String(t3);
        hrcwRef.current.style.maxHeight = `${t3 * 110}px`;
        hrcwRef.current.style.transform = `translate3d(0,${(1 - t3) * -10}px,0)`;
      }

      /* ── 04 · becomes the PDF ── */
      const t4 = seg(p, A4);
      if (pdfHeadRef.current) {
        pdfHeadRef.current.style.height = `${t4 * 52}px`;
        pdfHeadRef.current.style.opacity = String(clamp(t4 * 1.6));
      }
      // Fan right and slightly down — drifting upward collides with the heading.
      if (page2Ref.current) {
        page2Ref.current.style.opacity = String(t4 * 0.85);
        page2Ref.current.style.transform = `translate3d(${t4 * 22}px,${t4 * 8}px,0) rotate(${t4 * 1.6}deg)`;
      }
      if (page3Ref.current) {
        page3Ref.current.style.opacity = String(t4 * 0.6);
        page3Ref.current.style.transform = `translate3d(${t4 * 42}px,${t4 * 17}px,0) rotate(${t4 * 3.2}deg)`;
      }
      if (ctaRef.current) {
        const tc = seg(p, [0.86, 0.94]);
        ctaRef.current.style.opacity = String(tc);
        ctaRef.current.style.transform = `translate3d(0,${(1 - tc) * 14}px,0)`;
      }

      /* HUD — highlight the act we're inside. */
      const act = p < A2[0] ? 0 : p < A3[0] ? 1 : p < A4[0] ? 2 : 3;
      hudRefs.current.forEach((el, i) => {
        if (!el) return;
        const on = i === act;
        el.style.background = on ? "var(--swa)" : "transparent";
        el.style.opacity = on ? "1" : i < act ? ".55" : ".3";
      });
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const onResize = () => { fitToViewport(); onScroll(); };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    fitToViewport();   // measure while the DOM still holds its finished state
    paint();
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pinned, compact]);

  const pageStyle: React.CSSProperties = {
    position: "absolute", inset: 0, background: "var(--card)",
    border: "2px solid var(--ink)", zIndex: 0,
  };

  return (
    <section
      ref={wrapRef}
      className={`swBuild${pinned ? "" : " is-static"}`}
      style={{ borderBottom: "2px solid var(--ink)", background: "var(--paper2)" }}
      aria-label="How a SWMS gets built"
    >
      <div ref={stageRef} className="swBuildStage">
        <div ref={innerRef} style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px", width: "100%" }}>

          {/* HUD — mirrors the builder's own 01/02/03/04 step nav */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20, justifyContent: "center" }}>
            {ACTS.map((a, i) => (
              <div
                key={a.key}
                ref={(el) => { hudRefs.current[i] = el; }}
                style={{
                  border: "2px solid var(--ink)", padding: "6px 12px",
                  fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: ".1em",
                  background: i === 0 ? "var(--swa)" : "transparent",
                  transition: "background .25s ease, opacity .25s ease",
                }}
              >
                {a.key}{!compact && <span style={{ opacity: .75 }}> {a.label}</span>}
              </div>
            ))}
          </div>

          <h2 style={{
            margin: "0 0 22px", textAlign: "center", fontFamily: COND, fontWeight: 800,
            fontSize: "clamp(30px,4vw,52px)", lineHeight: .98, textTransform: "uppercase",
          }}>
            Scroll. Watch it build.
          </h2>

          {/* ── The artifact ── */}
          <div style={{ position: "relative" }}>
            <div ref={page3Ref} style={{ ...pageStyle, opacity: 0 }} aria-hidden="true" />
            <div ref={page2Ref} style={{ ...pageStyle, opacity: 0 }} aria-hidden="true" />

            <div style={{
              position: "relative", zIndex: 1, background: "var(--card)",
              border: "2px solid var(--ink)", boxShadow: "10px 10px 0 rgba(26,25,23,.14)",
            }}>
              {/* PDF letterhead — grows in on the last act */}
              <div ref={pdfHeadRef} style={{
                height: 0, opacity: 0, overflow: "hidden", background: "#12305B", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 16px", gap: 12,
              }} aria-hidden="true">
                <div>
                  <div style={{ fontFamily: COND, fontWeight: 700, fontSize: 15, letterSpacing: ".04em" }}>HARBOUR CITY ROOFING PTY LTD</div>
                  <div style={{ fontFamily: MONO, fontSize: 9.5, opacity: .8 }}>ABN 11 222 333 444</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: ".14em", color: "#F2DE1B" }}>SWMS DOCUMENT</div>
                  <div style={{ fontFamily: COND, fontWeight: 700, fontSize: 14 }}>SWMS-0811-204</div>
                </div>
              </div>

              {/* The job, as typed */}
              <div style={{ borderBottom: "2px solid var(--ink)", padding: "14px 16px", background: "var(--paper)" }}>
                <div style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 600, letterSpacing: ".14em", color: "rgba(26,25,23,.55)", marginBottom: 7 }}>
                  THE JOB — IN PLAIN ENGLISH
                </div>
                <div ref={jobBoxRef} style={{ overflow: "hidden", lineHeight: 1.5, maxHeight: 150, fontSize: 15.5 }}>
                  <span ref={typedRef}>{JOB_TEXT}</span>
                  <span ref={caretRef} className="sw-caret" style={{
                    display: "inline-block", width: 9, height: "1.05em", background: "var(--ink)",
                    verticalAlign: "-2px", marginLeft: 2, opacity: 0,
                  }} aria-hidden="true" />
                </div>
              </div>

              {/* HRCW flag */}
              <div ref={hrcwRef} style={{
                overflow: "hidden", maxHeight: 110, opacity: 1,
                background: "var(--swa)", borderBottom: "2px solid var(--ink)",
              }}>
                <div style={{ padding: compact ? "8px 11px" : "11px 16px" }}>
                  <div style={{ fontFamily: MONO, fontSize: compact ? 9.5 : 10.5, fontWeight: 600, letterSpacing: ".1em", marginBottom: 5 }}>
                    ⚠ HIGH-RISK WORK — FLAGGED AUTOMATICALLY
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: compact ? 9.5 : 10.5, lineHeight: 1.55 }}>
                    1. WORK AT HEIGHT — FALL OF MORE THAN 2 METRES<br />
                    11. MOVEMENT OF POWERED MOBILE PLANT
                  </div>
                </div>
              </div>

              {/* The method */}
              <div key={compact ? "c" : "f"}>
                {rows.map((r, i) => (
                  <div
                    key={r.n}
                    data-swms-row
                    ref={(el) => { rowRefs.current[i] = el; }}
                    style={{
                      display: "grid", gridTemplateColumns: compact ? "26px 1fr auto" : "34px 1fr auto",
                      gap: compact ? 8 : 12, alignItems: "start",
                      padding: compact ? "7px 11px" : "10px 16px",
                      borderTop: i ? "1px solid rgba(26,25,23,.16)" : "none",
                    }}
                  >
                    <div style={{ fontFamily: MONO, fontSize: compact ? 10 : 11, fontWeight: 600, color: "rgba(26,25,23,.45)", paddingTop: 2 }}>{r.n}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: compact ? 13 : 14.5, lineHeight: 1.3 }}>{r.step}</div>
                      <div style={{ fontFamily: MONO, fontSize: compact ? 9.5 : 10.5, lineHeight: 1.45, color: "var(--sorange)", marginTop: 3 }}>{r.hz}</div>
                    </div>
                    <div style={{
                      background: r.risk === "H" ? "var(--risk-h)" : "var(--risk-m)",
                      color: r.risk === "H" ? "#fff" : "var(--ink)",
                      padding: "2px 9px", fontFamily: MONO, fontSize: 11, fontWeight: 600,
                    }}>{r.risk}</div>
                  </div>
                ))}
              </div>

              {/* Running tally */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14,
                flexWrap: "wrap", borderTop: "2px solid var(--ink)", padding: "11px 16px", background: "var(--paper)",
                fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".08em",
              }}>
                <div>
                  <span data-swms-steps ref={stepCountRef}>10</span> JOB STEPS
                  <span style={{ opacity: .35 }}> · </span>
                  <span data-swms-haz ref={hazCountRef}>31</span> HAZARDS
                  <span style={{ opacity: .35 }}> · </span>NSW
                </div>
                <div style={{ color: "#3F9C55" }}>✓ CREW SIGN-ON INCLUDED</div>
              </div>
            </div>
          </div>

          <div ref={ctaRef} style={{ marginTop: 22, textAlign: "center" }}>
            <Link href="/job" className="sw-btn" style={{ padding: "14px 28px", fontSize: 20 }}>
              {PROMO_FREE ? "BUILD YOURS — FREE →" : `BUILD YOURS — ${PRICE_SINGLE} →`}
            </Link>
            <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", color: "rgba(26,25,23,.55)" }}>
              {PROMO_FREE ? "LAUNCH OFFER · NO CARD NEEDED" : "FREE TO GENERATE · PAY ONLY WHEN YOU DOWNLOAD"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
