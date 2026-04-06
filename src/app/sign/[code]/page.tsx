"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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
      ctx.strokeStyle = "#0C0A09";
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
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="w-8 h-8 text-[#78716C] animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-[14px] text-[#78716C] mt-4">Validating sign-off code...</p>
        </div>
      </Shell>
    );
  }

  // Error
  if (state === "error") {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-[24px] font-bold text-[#0C0A09]">Can&apos;t load sign-off</h1>
          <p className="text-[15px] text-[#78716C] mt-2 max-w-sm">{errorMsg}</p>
          <Link href="/" className="mt-6 text-[14px] font-medium text-[#0C0A09] underline">
            Go to Instant SWMS
          </Link>
        </div>
      </Shell>
    );
  }

  // Success
  if (state === "success") {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-[28px] font-bold text-[#0C0A09]">Signed off</h1>
          <p className="text-[15px] text-[#78716C] mt-2">
            Thanks {workerName.split(" ")[0]}. Your signature has been recorded.
          </p>
          <div className="mt-6 bg-[#F5F5F4] rounded-xl px-5 py-3 text-[13px] text-[#78716C]">
            {signatureCount} of {session?.worker_count} workers signed
          </div>
        </div>
      </Shell>
    );
  }

  // Ready / Signing
  return (
    <Shell>
      <div className="max-w-lg mx-auto py-6 sm:py-10">
        {/* Job summary */}
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-[#0C0A09]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            <h2 className="text-[14px] font-semibold text-[#0C0A09]">SWMS Sign-Off</h2>
          </div>
          <p className="text-[13px] text-[#78716C] leading-relaxed">
            <strong>{session?.business_name}</strong> — {session?.job_description}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-[12px] font-medium text-[#78716C] bg-[#F5F5F4] px-2 py-1 rounded">
              {session?.state}
            </span>
            <span className="text-[12px] font-medium text-[#78716C]">
              {signatureCount} of {session?.worker_count} signed
            </span>
          </div>
        </div>

        {/* Worker details */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-[13px] font-medium text-[#0C0A09] mb-1.5">
              Your full name *
            </label>
            <input
              type="text"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              placeholder="e.g. John Smith"
              className="w-full h-12 px-4 text-[15px] text-[#0C0A09] placeholder:text-[#A8A29E] bg-white border border-[#E7E5E4] rounded-xl outline-none focus:border-[#0C0A09] transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-[#0C0A09] mb-1.5">
                Role / Trade
              </label>
              <input
                type="text"
                value={workerRole}
                onChange={(e) => setWorkerRole(e.target.value)}
                placeholder="e.g. Electrician"
                className="w-full h-12 px-4 text-[15px] text-[#0C0A09] placeholder:text-[#A8A29E] bg-white border border-[#E7E5E4] rounded-xl outline-none focus:border-[#0C0A09] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#0C0A09] mb-1.5">
                Licence No.
              </label>
              <input
                type="text"
                value={licenceNumber}
                onChange={(e) => setLicenceNumber(e.target.value)}
                placeholder="Optional"
                className="w-full h-12 px-4 text-[15px] text-[#0C0A09] placeholder:text-[#A8A29E] bg-white border border-[#E7E5E4] rounded-xl outline-none focus:border-[#0C0A09] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Signature pad */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[13px] font-medium text-[#0C0A09]">
              Your signature *
            </label>
            {(state === "signing") && (
              <button
                onClick={clearSignature}
                className="text-[12px] font-medium text-[#78716C] hover:text-[#0C0A09] transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="relative bg-white border-2 border-[#E7E5E4] rounded-xl overflow-hidden" style={{ touchAction: "none" }}>
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full cursor-crosshair"
              style={{ height: 160 }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
            {state === "ready" && !hasDrawnRef.current && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-[14px] text-[#D6D3D1]">Sign here with your finger or mouse</p>
              </div>
            )}
            <div className="absolute bottom-3 left-4 right-4 border-b border-[#E7E5E4]" />
          </div>
        </div>

        {/* Disclaimer + Submit */}
        <p className="text-[12px] text-[#A8A29E] text-center mb-4 leading-relaxed">
          By signing, I confirm I have read, understood, and agree to comply with this Safe Work Method Statement.
        </p>

        <button
          onClick={handleSubmit}
          disabled={!workerName.trim() || !hasDrawnRef.current || state === "submitting"}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-[#0C0A09] text-white text-[16px] font-semibold rounded-xl hover:bg-[#1C1917] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "submitting" ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sign &amp; confirm
            </>
          )}
        </button>
      </div>
    </Shell>
  );
}

// Shell wrapper — consistent layout for all states
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <header className="bg-[#FAFAF9] border-b border-[#E7E5E4]">
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0C0A09] flex items-center justify-center">
              <span className="text-[13px] font-extrabold text-[#FFD600]">S</span>
            </div>
            <span className="text-sm font-semibold text-[#0C0A09] tracking-[-0.01em]">Instant SWMS</span>
          </Link>
        </div>
      </header>
      <main className="px-4 sm:px-5">
        {children}
      </main>
    </div>
  );
}
