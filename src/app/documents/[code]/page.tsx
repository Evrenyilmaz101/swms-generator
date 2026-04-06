"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface SignatureInfo {
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
  }, [code, fetchStatus]);

  // Re-download with signatures
  async function handleRedownload() {
    setDownloading(true);

    try {
      // Get stored SWMS data from sessionStorage or prompt
      // For now, we'll call the sign/download endpoint with minimal data
      // The tradie would need their original data — we should store it in the DB
      // For MVP, we'll show a message that they need the original data

      // Try localStorage first (stored by download success page)
      let stored = localStorage.getItem(`swms_doc_${code}`);

      // Fallback to sessionStorage
      if (!stored) {
        const pendingId = sessionStorage.getItem("pending_swms_session");
        const dataKey = pendingId ? `swms_data_${pendingId}` : null;
        stored = dataKey ? sessionStorage.getItem(dataKey) : null;
      }

      if (!stored) {
        alert("SWMS document data not found in this browser. If you're on a different device, please download from the original browser or re-generate the SWMS.");
        setDownloading(false);
        return;
      }

      const swmsPayload = JSON.parse(stored);

      const res = await fetch("/api/sign/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          ...swmsPayload,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate");

      const blob = await res.blob();
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
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="w-8 h-8 text-[#78716C] animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-[14px] text-[#78716C] mt-4">Loading document...</p>
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="max-w-lg mx-auto py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-[24px] font-bold text-[#0C0A09]">Document not found</h1>
          <p className="text-[15px] text-[#78716C] mt-2">{error}</p>
        </div>
      </Shell>
    );
  }

  if (!status) return null;

  const signedPercent = Math.round((status.signature_count / Math.max(status.worker_count, status.signature_count, 1)) * 100);

  return (
    <Shell>
      <div className="max-w-[640px] mx-auto py-10 sm:py-16">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold text-[#78716C] tracking-[0.15em]">
              SWMS DOCUMENT
            </p>
            <h1 className="text-[28px] font-bold text-[#0C0A09] tracking-[-0.02em] mt-1">
              {status.business_name}
            </h1>
            <p className="text-[15px] text-[#78716C] mt-1 leading-relaxed max-w-md">
              {status.job_description}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] font-semibold text-[#78716C] tracking-[0.1em]">CODE</span>
            <p className="text-[18px] font-mono font-bold text-[#0C0A09] tracking-wider">{code}</p>
          </div>
        </div>

        {/* Sign-off progress */}
        <div className="mt-8 bg-white rounded-2xl border border-[#E7E5E4] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-[#0C0A09]">Worker Sign-Off</h2>
            <span className="text-[14px] font-semibold text-[#0C0A09]">
              {status.signature_count} signed
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-[#E7E5E4] overflow-hidden mb-6">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${Math.max(signedPercent, 2)}%` }}
            />
          </div>

          {/* Signed workers list */}
          {status.signatures.length > 0 ? (
            <div className="space-y-2 mb-6">
              {status.signatures.map((sig, i) => {
                const date = new Date(sig.signed_at).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#F5F5F4] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[#0C0A09]">{sig.worker_name}</p>
                        <p className="text-[12px] text-[#78716C]">{sig.worker_role || "Worker"}</p>
                      </div>
                    </div>
                    <span className="text-[12px] text-[#A8A29E]">{date}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-[14px] text-[#A8A29E]">No signatures yet. Share the link with your crew.</p>
            </div>
          )}

          {/* Share link */}
          <div className="pt-4 border-t border-[#E7E5E4]">
            <p className="text-[13px] font-semibold text-[#0C0A09] mb-2">Share sign-off link</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#FAFAF9] border border-[#E7E5E4] rounded-lg px-3 py-2.5 text-[12px] text-[#0C0A09] font-mono truncate">
                {signOffUrl}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(signOffUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="shrink-0 px-4 py-2.5 bg-[#0C0A09] text-white text-[12px] font-semibold rounded-lg hover:bg-[#1C1917] transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <a
                href={`sms:?body=Sign off on the SWMS before you get to site: ${signOffUrl}`}
                className="flex-1 text-center py-2 border border-[#E7E5E4] rounded-lg text-[12px] font-medium text-[#0C0A09] hover:bg-[#F5F5F4] transition-colors"
              >
                Text
              </a>
              <a
                href={`https://wa.me/?text=Sign off on the SWMS before you get to site: ${encodeURIComponent(signOffUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-2 border border-[#E7E5E4] rounded-lg text-[12px] font-medium text-[#0C0A09] hover:bg-[#F5F5F4] transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={`mailto:?subject=SWMS Sign-Off&body=Sign off on the SWMS: ${signOffUrl}`}
                className="flex-1 text-center py-2 border border-[#E7E5E4] rounded-lg text-[12px] font-medium text-[#0C0A09] hover:bg-[#F5F5F4] transition-colors"
              >
                Email
              </a>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleRedownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-[#0C0A09] text-white text-[15px] font-semibold rounded-xl hover:bg-[#1C1917] transition-colors disabled:opacity-70"
          >
            {downloading ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download PDF with signatures
              </>
            )}
          </button>

          <button
            onClick={fetchStatus}
            className="w-full flex items-center justify-center gap-2 px-8 py-3 border border-[#E7E5E4] rounded-xl text-[14px] font-medium text-[#0C0A09] hover:bg-[#F5F5F4] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Refresh status
          </button>
        </div>

        <p className="text-[12px] text-[#A8A29E] text-center mt-6">
          Bookmark this page to check back later. Sign-off code valid for 12 months.
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <header className="bg-[#FAFAF9] border-b border-[#E7E5E4]">
        <div className="max-w-[640px] mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0C0A09] flex items-center justify-center">
              <span className="text-[13px] font-extrabold text-[#FFD600]">S</span>
            </div>
            <span className="text-sm font-semibold text-[#0C0A09] tracking-[-0.01em]">Instant SWMS</span>
          </Link>
          <Link href="/" className="text-[13px] font-medium text-[#78716C] hover:text-[#0C0A09] transition-colors">
            New SWMS
          </Link>
        </div>
      </header>
      <main className="px-5">
        {children}
      </main>
    </div>
  );
}
