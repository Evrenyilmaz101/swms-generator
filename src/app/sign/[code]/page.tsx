"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const MONO = "'IBM Plex Mono', monospace";
const COND = "'Barlow Condensed', sans-serif";

const label: React.CSSProperties = { fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: ".12em", color: "rgba(26,25,23,.6)", display: "block", marginBottom: 6 };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "2px solid var(--ink)", background: "var(--card)", padding: "13px 14px", fontFamily: "var(--f-body)", fontSize: 16, outline: "none" };

type PageState = "loading" | "ready" | "signing" | "submitting" | "success" | "error";

interface SessionData {
  business_name: string;
  job_description: string;
  state: string;
  worker_count: number;
  signature_count: number;
}

export default function SignOffPage() {
  const params = useParams();
  const code = (params.code as string)?.toUpperCase();

  const [state, setState] = useState<PageState>("loading");
  const [session, setSession] = useState<SessionData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [workerRole, setWorkerRole] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [signatureCount, setSignatureCount] = useState(0);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const hasDrawnRef = useRef(false);

  // Validate code on mount
  useEffect(() => {
    if (!code) return;

    fetch(`/api/sign/validate?code=${code}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setSession(data);
          setSignatureCount(data.signature_count);
          setState("ready");
        } else {
          setErrorMsg(data.error || "Invalid sign-off code");
          setState("error");
        }
      })
      .catch(() => {
        setErrorMsg("Failed to validate. Check your connection.");
        setState("error");
      });
  }, [code]);

  // Canvas drawing handlers
  const getCanvasPoint = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if ("touches" in e) {
        const touch = e.touches[0];
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }
      return {
        x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
        y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const startDraw = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      isDrawingRef.current = true;
      lastPointRef.current = getCanvasPoint(e);
      hasDrawnRef.current = true;
      setState("signing");
    },
    [getCanvasPoint]
  );

  const draw = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      const point = getCanvasPoint(e);
      if (!point || !lastPointRef.current) return;

      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = "#1A1917";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      lastPointRef.current = point;
    },
    [getCanvasPoint]
  );

  const endDraw = useCallback(() => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }, []);

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
    setState("ready");
  }

  // Pass-the-phone: reset the form so the next crew member can sign
  // on the same device without reloading
  function nextWorker() {
    setWorkerName("");
    setWorkerRole("");
    setLicenceNumber("");
    hasDrawnRef.current = false;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setState("ready");
  }

  async function handleSubmit() {
    if (!workerName.trim()) return;
    if (!hasDrawnRef.current || !canvasRef.current) return;

    setState("submitting");

    const signature_base64 = canvasRef.current.toDataURL("image/png");

    try {
      const res = await fetch("/api/sign/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          worker_name: workerName.trim(),
          worker_role: workerRole.trim() || undefined,
          licence_number: licenceNumber.trim() || undefined,
          signature_base64,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSignatureCount(data.signature_count);
        setState("success");
      } else {
        setErrorMsg(data.error || "Failed to submit");
        setState("error");
      }
    } catch {
      setErrorMsg("Connection error. Please try again.");
      setState("error");
    }
  }

  // ===== RENDER =====

  // Loading
  if (state === "loading") {
    return (
      <Shell>
        <div style={{ textAlign: "center", padding: "100px 0", fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".12em", color: "rgba(26,25,23,.6)" }}>
          ▶ CHECKING YOUR SIGN-OFF CODE…
        </div>
      </Shell>
    );
  }

  // Error
  if (state === "error") {
    return (
      <Shell>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 0", textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".14em", color: "var(--sorange)", marginBottom: 14 }}>⚠ CAN&apos;T LOAD SIGN-OFF</div>
          <h1 style={{ margin: "0 0 16px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(36px,8vw,52px)", lineHeight: 0.95, textTransform: "uppercase" }}>No good.</h1>
          <p style={{ margin: "0 0 30px", fontSize: 16, color: "rgba(26,25,23,.72)" }}>{errorMsg}</p>
          <Link href="/" className="sw-ghost" style={{ padding: "13px 24px", fontSize: 17 }}>GO TO SWMS SORTED</Link>
        </div>
      </Shell>
    );
  }

  // Success
  if (state === "success") {
    return (
      <Shell>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "64px 0", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, margin: "0 auto 26px", border: "2px solid var(--ink)", background: "var(--swa)", boxShadow: "6px 6px 0 var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700 }}>✓</div>
          <h1 style={{ margin: "0 0 10px", fontFamily: COND, fontWeight: 800, fontSize: "clamp(42px,9vw,60px)", lineHeight: 0.95, textTransform: "uppercase" }}>Signed off.</h1>
          <p style={{ margin: "0 0 22px", fontSize: 16, color: "rgba(26,25,23,.72)" }}>
            Good on ya, {workerName.split(" ")[0]}. Your signature&apos;s on the record.
          </p>
          <div style={{ display: "inline-block", border: "2px solid var(--ink)", background: "var(--card)", padding: "8px 16px", fontFamily: MONO, fontSize: 12, fontWeight: 600, letterSpacing: ".08em", marginBottom: 30 }}>
            {signatureCount} WORKER{signatureCount === 1 ? "" : "S"} SIGNED ON
          </div>
          <button onClick={nextWorker} className="sw-btn-ink" style={{ width: "100%", padding: 16, fontSize: 18 }}>
            PASS THE PHONE — NEXT WORKER SIGNS →
          </button>
          <p style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", color: "rgba(26,25,23,.5)", marginTop: 14 }}>
            HAND IT TO THE NEXT CREW MEMBER, OR CLOSE THIS WHEN EVERYONE&apos;S ON
          </p>
        </div>
      </Shell>
    );
  }

  // Ready / Signing
  return (
    <Shell>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 0 60px" }}>
        {/* Job summary */}
        <div style={{ border: "2px solid var(--ink)", background: "var(--card)", boxShadow: "6px 6px 0 rgba(26,25,23,.12)", marginBottom: 24 }}>
          <div style={{ background: "var(--ink)", color: "var(--paper)", padding: "9px 14px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: COND, fontWeight: 800, fontSize: 18, letterSpacing: ".04em" }}>SWMS SIGN-OFF</span>
            <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: "rgba(244,241,233,.75)" }}>{signatureCount} SIGNED</span>
          </div>
          <div style={{ padding: "12px 14px" }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{session?.business_name}</div>
            <p style={{ margin: 0, fontSize: 13.5, color: "rgba(26,25,23,.72)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{session?.job_description}</p>
            <div style={{ marginTop: 10 }}>
              <span style={{ border: "1px solid var(--ink)", background: "var(--swa)", padding: "3px 10px", fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: ".1em" }}>{session?.state}</span>
            </div>
          </div>
        </div>

        {/* Worker details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
          <div>
            <label style={label} htmlFor="w-name">YOUR FULL NAME *</label>
            <input id="w-name" type="text" value={workerName} onChange={(e) => setWorkerName(e.target.value)} placeholder="e.g. John Smith" style={input} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={label} htmlFor="w-role">ROLE / TRADE</label>
              <input id="w-role" type="text" value={workerRole} onChange={(e) => setWorkerRole(e.target.value)} placeholder="e.g. Electrician" style={input} />
            </div>
            <div>
              <label style={label} htmlFor="w-licence">LICENCE NO.</label>
              <input id="w-licence" type="text" value={licenceNumber} onChange={(e) => setLicenceNumber(e.target.value)} placeholder="Optional" style={input} />
            </div>
          </div>
        </div>

        {/* Signature pad */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={label}>YOUR SIGNATURE *</span>
            {state === "signing" && (
              <button onClick={clearSignature} style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".08em", color: "#7A1B0C", padding: 0 }}>
                ✕ CLEAR
              </button>
            )}
          </div>
          <div style={{ position: "relative", background: "var(--card)", border: "2px solid var(--ink)", boxShadow: "5px 5px 0 rgba(26,25,23,.12)", overflow: "hidden", touchAction: "none" }}>
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              style={{ width: "100%", height: 160, cursor: "crosshair", display: "block" }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
            {state === "ready" && !hasDrawnRef.current && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".08em", color: "rgba(26,25,23,.35)" }}>SIGN HERE — FINGER OR MOUSE</p>
              </div>
            )}
            <div style={{ position: "absolute", bottom: 14, left: 16, right: 16, borderBottom: "1px solid rgba(26,25,23,.3)", pointerEvents: "none" }} />
          </div>
        </div>

        {/* Disclaimer + Submit */}
        <p style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".04em", color: "rgba(26,25,23,.55)", textAlign: "center", margin: "0 0 16px", lineHeight: 1.6 }}>
          BY SIGNING, I CONFIRM I&apos;VE READ, UNDERSTOOD &amp; AGREE TO COMPLY WITH THIS SWMS
        </p>

        <button
          onClick={handleSubmit}
          disabled={!workerName.trim() || !hasDrawnRef.current || state === "submitting"}
          className="sw-btn"
          style={{ width: "100%", padding: 17, fontSize: 20, opacity: (!workerName.trim() || !hasDrawnRef.current || state === "submitting") ? 0.55 : 1 }}
        >
          {state === "submitting" ? "SAVING…" : "SIGN & CONFIRM ✓"}
        </button>
      </div>
    </Shell>
  );
}

// Shell wrapper — consistent layout for all states
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 10, background: "repeating-linear-gradient(-45deg, #1A1917 0 10px, var(--swa) 10px 20px)", borderBottom: "2px solid var(--ink)" }} />
      <header style={{ borderBottom: "2px solid var(--ink)", background: "var(--paper)" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", height: 54, display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--ink)" }}>
            <div style={{ width: 24, height: 24, border: "2px solid var(--ink)", background: "repeating-linear-gradient(-45deg, #1A1917 0 6px, var(--swa) 6px 12px)" }} />
            <span style={{ fontFamily: COND, fontWeight: 800, fontSize: 19, letterSpacing: ".04em" }}>SWMS SORTED</span>
          </Link>
        </div>
      </header>
      <main style={{ padding: "0 20px", flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
