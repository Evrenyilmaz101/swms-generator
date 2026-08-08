"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useBuilderStore, useRememberMeStore } from "@/stores/builder-store";
import { hazardCount, includedSteps, makeDocNo, riskColors, riskCode, whenHydrated } from "@/lib/utils/builder-doc";

const MONO = "'IBM Plex Mono', monospace";
const COND = "'Barlow Condensed', sans-serif";

const fieldLabel: React.CSSProperties = { fontFamily: MONO, fontSize: 7, letterSpacing: ".1em", color: "rgba(26,25,23,.55)" };
const thCell: React.CSSProperties = { padding: "5px 8px", fontFamily: MONO, fontSize: 7.5, letterSpacing: ".08em" };
const lhLabel: React.CSSProperties = { fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: ".12em", color: "rgba(26,25,23,.6)", display: "block", marginBottom: 5 };
const lhInput: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "2px solid var(--ink)", background: "var(--paper)", padding: "9px 12px", fontFamily: "var(--f-body)", fontSize: 14, outline: "none" };

/* Downscale an image file to a compact data URI for the PDF letterhead.
   Logos render at ~36pt in the doc, so 240px on the long edge is plenty. */
function fileToLogoDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (!img.width || !img.height) { reject(new Error("image has no dimensions")); return; }
      const scale = Math.min(1, 240 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("canvas unavailable")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("unreadable image")); };
    img.src = url;
  });
}

/* Static blurred page thumbnails (pages 2-6 tease) */
const THUMBS: number[][] = [
  [70, 95, 88, 92, -22, 85, 90, -22, 76],
  [60, -28, 90, 84, -28, 78],
  [75, 92, -40, 80, 86],
  [65, 88, 94, -16, -16, -16],
];

