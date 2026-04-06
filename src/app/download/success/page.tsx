"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface PaymentInfo {
  plan: string;
  email: string | null;
  amount: number;
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
          <div className="text-center">
            <svg className="w-8 h-8 text-[#78716C] animate-spin mx-auto" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-[14px] text-[#78716C] mt-4">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [signOffUrl, setSignOffUrl] = useState<string | null>(null);
  const [signOffCode, setSignOffCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError("No payment session found. Please contact support.");
      setVerifying(false);
      return;
    }

    async function verifyPayment() {
      try {
        const response = await fetch(
          `/api/verify-payment?session_id=${sessionId}`
        );
        const data = await response.json();

        if (data.success) {
          setPaymentInfo(data.payment);
        } else {
          setError(
            data.error || "Payment verification failed. Please contact support."
          );
        }
      } catch {
        setError("Unable to verify payment. Please contact support.");
      } finally {
        setVerifying(false);
      }
    }

    verifyPayment();
  }, [sessionId]);

  // Create sign-off session
  async function createSignOff(businessName: string, jobDescription: string, state: string) {
    try {
      const res = await fetch("/api/sign/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName,
          job_description: jobDescription,
          state: state,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSignOffUrl(data.sign_url);
        setSignOffCode(data.sign_code);
        return data.sign_code;
      }
    } catch {
      // Not critical
    }
    return null;
  }

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);

    try {
      const pendingSessionId = sessionStorage.getItem("pending_swms_session");
      const dataKey = pendingSessionId
        ? `swms_data_${pendingSessionId}`
        : null;
      const storedData = dataKey ? sessionStorage.getItem(dataKey) : null;

      if (!storedData) {
        setError(
          "SWMS data not found in this browser session. If you closed the tab, please contact support with your payment confirmation."
        );
        return;
      }

      const swmsPayload = JSON.parse(storedData);

      const response = await fetch("/api/download/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(swmsPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const businessName =
        swmsPayload.business_name?.replace(/[^a-zA-Z0-9]/g, "_") || "SWMS";
      a.download = `SWMS-${businessName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloaded(true);

      // Create sign-off session and store data for re-download
      const signResult = await createSignOff(
        swmsPayload.business_name || "",
        swmsPayload.swms_data?.scope_of_work || swmsPayload.job_description || "",
        swmsPayload.state || ""
      );

      // Store SWMS data keyed by sign-off code for re-download later
      if (signResult) {
        try {
          localStorage.setItem(`swms_doc_${signResult}`, JSON.stringify(swmsPayload));
        } catch {
          // localStorage full — not critical
        }
      }

      // Clean up sessionStorage
      if (dataKey) sessionStorage.removeItem(dataKey);
      sessionStorage.removeItem("pending_swms_session");
    } catch {
      setError("Failed to generate PDF. Please try again or contact support.");
    } finally {
      setIsDownloading(false);
    }
  }, []);

  // Loading
  if (verifying) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="w-8 h-8 text-[#78716C] animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-[14px] text-[#78716C] mt-4">Verifying your payment...</p>
        </div>
      </Shell>
    );
  }

  // Error
  if (error) {
    return (
      <Shell>
        <div className="max-w-lg mx-auto py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-[24px] font-bold text-[#0C0A09]">Something went wrong</h1>
          <p className="text-[15px] text-[#78716C] mt-2">{error}</p>
          <div className="mt-6 space-y-3">
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full h-11 rounded-[10px] bg-[#0C0A09] text-white text-[14px] font-semibold hover:bg-[#1C1917] transition-colors"
            >
              Back to Home
            </button>
            <p className="text-[12px] text-[#A8A29E]">
              Need help? Email <a href="mailto:support@swmsgenerator.com.au" className="underline">support@swmsgenerator.com.au</a>
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  // Success
  return (
    <Shell>
      <div className="max-w-[560px] mx-auto py-12 sm:py-20">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-[32px] font-bold text-[#0C0A09] tracking-[-0.03em] mt-6">
            Payment successful
          </h1>
          <p className="text-[17px] text-[#78716C] mt-2">
            Your SWMS is ready to download.
          </p>
        </div>

        {/* Payment info */}
        {paymentInfo && (
          <div className="mt-8 bg-white rounded-2xl border border-[#E7E5E4] p-5 space-y-2">
            <div className="flex justify-between text-[14px]">
              <span className="text-[#78716C]">Plan</span>
              <span className="font-semibold text-[#0C0A09]">
                {paymentInfo.plan === "single" ? "Single SWMS" : "SWMS 3-Pack"}
              </span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-[#78716C]">Amount</span>
              <span className="font-semibold text-[#0C0A09]">
                ${(paymentInfo.amount / 100).toFixed(2)} AUD
              </span>
            </div>
            {paymentInfo.email && (
              <div className="flex justify-between text-[14px]">
                <span className="text-[#78716C]">Receipt sent to</span>
                <span className="font-semibold text-[#0C0A09]">{paymentInfo.email}</span>
              </div>
            )}
          </div>
        )}

        {/* Download button */}
        {!downloaded ? (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="mt-6 w-full flex items-center justify-center gap-2 px-8 py-4 bg-[#0C0A09] text-white text-[16px] font-semibold rounded-xl hover:bg-[#1C1917] transition-colors disabled:opacity-70"
          >
            {isDownloading ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Your SWMS
              </>
            )}
          </button>
        ) : (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-[14px] font-semibold text-green-700">✓ Download started! Check your downloads folder.</p>
            <button
              onClick={handleDownload}
              className="mt-2 text-[13px] font-medium text-green-700 underline"
            >
              Download again
            </button>
          </div>
        )}

        {/* Sign-off sharing section */}
        {signOffUrl && (
          <div className="mt-8 bg-white rounded-2xl border border-[#E7E5E4] p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-[#0C0A09]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
              <h2 className="text-[16px] font-bold text-[#0C0A09]">
                Get your crew to sign off
              </h2>
            </div>
            <p className="text-[14px] text-[#78716C] leading-relaxed mb-4">
              Share this link with your workers. They can sign off on their phones — no printing needed.
            </p>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-[#FAFAF9] border border-[#E7E5E4] rounded-lg px-3 py-2.5 text-[13px] text-[#0C0A09] font-mono truncate">
                {signOffUrl}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(signOffUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="shrink-0 px-4 py-2.5 bg-[#0C0A09] text-white text-[13px] font-semibold rounded-lg hover:bg-[#1C1917] transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`sms:?body=Sign off on the SWMS before you get to site: ${signOffUrl}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E7E5E4] rounded-lg text-[13px] font-medium text-[#0C0A09] hover:bg-[#F5F5F4] transition-colors"
              >
                Text
              </a>
              <a
                href={`https://wa.me/?text=Sign off on the SWMS before you get to site: ${encodeURIComponent(signOffUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E7E5E4] rounded-lg text-[13px] font-medium text-[#0C0A09] hover:bg-[#F5F5F4] transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={`mailto:?subject=SWMS Sign-Off Required&body=Please sign off on the SWMS before arriving on site: ${signOffUrl}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E7E5E4] rounded-lg text-[13px] font-medium text-[#0C0A09] hover:bg-[#F5F5F4] transition-colors"
              >
                Email
              </a>
            </div>

            <p className="text-[12px] text-[#A8A29E] mt-4 text-center">
              Sign-off code: <span className="font-mono font-semibold">{signOffCode}</span> · Valid for 12 months
            </p>

            <Link
              href={`/documents/${signOffCode}`}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border border-[#E7E5E4] rounded-xl text-[14px] font-medium text-[#0C0A09] hover:bg-[#F5F5F4] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
              Manage SWMS & track signatures →
            </Link>
          </div>
        )}

        {/* Create another */}
        <div className="text-center mt-8 pt-6 border-t border-[#E7E5E4]">
          <p className="text-[14px] text-[#78716C] mb-3">
            Need another SWMS for a different job?
          </p>
          <Link
            href="/job"
            className="text-[14px] font-semibold text-[#0C0A09] hover:underline"
          >
            Create Another SWMS →
          </Link>
        </div>
      </div>
    </Shell>
  );
}

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
      <main className="px-5">
        {children}
      </main>
    </div>
  );
}
