"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import type { AustralianState } from "@/types/swms";

const MONO = "'IBM Plex Mono', monospace";
const COND = "'Barlow Condensed', sans-serif";
const STATES: AustralianState[] = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"];

const EXAMPLES = {
  roof: "Roof replacement on a two-storey house in Parramatta. Strip the old tiles, install safety mesh and sarking, re-sheet with Colorbond. Crew of three, two days. Scaffold edge protection going up first.",
  trench: "Trenching for a new stormwater line — 18m run, 1.2m deep, along the side boundary. Mini excavator plus hand digging near the telco pit. Two of us on site.",
  board: "Switchboard upgrade on an occupied shop in Brunswick. Isolate supply, swap the old fuse board for a new board with RCBOs, test and tag. One sparky, one apprentice, half a day.",
};

const labelStyle: React.CSSProperties = {
  fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".14em",
  marginBottom: 8, color: "rgba(26,25,23,.6)",
};
const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", border: "2px solid var(--ink)",
  background: "var(--card)", padding: "12px 14px", fontFamily: "var(--f-body)",
  fontSize: 15, outline: "none",
};

type Mode = "type" | "talk" | "photo";

export default function JobPage() {
  const router = useRouter();
  const {
    businessDetails, setBusinessDetails,
    jobDetails, setJobDetails,
    photoHazards, setPhotoHazards,
    setGeneratedSwms, setCurrentStep,
  } = useBuilderStore();

  useEffect(() => { setCurrentStep("job"); }, [setCurrentStep]);

  const [mode, setMode] = useState<Mode>("type");
  const text = jobDetails.job_description;
  const setText = (v: string) => {
    setJobDetails({ job_description: v.slice(0, 2000) });
    setGeneratedSwms(null); // stale output — regenerate on next review
  };

  /* ── Voice (Web Speech API, en-AU) ── */
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recSecs, setRecSecs] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef = useRef<any>(null);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Finalized speech accumulates here; interim text is display-only.
  // Browsers re-send interim segments (and Android re-sends cumulative
  // finals), so naive concatenation duplicates words.
  const finalRef = useRef("");

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { setSpeechSupported(false); return; }
    const r = new SR();
    r.lang = "en-AU";
    r.continuous = true;
    r.interimResults = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const seg = (e.results[i][0].transcript || "").trim();
        if (!seg) continue;
        if (e.results[i].isFinal) {
          const acc = finalRef.current.trim();
          if (acc.endsWith(seg)) continue;               // duplicate resend
          if (acc && seg.startsWith(acc)) finalRef.current = seg; // cumulative resend (Android)
          else finalRef.current = acc ? `${acc} ${seg}` : seg;
        } else {
          interim = seg; // latest interim only — never accumulated
        }
      }
      setTranscript(`${finalRef.current} ${interim}`.trim());
    };
    r.onend = () => setRecording(false);
    recogRef.current = r;
    return () => { try { r.stop(); } catch { /* already stopped */ } };
  }, []);

  useEffect(() => {
    if (recording) {
      setRecSecs(0);
      recTimerRef.current = setInterval(() => setRecSecs((s) => s + 1), 1000);
    } else if (recTimerRef.current) {
      clearInterval(recTimerRef.current);
      recTimerRef.current = null;
    }
    return () => { if (recTimerRef.current) clearInterval(recTimerRef.current); };
  }, [recording]);

  const toggleRec = () => {
    const r = recogRef.current;
    if (!r) return;
    if (recording) { r.stop(); setRecording(false); }
    else {
      finalRef.current = "";
      setTranscript("");
      try { r.start(); setRecording(true); } catch { /* mid-restart */ }
    }
  };
  const useTranscript = () => {
    if (!transcript) return;
    setText(text ? `${text} ${transcript}` : transcript);
    if (recording) toggleRec();
    setMode("type");
  };

  /* ── Photo scan ── */
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const onPhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);
      setScanning(true);
      setScanError(null);
      try {
        const res = await fetch("/api/analyze-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_base64: dataUrl.replace(/^data:image\/\w+;base64,/, ""),
            job_description: text || undefined,
          }),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.hazards)) {
          setPhotoHazards(data.hazards.map((h: { hazard: string; suggested_controls?: string[] }) => ({
            hazard: h.hazard, suggested_controls: h.suggested_controls ?? [], selected: true,
          })));
          setGeneratedSwms(null);
        } else {
          setScanError(data.error || "Couldn't scan that photo — try another angle.");
        }
      } catch {
        setScanError("Connection dropped mid-scan. Give it another go.");
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  /* ── Generate ── */
  const canGen = text.trim().length >= 20 && !!businessDetails.state;
  const generate = () => {
    if (!canGen) return;
    router.push("/review");
  };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "56px 28px 80px", width: "100%", boxSizing: "border-box" }}>
      <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".16em", color: "rgba(26,25,23,.6)", marginBottom: 12 }}>STEP 01 — DESCRIBE THE JOB</div>
      <h1 style={{ margin: "0 0 12px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(44px,5vw,64px)", lineHeight: 0.95, textTransform: "uppercase" }}>What&apos;s the job?</h1>
      <p style={{ margin: "0 0 32px", fontSize: 16.5, color: "rgba(26,25,23,.72)" }}>Type it, talk it, or snap a photo. Slang&apos;s fine — we speak tradie.</p>

      {/* Mode tabs */}
      <div style={{ display: "flex", border: "2px solid var(--ink)", width: "max-content", marginBottom: 22 }}>
        {(["type", "talk", "photo"] as Mode[]).map((m, i) => (
          <button key={m} onClick={() => setMode(m)} style={{ border: "none", borderRight: i < 2 ? "2px solid var(--ink)" : "none", padding: "11px 22px", cursor: "pointer", fontFamily: COND, fontWeight: 700, fontSize: 17, letterSpacing: ".08em", background: mode === m ? "var(--swa)" : "transparent", color: "var(--ink)" }}>
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      {/* TYPE */}
      {mode === "type" && (
        <div style={{ marginBottom: 12 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="e.g. Replacing the roof on a two-storey house in Parramatta — strip the tiles, re-sheet with Colorbond, crew of three, two days…"
            style={{ width: "100%", boxSizing: "border-box", border: "2px solid var(--ink)", background: "var(--card)", padding: 18, fontFamily: "var(--f-body)", fontSize: 16.5, lineHeight: 1.55, resize: "vertical", outline: "none", boxShadow: "6px 6px 0 rgba(26,25,23,.12)" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: "rgba(26,25,23,.55)" }}>TRY:</span>
              {([["RE-ROOF", EXAMPLES.roof], ["TRENCHING", EXAMPLES.trench], ["SWITCHBOARD", EXAMPLES.board]] as const).map(([label, ex]) => (
                <button key={label} className="sw-chip-ghost" onClick={() => setText(ex)} style={{ padding: "6px 12px", fontSize: 11, fontWeight: 500, letterSpacing: ".06em" }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11.5, color: "rgba(26,25,23,.55)" }}>{text.length} / 2000</div>
          </div>
        </div>
      )}

      {/* TALK */}
      {mode === "talk" && (
        <div style={{ border: "2px solid var(--ink)", background: "var(--card)", padding: 28, marginBottom: 12, boxShadow: "6px 6px 0 rgba(26,25,23,.12)" }}>
          {!speechSupported ? (
            <div style={{ fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: "rgba(26,25,23,.7)" }}>
              THIS BROWSER CAN&apos;T DO VOICE — TYPE IT INSTEAD, OR OPEN THE SITE IN CHROME OR SAFARI.
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
                <button onClick={toggleRec} aria-label={recording ? "Stop recording" : "Start recording"} style={{ width: 64, height: 64, border: "2px solid var(--ink)", background: "var(--swa)", display: "flex", alignItems: "center", justifyContent: "center", animation: recording ? "swPulse 1.6s infinite" : "none", flexShrink: 0, cursor: "pointer" }}>
                  <div style={{ width: 16, height: 16, background: "var(--sorange)", borderRadius: recording ? 2 : "50%" }} />
                </button>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 36 }}>
                  {[0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84].map((d) => (
                    <div key={d} style={{ width: 5, height: "100%", background: "var(--ink)", animation: recording ? `swBar 1s ease-in-out ${d}s infinite` : "none", transform: recording ? undefined : "scaleY(.25)", transformOrigin: "bottom" }} />
                  ))}
                </div>
                <div style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", color: recording ? "var(--sorange)" : "rgba(26,25,23,.5)" }}>
                  {recording ? `● REC ${Math.floor(recSecs / 60)}:${String(recSecs % 60).padStart(2, "0")}` : "TAP THE MIC TO START"}
                </div>
              </div>
              <div style={{ border: "1px solid rgba(26,25,23,.3)", padding: 16, fontFamily: MONO, fontSize: 13, lineHeight: 1.65, color: "rgba(26,25,23,.85)", marginBottom: 16, minHeight: 44 }}>
                {transcript ? `"${transcript}"` : "Your words land here as you talk…"}
              </div>
              <button onClick={useTranscript} disabled={!transcript} className="sw-chip-ghost" style={{ padding: "10px 18px", fontFamily: COND, fontWeight: 700, fontSize: 16, letterSpacing: ".07em", opacity: transcript ? 1 : 0.4 }}>
                USE THIS TRANSCRIPT ↓
              </button>
            </>
          )}
        </div>
      )}

      {/* PHOTO */}
      {mode === "photo" && (
        <div style={{ border: "2px solid var(--ink)", background: "var(--card)", padding: 24, marginBottom: 12, boxShadow: "6px 6px 0 rgba(26,25,23,.12)" }}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhoto(f); }} />
          <button onClick={() => fileRef.current?.click()} style={{ width: "100%", height: 230, marginBottom: 16, border: "2px dashed rgba(26,25,23,.45)", background: photoPreview ? `center/cover no-repeat url(${photoPreview})` : "transparent", cursor: "pointer", fontFamily: MONO, fontSize: 12, letterSpacing: ".08em", color: "rgba(26,25,23,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            {!photoPreview && "DROP A SITE PHOTO — WE'LL SCAN IT FOR HAZARDS"}
          </button>
          {scanning && (
            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".08em", color: "var(--sorange)", marginBottom: 10 }}>▶ SCANNING FOR HAZARDS…</div>
          )}
          {scanError && (
            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".04em", color: "var(--sorange)", marginBottom: 10 }}>{scanError.toUpperCase()}</div>
          )}
          {photoHazards.length > 0 && !scanning && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".12em", color: "rgba(26,25,23,.6)" }}>HAZARDS DETECTED</div>
                <div style={{ background: "var(--sorange)", color: "#fff", fontFamily: MONO, fontSize: 11, fontWeight: 600, padding: "2px 8px" }}>{photoHazards.filter((h) => h.selected).length}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {photoHazards.map((h, i) => (
                  <button key={i} onClick={() => { useBuilderStore.getState().togglePhotoHazard(i); setGeneratedSwms(null); }} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: MONO, fontSize: 12.5, color: "var(--ink)", textAlign: "left", opacity: h.selected ? 1 : 0.4 }}>
                    <div style={{ width: 9, height: 9, background: h.selected ? "var(--sorange)" : "rgba(26,25,23,.3)", flexShrink: 0 }} />
                    {h.hazard.toUpperCase()}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 11, letterSpacing: ".06em", color: "#3F9C55", fontWeight: 600 }}>✓ ADDED TO YOUR JOB DESCRIPTION</div>
            </>
          )}
        </div>
      )}

      {/* State chips */}
      <div style={{ margin: "30px 0 26px" }}>
        <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".14em", marginBottom: 12 }}>
          WHICH STATE? <span style={{ color: "var(--sorange)" }}>*</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {STATES.map((code) => {
            const selected = businessDetails.state === code;
            return (
              <button key={code} onClick={() => { setBusinessDetails({ state: code }); setGeneratedSwms(null); }} style={{ border: "2px solid var(--ink)", padding: "10px 17px", cursor: "pointer", fontFamily: MONO, fontSize: 13, fontWeight: 600, letterSpacing: ".08em", background: selected ? "var(--ink)" : "transparent", color: selected ? "var(--paper)" : "var(--ink)" }}>
                {code}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional details */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 14, marginBottom: 38 }}>
        <div>
          <div style={labelStyle}>COMPANY / PCBU <span style={{ fontWeight: 400 }}>(OPTIONAL)</span></div>
          <input value={businessDetails.business_name} onChange={(e) => setBusinessDetails({ business_name: e.target.value })} placeholder="Harbour City Roofing Pty Ltd" style={inputStyle} />
        </div>
        <div>
          <div style={labelStyle}>SITE ADDRESS <span style={{ fontWeight: 400 }}>(OPTIONAL)</span></div>
          <input value={jobDetails.site_address} onChange={(e) => setJobDetails({ site_address: e.target.value })} placeholder="14 Keeler St, Parramatta" style={inputStyle} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <button onClick={() => router.push("/")} style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: MONO, fontSize: 12.5, fontWeight: 600, letterSpacing: ".1em", padding: 0, color: "var(--ink)" }}>← BACK</button>
        <button onClick={generate} disabled={!canGen} className="sw-btn" style={{ padding: "16px 30px", fontSize: 21 }}>
          GENERATE SWMS <span style={{ fontFamily: MONO, fontSize: 15 }}>→</span>
        </button>
      </div>
      <div style={{ textAlign: "right", marginTop: 12, fontFamily: MONO, fontSize: 11, letterSpacing: ".06em", color: "rgba(26,25,23,.5)" }}>
        {canGen ? "FREE TO GENERATE — PAY ONLY WHEN YOU DOWNLOAD" : "DESCRIBE THE JOB + PICK A STATE TO GENERATE"}
      </div>
    </div>
  );
}
