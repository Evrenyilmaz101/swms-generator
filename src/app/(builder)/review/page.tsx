"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { hazardCount, includedSteps, makeDocNo, riskCode, riskColors, whenHydrated } from "@/lib/utils/builder-doc";
import type { ProcedureStep } from "@/types/swms";

const MONO = "'IBM Plex Mono', monospace";
const COND = "'Barlow Condensed', sans-serif";

const GEN_LINES = [
  "READING YOUR JOB DESCRIPTION",
  "MATCHING WHS REGS + CODES OF PRACTICE",
  "FLAGGING HIGH-RISK CONSTRUCTION WORK",
  "WRITING CONTROLS, PPE + EMERGENCY PLAN",
];

/** Strip hierarchy-of-controls tags like "[ENGINEERING] " for display. */
const cleanControl = (c: string) => c.replace(/^\[[A-Z]+\]\s*/, "");

function RiskBadge({ rating }: { rating: ProcedureStep["initial_risk"]["rating"] }) {
  const [bg, fg] = riskColors(rating);
  return (
    <span style={{ background: bg, color: fg, padding: "3px 9px", fontFamily: MONO, fontSize: 11, fontWeight: 600 }}>
      {riskCode(rating)}
    </span>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const {
    businessDetails,
    generatedSwms, setGeneratedSwms,
    setComplianceScore, setValidationWarnings,
    isGenerating, setIsGenerating,
    generationError, setGenerationError,
    excludedSteps, toggleStepExcluded,
    setDocNo, setCurrentStep,
  } = useBuilderStore();

  const [genProgress, setGenProgress] = useState(1);
  const genTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const generate = useCallback(async () => {
    // Read at call time — closure values can predate store hydration
    const { businessDetails: biz, jobDetails: job, photoHazards: hazards } = useBuilderStore.getState();
    if (!biz.state || !job.job_description) {
      router.push("/job");
      return;
    }
    setIsGenerating(true);
    setGenerationError(null);
    setGenProgress(1);
    // Pace the checklist to a realistic generation (~25s); the last line holds.
    genTimersRef.current.forEach(clearTimeout);
    genTimersRef.current = [2, 3, 4].map((v, i) =>
      setTimeout(() => setGenProgress(v), 6000 * (i + 1))
    );

    try {
      const selectedHazards = hazards.filter((h) => h.selected).map((h) => h.hazard);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_description: job.job_description,
          state: biz.state,
          site_address: job.site_address || undefined,
          principal_contractor: job.principal_contractor || undefined,
          additional_hazards: selectedHazards.length ? selectedHazards : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedSwms(data.data);
        setComplianceScore(data.compliance_score);
        setValidationWarnings(data.validation_warnings || []);
        useBuilderStore.setState({ excludedSteps: [] });
        setDocNo(makeDocNo());
      } else {
        setGenerationError(data.error || "Something went sideways building the document.");
      }
    } catch {
      setGenerationError("Connection dropped mid-build. Check your signal and try again.");
    } finally {
      genTimersRef.current.forEach(clearTimeout);
      setIsGenerating(false);
    }
  }, [router, setComplianceScore, setDocNo, setGeneratedSwms, setGenerationError, setIsGenerating, setValidationWarnings]);

  useEffect(() => {
    setCurrentStep("review");
    const unsub = whenHydrated(() => {
      const s = useBuilderStore.getState();
      if (!s.generatedSwms && !s.isGenerating) generate();
    });
    return () => {
      unsub?.();
      genTimersRef.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Add-a-step form ── */
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newHz, setNewHz] = useState("");
  const [newCtrl, setNewCtrl] = useState("");
  const addStep = () => {
    if (!generatedSwms || !newTitle.trim()) return;
    const step: ProcedureStep = {
      step_number: generatedSwms.steps.length + 1,
      activity: newTitle.trim(),
      hazards: newHz.trim() ? newHz.split(/[·;,]/).map((h) => h.trim()).filter(Boolean) : ["To be assessed on site"],
      initial_risk: { likelihood: "Possible", consequence: "Moderate", rating: "Medium" },
      controls: newCtrl.trim() ? newCtrl.split(/[;]/).map((c) => c.trim()).filter(Boolean) : ["Controls to be confirmed by competent person"],
      residual_risk: { likelihood: "Unlikely", consequence: "Minor", rating: "Low" },
      responsible: "All workers",
    };
    setGeneratedSwms({ ...generatedSwms, steps: [...generatedSwms.steps, step] });
    setAdding(false);
    setNewTitle(""); setNewHz(""); setNewCtrl("");
  };

  /* ── Generating overlay ── */
  if (isGenerating) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "var(--ink)", color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 520, maxWidth: "90vw", padding: 24 }}>
          <div style={{ height: 12, background: "repeating-linear-gradient(-45deg, #F4F1E9 0 14px, var(--swa) 14px 28px)", backgroundSize: "56px 100%", animation: "swSlide .8s linear infinite", border: "2px solid var(--paper)", marginBottom: 30 }} />
          <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 44, lineHeight: 1, textTransform: "uppercase", marginBottom: 8 }}>Building your SWMS</div>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".1em", color: "rgba(244,241,233,.6)", marginBottom: 26 }}>
            {businessDetails.state || "NSW"} · WHS REGULATIONS + CODES OF PRACTICE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {GEN_LINES.map((t, i) => {
              const done = genProgress > i + 1;
              const active = genProgress === i + 1;
              return (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontSize: 13, letterSpacing: ".04em", opacity: genProgress >= i + 1 ? 1 : 0.3 }}>
                  <span style={{ color: done ? "#3F9C55" : "var(--swa)", fontWeight: 600, width: 14, display: "inline-block" }}>
                    {done ? "✓" : active ? "▶" : "·"}
                  </span>
                  {t}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (generationError) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".14em", color: "var(--sorange)", marginBottom: 14 }}>⚠ GENERATION HIT A SNAG</div>
        <h1 style={{ margin: "0 0 16px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(36px,4.5vw,52px)", lineHeight: 0.95, textTransform: "uppercase" }}>That one didn&apos;t stick.</h1>
        <p style={{ margin: "0 0 30px", fontSize: 16, color: "rgba(26,25,23,.72)" }}>{generationError}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <button onClick={() => generate()} className="sw-btn" style={{ padding: "14px 26px", fontSize: 19 }}>TRY AGAIN</button>
          <button onClick={() => router.push("/job")} className="sw-ghost" style={{ padding: "14px 26px", fontSize: 19 }}>EDIT THE JOB</button>
        </div>
      </div>
    );
  }

  if (!generatedSwms) return null;

  const included = includedSteps(generatedSwms, excludedSteps);
  const hzN = hazardCount(generatedSwms, excludedSteps);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "56px 28px 80px", width: "100%", boxSizing: "border-box" }}>
      <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".16em", color: "rgba(26,25,23,.6)", marginBottom: 12 }}>STEP 02 — REVIEW THE METHOD</div>
      <h1 style={{ margin: "0 0 12px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(44px,5vw,64px)", lineHeight: 0.95, textTransform: "uppercase" }}>Review the calls.</h1>
      <p style={{ margin: "0 0 26px", fontSize: 16.5, color: "rgba(26,25,23,.72)", maxWidth: 640 }}>
        We&apos;ve drafted the method. Untick anything that doesn&apos;t apply — you&apos;re the competent person here, not us.
      </p>

      {/* Summary chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
        {[`${included.length} JOB STEPS`, `${hzN} HAZARDS`, `STATE: ${businessDetails.state}`].map((c) => (
          <div key={c} style={{ background: "var(--ink)", color: "var(--paper)", padding: "7px 13px", fontFamily: MONO, fontSize: 11.5, fontWeight: 600, letterSpacing: ".1em" }}>{c}</div>
        ))}
      </div>

      {/* HRCW banner */}
      {generatedSwms.hrcw_activities.length > 0 && (
        <div style={{ border: "2px solid var(--ink)", background: "var(--swa)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, marginBottom: 26, flexWrap: "wrap" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".14em" }}>⚠ HRCW FLAGGED:</div>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 500 }}>{generatedSwms.hrcw_activities.join(" · ").toUpperCase()}</div>
        </div>
      )}

      {/* Step cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        {generatedSwms.steps.map((st) => {
          const on = !excludedSteps.includes(st.step_number);
          return (
            <div key={st.step_number} style={{ border: "2px solid var(--ink)", background: "var(--card)", opacity: on ? 1 : 0.45 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: "1px solid rgba(26,25,23,.2)", flexWrap: "wrap" }}>
                <button onClick={() => toggleStepExcluded(st.step_number)} aria-label={on ? "Exclude this step" : "Include this step"} style={{ width: 24, height: 24, border: "2px solid var(--ink)", background: on ? "var(--swa)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontWeight: 700, fontSize: 14, color: "var(--ink)", padding: 0 }}>
                  {on ? "✓" : ""}
                </button>
                <div style={{ fontFamily: COND, fontWeight: 700, fontSize: 23, letterSpacing: ".02em", textTransform: "uppercase" }}>
                  {st.step_number}. {st.activity}
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                  <RiskBadge rating={st.initial_risk.rating} />
                  <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(26,25,23,.5)" }}>→</span>
                  <RiskBadge rating={st.residual_risk.rating} />
                </div>
              </div>
              <div style={{ padding: "14px 20px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".04em", color: "var(--sorange)", fontWeight: 500 }}>
                  HAZARDS: {st.hazards.join(" · ").toUpperCase()}
                </div>
                <div style={{ fontSize: 14.5, lineHeight: 1.55, color: "rgba(26,25,23,.85)" }}>
                  <strong style={{ fontWeight: 600 }}>Controls:</strong> {st.controls.map(cleanControl).join("; ")}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add a step */}
      {adding ? (
        <div style={{ border: "2px solid var(--ink)", background: "var(--card)", padding: 20, marginBottom: 38, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".14em", color: "rgba(26,25,23,.6)" }}>NEW JOB STEP</div>
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="What's the step? e.g. Set up temporary fencing" style={{ border: "2px solid var(--ink)", background: "var(--paper)", padding: "12px 14px", fontFamily: "var(--f-body)", fontSize: 15, outline: "none" }} />
          <input value={newHz} onChange={(e) => setNewHz(e.target.value)} placeholder="Hazards (separate with · or ;) — optional" style={{ border: "2px solid var(--ink)", background: "var(--paper)", padding: "12px 14px", fontFamily: "var(--f-body)", fontSize: 15, outline: "none" }} />
          <input value={newCtrl} onChange={(e) => setNewCtrl(e.target.value)} placeholder="Controls (separate with ;) — optional" style={{ border: "2px solid var(--ink)", background: "var(--paper)", padding: "12px 14px", fontFamily: "var(--f-body)", fontSize: 15, outline: "none" }} />
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={addStep} disabled={!newTitle.trim()} className="sw-btn sw-btn-sm" style={{ padding: "10px 20px", fontSize: 16, opacity: newTitle.trim() ? 1 : 0.4 }}>ADD IT</button>
            <button onClick={() => setAdding(false)} className="sw-chip-ghost" style={{ padding: "10px 20px", fontFamily: COND, fontWeight: 700, fontSize: 16, letterSpacing: ".07em" }}>NEVER MIND</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ width: "100%", border: "2px dashed rgba(26,25,23,.45)", background: "transparent", padding: 15, cursor: "pointer", fontFamily: MONO, fontSize: 12.5, fontWeight: 600, letterSpacing: ".1em", color: "rgba(26,25,23,.6)", marginBottom: 38 }}>
          + ADD A JOB STEP
        </button>
      )}

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <button onClick={() => router.push("/job")} style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: MONO, fontSize: 12.5, fontWeight: 600, letterSpacing: ".1em", padding: 0, color: "var(--ink)" }}>← BACK TO THE JOB</button>
        <button onClick={() => router.push("/preview")} disabled={included.length === 0} className="sw-btn" style={{ padding: "16px 30px", fontSize: 21 }}>
          LOOKS RIGHT — PREVIEW <span style={{ fontFamily: MONO, fontSize: 15 }}>→</span>
        </button>
      </div>
    </div>
  );
}
