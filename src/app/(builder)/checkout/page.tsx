"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBuilderStore } from "@/stores/builder-store";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    generatedSwms,
    businessDetails,
    jobDetails,
    setCurrentStep,
    redemptionToken,
    setRedemptionToken,
  } = useBuilderStore();
  const [selectedPlan, setSelectedPlan] = useState<"single" | "three_pack">(
    "single"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [signOffUrl, setSignOffUrl] = useState<string | null>(null);
  const [signOffCode, setSignOffCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const hasToken = !!redemptionToken;

  useEffect(() => {
    if (!generatedSwms) {
      router.push("/job");
      return;
    }
    setCurrentStep("checkout");

    // Generate watermarked preview PDF
    async function loadPreview() {
      setPreviewLoading(true);
      try {
        const pdfPayload = {
          business_name: businessDetails.business_name,
          abn: businessDetails.abn,
          contact_name: businessDetails.contact_name,
          phone: businessDetails.phone,
          state: businessDetails.state,
          logo_base64: businessDetails.logo_base64,
          swms_data: generatedSwms,
          compliance_score: useBuilderStore.getState().complianceScore,
          document_reference: `SWMS-${Date.now()}`,
          revision_number: 1,
          created_at: new Date().toLocaleDateString("en-AU"),
          watermark: true,
        };

        const res = await fetch("/api/download/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pdfPayload),
        });

        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        } else {
          console.error("Preview API error:", res.status, await res.text().catch(() => ""));
        }
      } catch (err) {
        console.error("Preview fetch error:", err);
      } finally {
        setPreviewLoading(false);
      }
    }

    loadPreview();

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const handleTokenDownload = useCallback(async () => {
    if (!redemptionToken || !generatedSwms) return;

    setIsDownloading(true);
    setError(null);

    try {
      const consumeRes = await fetch("/api/redeem/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: redemptionToken,
          job_description: jobDetails.job_description,
          business_name: businessDetails.business_name,
          state: businessDetails.state,
          generated_content: generatedSwms,
        }),
      });

      const consumeData = await consumeRes.json();
      if (!consumeData.success) {
        setError(consumeData.error || "Failed to redeem credit");
        return;
      }

      const pdfPayload = {
        business_name: businessDetails.business_name,
        abn: businessDetails.abn,
        contact_name: businessDetails.contact_name,
        phone: businessDetails.phone,
        state: businessDetails.state,
        logo_base64: businessDetails.logo_base64,
        swms_data: generatedSwms,
        compliance_score: useBuilderStore.getState().complianceScore,
        document_reference: `SWMS-${Date.now()}`,
        revision_number: 1,
        created_at: new Date().toLocaleDateString("en-AU"),
      };

      const pdfRes = await fetch("/api/download/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pdfPayload),
      });

      if (!pdfRes.ok) throw new Error("Failed to generate PDF");

      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const businessName =
        businessDetails.business_name?.replace(/[^a-zA-Z0-9]/g, "_") || "SWMS";
      a.download = `SWMS-${businessName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloaded(true);
      setRedemptionToken(null);

      // Create sign-off session
      createSignOff();
    } catch {
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [redemptionToken, generatedSwms, businessDetails, jobDetails, setRedemptionToken]);

  // Create sign-off session for digital signatures
  async function createSignOff() {
    try {
      const res = await fetch("/api/sign/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessDetails.business_name,
          job_description: jobDetails.job_description,
          state: businessDetails.state,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSignOffUrl(data.sign_url);
        setSignOffCode(data.sign_code);
      }
    } catch {
      // Sign-off creation failed silently — not critical
    }
  }

  async function handleCheckout() {
    setIsLoading(true);
    setError(null);

    try {
      const swmsSessionId = `swms_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(
        `swms_data_${swmsSessionId}`,
        JSON.stringify({
          business_name: businessDetails.business_name,
          abn: businessDetails.abn,
          contact_name: businessDetails.contact_name,
          phone: businessDetails.phone,
          state: businessDetails.state,
          logo_base64: businessDetails.logo_base64,
          swms_data: generatedSwms,
          compliance_score: useBuilderStore.getState().complianceScore,
          document_reference: `SWMS-${Date.now()}`,
          revision_number: 1,
          created_at: new Date().toLocaleDateString("en-AU"),
        })
      );

      sessionStorage.setItem("pending_swms_session", swmsSessionId);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          swms_session_id: swmsSessionId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start checkout. Please try again.");
      }
    } catch {
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!generatedSwms) return null;

  // Download complete state
  if (downloaded) {
    return (
      <div className="max-w-[560px] mx-auto py-8 sm:py-20 px-1">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-[32px] font-bold text-[#0C0A09] tracking-[-0.03em] mt-6">
            Download complete
          </h1>
          <p className="text-[17px] text-[#78716C] mt-2">
            Your SWMS PDF is in your downloads folder.
          </p>
        </div>

        {/* Sign-off sharing section */}
        {signOffUrl && (
          <div className="mt-10 bg-white rounded-2xl border border-[#E7E5E4] p-6">
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

            {/* Link + copy */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 min-w-0 bg-[#FAFAF9] border border-[#E7E5E4] rounded-lg px-3 py-2.5 text-[12px] sm:text-[13px] text-[#0C0A09] font-mono truncate">
                {signOffUrl}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(signOffUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="shrink-0 px-3 sm:px-4 py-2.5 bg-[#0C0A09] text-white text-[13px] font-semibold rounded-lg hover:bg-[#1C1917] transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <a
                href={`sms:?body=Sign off on the SWMS before you get to site: ${signOffUrl}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E7E5E4] rounded-lg text-[13px] font-medium text-[#0C0A09] hover:bg-[#F5F5F4] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
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
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => (window.location.href = "/")}
            className="text-[14px] font-medium text-[#78716C] hover:text-[#0C0A09] transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  // Token redemption flow
  if (hasToken) {
    return (
      <div className="max-w-[640px] mx-auto py-8 sm:py-20 px-1">
        <p className="text-[11px] font-semibold text-[#78716C] tracking-[0.15em]">
          DOWNLOAD
        </p>
        <h1 className="text-[clamp(2rem,4.5vw,2.75rem)] font-bold text-[#0C0A09] tracking-[-0.03em] leading-[1.1] mt-2">
          Your credit&apos;s ready.
        </h1>
        <p className="text-[17px] text-[#78716C] mt-3 leading-relaxed">
          No payment needed — this SWMS is included in your 3-Pack credit.
        </p>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-[14px] font-semibold text-[#0C0A09]">Credit applied</p>
            <p className="text-[13px] text-[#78716C]">3-Pack credit used · $0.00 AUD</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-[13px] text-red-700">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => router.push("/review")}
            className="text-[14px] font-medium text-[#78716C] hover:text-[#0C0A09] transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleTokenDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0C0A09] text-white text-[15px] font-semibold rounded-[10px] hover:bg-[#1C1917] transition-colors disabled:opacity-70"
          >
            {isDownloading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating PDF
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Payment flow
  const price = selectedPlan === "single" ? "$7.99" : "$19.99";

  return (
    <div className="max-w-[1160px] mx-auto py-8 sm:py-16 px-1">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
        {/* Left - preview */}
        <div>
          <p className="text-[11px] font-semibold text-[#78716C] tracking-[0.15em]">
            YOUR SWMS IS READY
          </p>
          <h1 className="text-[clamp(2rem,4.5vw,2.75rem)] font-bold text-[#0C0A09] tracking-[-0.03em] leading-[1.1] mt-2">
            Looks good?
          </h1>
          <p className="text-[17px] text-[#78716C] mt-3 leading-relaxed">
            4 pages · WHS-compliant for {businessDetails.state} · ready to take to site.
          </p>

          {/* Document preview card */}
          <div className="mt-6 bg-white rounded-2xl border border-[#E7E5E4] shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="h-11 px-4 flex items-center justify-between border-b border-[#E7E5E4]">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#78716C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className="text-[13px] font-semibold text-[#0C0A09]">
                  SWMS-{Date.now().toString().slice(-6)}.pdf
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-[#A8A29E]">4 pages</span>
                <span className="text-[12px] text-[#A8A29E]">·</span>
                <button
                  onClick={() => router.push("/review")}
                  className="text-[12px] font-semibold text-[#0C0A09] hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
            {/* Full PDF preview with watermarks */}
            {previewLoading ? (
              <div className="bg-[#F8F8F7] flex items-center justify-center py-20">
                <div className="text-center">
                  <svg className="w-8 h-8 text-[#78716C] animate-spin mx-auto" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-[13px] text-[#78716C] mt-3">Generating preview...</p>
                </div>
              </div>
            ) : previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full border-0 h-[350px] sm:h-[500px] lg:h-[600px]"
                title="SWMS Preview"
              />
            ) : (
              <div className="bg-[#F8F8F7] flex items-center justify-center py-20">
                <p className="text-[13px] text-[#A8A29E]">Preview unavailable</p>
              </div>
            )}
          </div>
        </div>

        {/* Right - pricing */}
        <div className="lg:pt-[60px]">
          <div className="space-y-3">
            {/* Single option */}
            <button
              type="button"
              onClick={() => setSelectedPlan("single")}
              className={`w-full text-left bg-white rounded-2xl border-2 p-5 transition-colors ${
                selectedPlan === "single" ? "border-[#0C0A09]" : "border-[#E7E5E4] hover:border-[#D6D3D1]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-[18px] h-[18px] rounded-full border-[5px] bg-white transition-colors ${
                    selectedPlan === "single" ? "border-[#0C0A09]" : "border-[#D6D3D1]"
                  }`} />
                  <div>
                    <p className="text-[14px] font-semibold text-[#0C0A09]">Single SWMS</p>
                    <p className="text-[12px] text-[#78716C]">This document only</p>
                  </div>
                </div>
                <span className="text-[22px] font-bold text-[#0C0A09] tracking-[-0.02em]">$7.99</span>
              </div>
            </button>

            {/* 3-Pack option */}
            <button
              type="button"
              onClick={() => setSelectedPlan("three_pack")}
              className={`w-full text-left bg-white rounded-2xl border-2 p-5 transition-colors ${
                selectedPlan === "three_pack" ? "border-[#0C0A09]" : "border-[#E7E5E4] hover:border-[#D6D3D1]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-[18px] h-[18px] rounded-full border-[5px] bg-white transition-colors ${
                    selectedPlan === "three_pack" ? "border-[#0C0A09]" : "border-[#D6D3D1]"
                  }`} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[14px] font-semibold text-[#0C0A09]">3-Pack</p>
                      <span className="px-1.5 py-0.5 rounded bg-[#FFD600] text-[9px] font-bold text-[#0C0A09] tracking-wide">SAVE $4</span>
                    </div>
                    <p className="text-[12px] text-[#78716C]">3 SWMS · tokens don&apos;t expire</p>
                  </div>
                </div>
                <span className="text-[22px] font-bold text-[#0C0A09] tracking-[-0.02em]">$19.99</span>
              </div>
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-[13px] text-red-700">{error}</p>
            </div>
          )}

          {/* Payment button */}
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-8 py-[18px] bg-[#0C0A09] text-white text-[15px] font-semibold rounded-xl hover:bg-[#1C1917] transition-colors disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirecting to payment
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Pay {price} &amp; download PDF
              </>
            )}
          </button>

          {/* Trust signals */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span className="text-[12px] font-medium text-[#78716C]">Secure checkout</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-medium text-[#78716C]">Stripe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#78716C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span className="text-[12px] font-medium text-[#78716C]">Instant PDF</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/review")}
            className="mt-6 w-full text-center text-[14px] font-medium text-[#78716C] hover:text-[#0C0A09] transition-colors"
          >
            ← Back to review
          </button>
        </div>
      </div>
    </div>
  );
}