export default function PreviewPage() {
  const router = useRouter();
  const {
    businessDetails, setBusinessDetails, jobDetails, setJobDetails,
    generatedSwms, excludedSteps,
    docNo, setDocNo, setCurrentStep,
  } = useBuilderStore();
  const logoFileRef = useRef<HTMLInputElement>(null);
  const logoJobRef = useRef(0);
  const [logoError, setLogoError] = useState<string | null>(null);

  const onLogoFile = async (file: File) => {
    const job = ++logoJobRef.current;
    setLogoError(null);
    try {
      const dataUri = await fileToLogoDataUri(file);
      if (job !== logoJobRef.current) return; // a newer pick already resolved
      setBusinessDetails({ logo_base64: dataUri });
    } catch {
      if (job !== logoJobRef.current) return;
      setLogoError("Couldn't read that image — try a JPG or PNG.");
    }
  };

  useEffect(() => {
    setCurrentStep("preview");
    const unsub = whenHydrated(() => {
      const s = useBuilderStore.getState();
      if (!s.generatedSwms) { router.push("/job"); return; }
      if (!s.docNo) setDocNo(makeDocNo());
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!generatedSwms) return null;

  const included = includedSteps(generatedSwms, excludedSteps);
  const hzN = hazardCount(generatedSwms, excludedSteps);
  const docCompany = businessDetails.business_name.trim() || "—";
  const docSite = jobDetails.site_address.trim() || "Per job description";
  const dateStr = new Date().toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "56px 28px 80px", width: "100%", boxSizing: "border-box" }}>
      <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".16em", color: "rgba(26,25,23,.6)", marginBottom: 12 }}>STEP 03 — PREVIEW</div>
      <h1 style={{ margin: "0 0 12px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(44px,5vw,64px)", lineHeight: 0.95, textTransform: "uppercase" }}>Your SWMS, on paper.</h1>
      <p style={{ margin: "0 0 40px", fontSize: 16.5, color: "rgba(26,25,23,.72)" }}>Page one&apos;s the real deal. The rest unlocks when you download.</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "flex-start" }}>
        {/* A4 page-1 render */}
        <div style={{ position: "relative", minWidth: 0, flex: "1.6 1 480px" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 600, aspectRatio: "1/1.414", background: "var(--card)", border: "2px solid var(--ink)", boxShadow: "12px 12px 0 rgba(26,25,23,.15)", padding: 28, display: "flex", flexDirection: "column", gap: 13, overflow: "hidden", boxSizing: "border-box" }}>
            {/* Watermark */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 110, letterSpacing: ".1em", color: "transparent", WebkitTextStroke: "2px rgba(26,25,23,.09)", transform: "rotate(-28deg)", whiteSpace: "nowrap" }}>PREVIEW</div>
            </div>
            <div style={{ height: 12, background: "repeating-linear-gradient(-45deg, #1A1917 0 10px, var(--swa) 10px 20px)", border: "1px solid var(--ink)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                {businessDetails.logo_base64 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={businessDetails.logo_base64} alt="Company logo" style={{ height: 26, maxWidth: 64, objectFit: "contain", flexShrink: 0 }} />
                )}
                <div style={{ fontFamily: COND, fontWeight: 800, fontSize: "clamp(16px,2vw,24px)" }}>SAFE WORK METHOD STATEMENT</div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>{docNo} · REV A</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--ink)", border: "1px solid var(--ink)" }}>
              <div style={{ background: "var(--card)", padding: "7px 10px" }}>
                <div style={fieldLabel}>PCBU</div>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{docCompany}</div>
                {businessDetails.abn.trim() && (
                  <div style={{ fontFamily: MONO, fontSize: 8, color: "rgba(26,25,23,.6)", marginTop: 1 }}>ABN {businessDetails.abn.trim()}</div>
                )}
              </div>
              <div style={{ background: "var(--card)", padding: "7px 10px" }}>
                <div style={fieldLabel}>SITE</div>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{docSite}</div>
              </div>
              <div style={{ background: "var(--card)", padding: "7px 10px" }}>
                <div style={fieldLabel}>STATE / DATE</div>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{businessDetails.state} · {dateStr}</div>
              </div>
            </div>
            {generatedSwms.hrcw_activities.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
                <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: ".1em", color: "rgba(26,25,23,.55)" }}>HRCW:</div>
                {generatedSwms.hrcw_activities.slice(0, 3).map((h) => (
                  <div key={h} style={{ border: "1px solid var(--ink)", padding: "3px 8px", fontFamily: MONO, fontSize: 8.5, fontWeight: 600, background: "var(--swa)" }}>{h.toUpperCase()}</div>
                ))}
                {generatedSwms.hrcw_activities.length > 3 && (
                  <div style={{ fontFamily: MONO, fontSize: 8, color: "rgba(26,25,23,.55)" }}>+{generatedSwms.hrcw_activities.length - 3} MORE</div>
                )}
              </div>
            )}
            <div style={{ border: "1px solid var(--ink)", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr .4fr 1.6fr .4fr", background: "var(--ink)", color: "var(--paper)" }}>
                {["JOB STEP", "HAZARDS", "RISK", "CONTROLS", "RES."].map((h) => (
                  <div key={h} style={thCell}>{h}</div>
                ))}
              </div>
              {included.slice(0, 3).map((st) => (
                <div key={st.step_number} style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr .4fr 1.6fr .4fr", borderTop: "1px solid rgba(26,25,23,.22)" }}>
                  <div style={{ padding: "6px 8px", fontSize: 9.5, fontWeight: 600 }}>{st.step_number}. {st.activity}</div>
                  <div style={{ padding: "6px 8px", fontSize: 9, color: "rgba(26,25,23,.8)" }}>{st.hazards.join(" · ")}</div>
                  <div style={{ padding: "6px 8px" }}><span style={{ background: riskColors(st.initial_risk.rating)[0], color: riskColors(st.initial_risk.rating)[1], padding: "1px 5px", fontFamily: MONO, fontSize: 8, fontWeight: 600 }}>{riskCode(st.initial_risk.rating)}</span></div>
                  <div style={{ padding: "6px 8px", fontSize: 9, color: "rgba(26,25,23,.8)" }}>{st.controls[0]?.replace(/^\[[A-Z]+\]\s*/, "")}{st.controls.length > 1 ? " …" : ""}</div>
                  <div style={{ padding: "6px 8px" }}><span style={{ background: riskColors(st.residual_risk.rating)[0], color: riskColors(st.residual_risk.rating)[1], padding: "1px 5px", fontFamily: MONO, fontSize: 8, fontWeight: 600 }}>{riskCode(st.residual_risk.rating)}</span></div>
                </div>
              ))}
              <div style={{ padding: "7px 8px", fontFamily: MONO, fontSize: 8, color: "rgba(26,25,23,.5)", borderTop: "1px solid rgba(26,25,23,.22)", marginTop: "auto" }}>…CONTINUED PAGE 2</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {["PREPARED BY / SIGNATURE", "REVIEWED BY (COMPETENT PERSON)"].map((s) => (
                <div key={s}>
                  <div style={{ borderBottom: "1px solid var(--ink)", height: 20 }} />
                  <div style={{ fontFamily: MONO, fontSize: 7, letterSpacing: ".1em", color: "rgba(26,25,23,.55)", marginTop: 4 }}>{s}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 7.5, color: "rgba(26,25,23,.5)" }}>
              <span>SWMS SORTED · GENERATED {new Date().toLocaleDateString("en-AU")}</span><span>PAGE 1 OF 6</span>
            </div>
          </div>
        </div>

        {/* Side rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, flex: "1 1 300px" }}>
          {/* Letterhead details — all optional, print on page 1 */}
          <div style={{ border: "2px solid var(--ink)", background: "var(--card)", boxShadow: "6px 6px 0 rgba(26,25,23,.12)" }}>
            <div style={{ background: "var(--ink)", color: "var(--paper)", padding: "9px 14px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: COND, fontWeight: 800, fontSize: 17, letterSpacing: ".04em" }}>LETTERHEAD</span>
              <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".12em", color: "rgba(244,241,233,.65)" }}>OPTIONAL · PRINTS ON PAGE 1</span>
            </div>
            <div style={{ padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <span style={lhLabel}>COMPANY LOGO</span>
                <input ref={logoFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onLogoFile(f); e.target.value = ""; }} />
                {businessDetails.logo_base64 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ border: "2px solid var(--ink)", background: "var(--paper)", padding: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={businessDetails.logo_base64} alt="Company logo" style={{ height: 34, maxWidth: 90, objectFit: "contain", display: "block" }} />
                    </div>
                    <button onClick={() => setBusinessDetails({ logo_base64: "" })} style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".08em", color: "#7A1B0C", padding: 0 }}>✕ REMOVE</button>
                  </div>
                ) : (
                  <button onClick={() => logoFileRef.current?.click()} className="sw-btn-sm sw-btn-ink" style={{ width: "100%" }}>+ ADD LOGO</button>
                )}
                {logoError && (
                  <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: "#7A1B0C", marginTop: 6 }}>{logoError}</div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={lhLabel} htmlFor="lh-abn">ABN</label>
                  <input id="lh-abn" value={businessDetails.abn} onChange={(e) => setBusinessDetails({ abn: e.target.value })} placeholder="11 222 333 444" style={lhInput} />
                </div>
                <div>
                  <label style={lhLabel} htmlFor="lh-phone">PHONE</label>
                  <input id="lh-phone" value={businessDetails.phone} onChange={(e) => setBusinessDetails({ phone: e.target.value })} placeholder="0400 000 000" style={lhInput} />
                </div>
              </div>
              <div>
                <label style={lhLabel} htmlFor="lh-contact">RESPONSIBLE PERSON</label>
                <input id="lh-contact" value={businessDetails.contact_name} onChange={(e) => setBusinessDetails({ contact_name: e.target.value })} placeholder="Who prepared / supervises this SWMS" style={lhInput} />
              </div>
              <div>
                <label style={lhLabel} htmlFor="lh-principal">PRINCIPAL CONTRACTOR</label>
                <input id="lh-principal" value={jobDetails.principal_contractor} onChange={(e) => setJobDetails({ principal_contractor: e.target.value })} placeholder="Head contractor on this job (if any)" style={lhInput} />
              </div>
              <div>
                <label style={lhLabel} htmlFor="lh-jobref">JOB REF</label>
                <input id="lh-jobref" value={jobDetails.job_reference} onChange={(e) => setJobDetails({ job_reference: e.target.value })} placeholder="PO number, quote ref, job number…" style={lhInput} />
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".14em", color: "rgba(26,25,23,.6)", marginBottom: 12 }}>PAGES 2 — 6 · UNLOCK ON DOWNLOAD</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {THUMBS.map((widths, ti) => (
                <div key={ti} style={{ aspectRatio: "1/1.414", background: "var(--card)", border: "2px solid var(--ink)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 10, filter: "blur(3px)", display: "flex", flexDirection: "column", gap: 5 }}>
                    {widths.map((w, i) =>
                      w < 0 ? (
                        <div key={i} style={{ height: -w, background: "rgba(26,25,23,.1)" }} />
                      ) : (
                        <div key={i} style={{ height: i === 0 ? 6 : 4, background: i === 0 ? "rgba(26,25,23,.3)" : "rgba(26,25,23,.15)", width: `${w}%` }} />
                      )
                    )}
                  </div>
                  <div style={{ position: "absolute", bottom: 6, right: 8, fontFamily: MONO, fontSize: 9, color: "rgba(26,25,23,.55)" }}>
                    {ti === 3 ? "P.5–6" : `P.${ti + 2}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ border: "2px solid var(--ink)", background: "var(--card)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 9, fontFamily: MONO, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "rgba(26,25,23,.55)" }}>FORMAT</span><span style={{ fontWeight: 600 }}>A4 PDF · 6 PAGES</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "rgba(26,25,23,.55)" }}>JOB STEPS</span><span style={{ fontWeight: 600 }}>{included.length}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "rgba(26,25,23,.55)" }}>HAZARDS + CONTROLS</span><span style={{ fontWeight: 600 }}>{hzN}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "rgba(26,25,23,.55)" }}>SIGN-OFF SHEET</span><span style={{ fontWeight: 600, color: "#3F9C55" }}>INCLUDED ✓</span></div>
          </div>
          <button
            onClick={() => {
              // Letterhead survives future sessions (localStorage) — the
              // privacy policy's "remember me business details" line
              useRememberMeStore.getState().saveDetails(useBuilderStore.getState().businessDetails);
              router.push("/checkout");
            }}
            className="sw-btn"
            style={{ padding: 17, fontSize: 21, width: "100%" }}
          >
            HAPPY? PAY &amp; DOWNLOAD <span style={{ fontFamily: MONO, fontSize: 15 }}>→</span>
          </button>
          <button onClick={() => router.push("/review")} style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", color: "rgba(26,25,23,.65)", padding: 0, textAlign: "left" }}>
            ← BACK TO EDIT THE METHOD
          </button>
        </div>
      </div>
    </div>
  );
}
