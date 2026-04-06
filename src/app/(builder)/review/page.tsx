"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useBuilderStore } from "@/stores/builder-store";
import { RISK_RATING_COLORS } from "@/lib/constants/risk-matrix";
import type { RiskRating, SwmsData } from "@/types/swms";

const GENERATION_STEPS = [
  "Scope of work identified",
  "HRCW categories matched",
  "Generating job steps & controls",
  "Mapping state legislation",
  "Risk scoring & residual risk check",
  "Compliance check",
];

export default function ReviewPage() {
  const router = useRouter();
  const {
    businessDetails,
    jobDetails,
    photoHazards,
    generatedSwms,
    setGeneratedSwms,
    complianceScore,
    setComplianceScore,
    validationWarnings,
    setValidationWarnings,
    isGenerating,
    setIsGenerating,
    generationError,
    setGenerationError,
    setCurrentStep,
  } = useBuilderStore();

  const [progressStep, setProgressStep] = useState(0);

  const generateSwms = useCallback(async () => {
    if (!businessDetails.state || !jobDetails.job_description) {
      router.push("/job");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setProgressStep(0);

    const additionalHazards = photoHazards
      .filter((h) => h.selected)
      .map((h) => h.hazard);

    // Animate progress steps
    const progressInterval = setInterval(() => {
      setProgressStep((prev) => Math.min(prev + 1, GENERATION_STEPS.length - 1));
    }, 3000);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_description: jobDetails.job_description,
          state: businessDetails.state,
          site_address: jobDetails.site_address || undefined,
          principal_contractor: jobDetails.principal_contractor || undefined,
          additional_hazards:
            additionalHazards.length > 0 ? additionalHazards : undefined,
        }),
      });

      const data = await response.json();
      clearInterval(progressInterval);
      setProgressStep(GENERATION_STEPS.length);

      if (data.success) {
        setGeneratedSwms(data.data);
        setComplianceScore(data.compliance_score);
        setValidationWarnings(data.validation_warnings || []);
      } else {
        setGenerationError(
          data.error || "Failed to generate SWMS. Please try again."
        );
      }
    } catch {
      clearInterval(progressInterval);
      setGenerationError(
        "Connection error. Please check your internet and try again."
      );
    } finally {
      setIsGenerating(false);
    }
  }, [businessDetails, jobDetails, photoHazards]);

  useEffect(() => {
    setCurrentStep("review");
    if (!generatedSwms && !isGenerating) {
      generateSwms();
    }
  }, []);

  // Loading state - premium design
  if (isGenerating) {
    return (
      <div className="max-w-[1232px] mx-auto py-8 sm:py-16 px-1">
        <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-8 lg:gap-16 items-start">
          {/* Left - progress */}
          <div>
            <p className="text-[11px] font-semibold text-[#78716C] tracking-[0.15em]">
              BUILDING YOUR SWMS
            </p>
            <h1 className="text-[clamp(1.75rem,4.5vw,2.75rem)] font-bold text-[#0C0A09] tracking-[-0.03em] leading-[1.1] mt-2">
              Give us a sec.
            </h1>
            <p className="text-[15px] sm:text-[17px] text-[#78716C] mt-3 leading-relaxed">
              Reading your job, checking {businessDetails.state} regulations, mapping hazards to controls.
            </p>

            <div className="mt-6 sm:mt-10">
              {GENERATION_STEPS.map((step, i) => {
                const isComplete = i < progressStep;
                const isActive = i === progressStep;
                const isPending = i > progressStep;
                return (
                  <div key={i} className="flex items-center gap-3 py-2.5 sm:py-3">
                    {isComplete && (
                      <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full bg-green-500 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {isActive && (
                      <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full bg-[#0C0A09] flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                    )}
                    {isPending && (
                      <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full bg-[#FAFAF9] border border-[#E7E5E4] shrink-0" />
                    )}
                    <span
                      className={`text-[14px] sm:text-[15px] ${
                        isComplete ? "font-medium text-[#0C0A09]" :
                        isActive ? "font-semibold text-[#0C0A09]" :
                        "font-medium text-[#A8A29E]"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right - live preview card — hidden on mobile, show compact version */}
          <div className="hidden lg:block bg-white rounded-2xl border border-[#E7E5E4] shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden min-h-[600px]">
            <div className="h-11 px-4 flex items-center justify-between border-b border-[#E7E5E4]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-[12px] font-medium text-[#78716C]">Live Preview</span>
              <span className="text-[12px] font-medium text-[#A8A29E]">Page 1 of 4</span>
            </div>
            <div className="p-8 bg-[#F8F8F7]">
              <div className="bg-white rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="h-12 bg-[#0E2A4D] px-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white tracking-[0.03em]">
                    {businessDetails.business_name?.toUpperCase() || "YOUR BUSINESS"}
                  </span>
                  <span className="text-[10px] font-bold text-[#FFD600]">DRAFT</span>
                </div>
                <div className="bg-[#EEF2F6] py-3.5 border-b border-[#E7E5E4] text-center">
                  <span className="text-[14px] font-extrabold text-[#0E2A4D] tracking-[0.12em]">
                    SAFE WORK METHOD STATEMENT
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-sm border border-[#E7E5E4] overflow-hidden">
                      <div className="bg-[#0E2A4D] px-2 py-1">
                        <span className="text-[7px] font-bold text-white tracking-wide">PCBU DETAILS</span>
                      </div>
                      <div className="p-2 space-y-1">
                        <div className="text-[7px] font-medium text-[#0C0A09]">{businessDetails.business_name}</div>
                        <div className="text-[7px] text-[#78716C]">ABN {businessDetails.abn || "—"}</div>
                        <div className="text-[7px] text-[#78716C]">{businessDetails.contact_name} · {businessDetails.phone}</div>
                      </div>
                    </div>
                    <div className="rounded-sm border border-[#E7E5E4] overflow-hidden">
                      <div className="bg-[#0E2A4D] px-2 py-1">
                        <span className="text-[7px] font-bold text-white tracking-wide">PROJECT DETAILS</span>
                      </div>
                      <div className="p-2 space-y-1">
                        <div className="text-[7px] font-medium text-[#0C0A09]">{jobDetails.job_description.slice(0, 30)}...</div>
                        <div className="text-[7px] text-[#78716C]">{jobDetails.site_address || "Site TBD"}</div>
                        <div className="text-[7px] text-[#78716C]">State: {businessDetails.state}</div>
                      </div>
                    </div>
                  </div>

                  {/* Skeleton loader */}
                  <div className="rounded-sm border border-dashed border-[#E7E5E4] opacity-40">
                    <div className="bg-[#E7E5E4] px-2 py-1">
                      <span className="text-[7px] font-bold text-[#78716C] tracking-wide">JOB STEPS — HAZARDS, RISKS & CONTROLS</span>
                    </div>
                    <div className="p-2 space-y-1">
                      <div className="h-2 bg-[#E7E5E4] rounded" />
                      <div className="h-2 bg-[#E7E5E4] rounded" />
                      <div className="h-2 bg-[#E7E5E4] rounded w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (generationError) {
    return (
      <div className="max-w-[640px] mx-auto py-20">
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
          <svg className="w-10 h-10 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <h2 className="text-[20px] font-bold text-[#0C0A09]">Generation failed</h2>
          <p className="text-[15px] text-[#78716C] mt-2">{generationError}</p>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => router.push("/job")}
            className="flex-1 h-11 rounded-[10px] border border-[#E7E5E4] bg-white text-[14px] font-semibold text-[#0C0A09] hover:bg-[#FAFAF9] transition-colors"
          >
            Edit job description
          </button>
          <button
            onClick={generateSwms}
            className="flex-1 h-11 rounded-[10px] bg-[#0C0A09] text-white text-[14px] font-semibold hover:bg-[#1C1917] transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!generatedSwms) return null;

  return (
    <div className="max-w-[880px] mx-auto py-8 sm:py-16 pb-28 px-1">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[#78716C] tracking-[0.15em]">
            REVIEW YOUR SWMS
          </p>
          <h1 className="text-[clamp(1.75rem,4.5vw,2.75rem)] font-bold text-[#0C0A09] tracking-[-0.03em] leading-[1.1] mt-2">
            Looks good?
          </h1>
          <p className="text-[14px] sm:text-[17px] text-[#78716C] mt-2 sm:mt-3 leading-relaxed">
            {generatedSwms.steps.length} steps · {businessDetails.state} compliant · Ready to download.
          </p>
        </div>

        <div className="flex flex-col items-center shrink-0">
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-[16px] sm:text-[20px] font-bold text-white ${
              complianceScore >= 90 ? "bg-green-500" : complianceScore >= 70 ? "bg-amber-500" : "bg-red-500"
            }`}
          >
            {complianceScore}
          </div>
          <span className="text-[10px] sm:text-[11px] font-medium text-[#78716C] mt-1.5 tracking-wide">SCORE</span>
        </div>
      </div>

      {validationWarnings.length > 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-[13px] font-semibold text-[#0C0A09] mb-1.5">
            Quality notes ({validationWarnings.length})
          </p>
          <ul className="space-y-1">
            {validationWarnings.map((w, i) => (
              <li key={i} className="text-[13px] text-[#78716C]">· {w}</li>
            ))}
          </ul>
        </div>
      )}

      <SwmsPreview data={generatedSwms} />

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-[#E7E5E4] px-4 sm:px-5 py-3 z-10">
        <div className="max-w-[880px] mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => {
              setGeneratedSwms(null);
              router.push("/job");
            }}
            className="text-[13px] sm:text-[14px] font-medium text-[#78716C] hover:text-[#0C0A09] transition-colors shrink-0"
          >
            ← Edit
          </button>
          <button
            onClick={() => router.push("/details")}
            className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 bg-[#0C0A09] text-white text-[14px] sm:text-[15px] font-semibold rounded-[10px] hover:bg-[#1C1917] transition-colors"
          >
            <span className="hidden sm:inline">Looks good — </span>Continue
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function SwmsPreview({ data }: { data: SwmsData }) {
  return (
    <div className="mt-10 space-y-5">
      <PreviewSection title="Scope of work">
        <p className="text-[14px] text-[#0C0A09] leading-relaxed">{data.scope_of_work}</p>
      </PreviewSection>

      <PreviewSection title="High-risk construction work">
        <div className="space-y-1.5">
          {data.hrcw_activities.map((activity, i) => (
            <div key={i} className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[14px] text-[#0C0A09]">{activity}</span>
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Work procedure">
        <div className="space-y-3">
          {data.steps.map((step) => (
            <div key={step.step_number} className="rounded-xl border border-[#E7E5E4] p-3 sm:p-4">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0C0A09] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  {step.step_number}
                </span>
                <span className="font-semibold text-[13px] sm:text-[14px] text-[#0C0A09]">{step.activity}</span>
              </div>
              <div className="ml-0 sm:ml-9 mt-2.5 space-y-1.5 pl-2 border-l-2 border-[#E7E5E4] sm:border-0 sm:pl-0">
                <div className="text-[12px] sm:text-[13px] text-[#78716C]">
                  <span className="font-semibold text-[#0C0A09]">Hazards: </span>
                  {step.hazards.join("; ")}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[13px]">
                  <span className="font-semibold text-[#0C0A09]">Risk: </span>
                  <RiskBadge rating={step.initial_risk.rating as RiskRating} />
                  <span className="text-[#A8A29E]">→</span>
                  <RiskBadge rating={step.residual_risk.rating as RiskRating} />
                </div>
                <div className="text-[12px] sm:text-[13px] text-[#78716C]">
                  <span className="font-semibold text-[#0C0A09]">Controls: </span>
                  {step.controls.join("; ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="PPE requirements">
        <ul className="space-y-1.5">
          {data.ppe_requirements.map((item, i) => (
            <li key={i} className="text-[14px] text-[#0C0A09] flex items-start gap-2">
              <span className="text-[#A8A29E] mt-0.5">·</span>
              {item}
            </li>
          ))}
        </ul>
      </PreviewSection>

      <PreviewSection title="Emergency procedures">
        <ol className="space-y-1.5">
          {data.emergency_procedures.map((proc, i) => (
            <li key={i} className="text-[14px] text-[#0C0A09] flex gap-2">
              <span className="font-semibold text-[#A8A29E]">{i + 1}.</span>
              {proc}
            </li>
          ))}
        </ol>
      </PreviewSection>

      <PreviewSection title="Toolbox talk — pre-start briefing">
        <p className="text-[14px] italic text-[#0C0A09] bg-[#FAFAF9] border border-[#E7E5E4] p-4 rounded-lg leading-relaxed">
          &ldquo;{data.toolbox_talk}&rdquo;
        </p>
      </PreviewSection>

      <PreviewSection title="Legislative references">
        <ul className="space-y-1">
          {data.legislation_references.map((ref, i) => (
            <li key={i} className="text-[13px] text-[#78716C]">· {ref}</li>
          ))}
        </ul>
      </PreviewSection>
    </div>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#E7E5E4]">
        <h3 className="text-[13px] font-semibold text-[#0C0A09] tracking-wide uppercase">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function RiskBadge({ rating }: { rating: RiskRating }) {
  const color = RISK_RATING_COLORS[rating] || "#64748b";
  return (
    <span
      className="px-2 py-0.5 rounded text-[11px] font-bold"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      {rating}
    </span>
  );
}
