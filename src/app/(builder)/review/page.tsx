"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBuilderStore } from "@/stores/builder-store";
import { Button } from "@/components/ui/button";
import { RISK_RATING_COLORS } from "@/lib/constants/risk-matrix";
import { HRCW_CATEGORIES } from "@/lib/constants/hrcw-categories";
import type { RiskRating, SwmsData } from "@/types/swms";

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

  const generateSwms = useCallback(async () => {
    if (!businessDetails.state || !jobDetails.job_description) {
      router.push("/details");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    // Collect selected photo hazards
    const additionalHazards = photoHazards
      .filter((h) => h.selected)
      .map((h) => h.hazard);

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
      setGenerationError(
        "Connection error. Please check your internet and try again."
      );
    } finally {
      setIsGenerating(false);
    }
  }, [businessDetails, jobDetails, photoHazards]);

  useEffect(() => {
    setCurrentStep("review");
    // Only generate if we don't already have results
    if (!generatedSwms && !isGenerating) {
      generateSwms();
    }
  }, []);

  // Loading state
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-accent/30 animate-spin border-t-accent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-primary">
            Generating Your SWMS
          </h2>
          <p className="text-muted mt-2">
            AI is building your safe work method statement...
          </p>
          <p className="text-sm text-muted mt-1">
            This usually takes 15-30 seconds
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (generationError) {
    return (
      <div className="space-y-6">
        <div className="bg-error/5 border border-error/30 rounded-xl p-6 text-center">
          <svg
            className="w-12 h-12 text-error mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <h2 className="text-lg font-bold text-error">Generation Failed</h2>
          <p className="text-muted mt-2">{generationError}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/job")}
            className="flex-1"
          >
            Edit Job Description
          </Button>
          <Button size="lg" onClick={generateSwms} className="flex-1">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!generatedSwms) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Review Your SWMS</h1>
          <p className="text-muted mt-1">
            Check the content below. You can edit before downloading.
          </p>
        </div>

        {/* Compliance score badge */}
        <div className="flex flex-col items-center">
          <div
            className={`
              w-16 h-16 rounded-full flex items-center justify-center
              text-lg font-bold text-white
              ${complianceScore >= 90 ? "bg-success" : complianceScore >= 70 ? "bg-accent" : "bg-error"}
            `}
          >
            {complianceScore}
          </div>
          <span className="text-xs text-muted mt-1">Score</span>
        </div>
      </div>

      {/* Validation warnings */}
      {validationWarnings.length > 0 && (
        <div className="bg-accent/5 border border-accent/30 rounded-xl p-4">
          <p className="text-sm font-bold text-primary mb-2">
            Quality notes ({validationWarnings.length}):
          </p>
          {validationWarnings.map((w, i) => (
            <p key={i} className="text-xs text-muted">
              {w}
            </p>
          ))}
        </div>
      )}

      {/* SWMS Preview */}
      <SwmsPreview data={generatedSwms} />

      {/* Actions */}
      <div className="flex gap-3 sticky bottom-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            setGeneratedSwms(null);
            router.push("/job");
          }}
          className="flex-1"
        >
          Edit & Regenerate
        </Button>
        <Button
          size="lg"
          onClick={() => router.push("/checkout")}
          className="flex-1"
        >
          Looks Good — Download
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// SWMS Preview Component
// ============================================================================

function SwmsPreview({ data }: { data: SwmsData }) {
  return (
    <div className="space-y-4">
      {/* Scope */}
      <PreviewSection title="Scope of Work">
        <p className="text-sm text-foreground">{data.scope_of_work}</p>
      </PreviewSection>

      {/* HRCW */}
      <PreviewSection title="High-Risk Construction Work Activities">
        <div className="space-y-1">
          {data.hrcw_activities.map((activity, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-accent font-bold mt-0.5">&#10003;</span>
              <span className="text-sm">{activity}</span>
            </div>
          ))}
        </div>
      </PreviewSection>

      {/* Procedure steps */}
      <PreviewSection title="Work Procedure">
        <div className="space-y-3">
          {data.steps.map((step) => (
            <div
              key={step.step_number}
              className="bg-white rounded-lg border border-border p-3 space-y-2"
            >
              <div className="flex items-start gap-2">
                <span className="bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {step.step_number}
                </span>
                <span className="font-semibold text-sm">{step.activity}</span>
              </div>

              <div className="ml-8 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-muted">Hazards: </span>
                  {step.hazards.join("; ")}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted">Risk: </span>
                  <RiskBadge rating={step.initial_risk.rating as RiskRating} />
                  <span className="text-muted">→</span>
                  <RiskBadge rating={step.residual_risk.rating as RiskRating} />
                </div>

                <div>
                  <span className="font-semibold text-muted">Controls: </span>
                  {step.controls.join("; ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PreviewSection>

      {/* PPE */}
      <PreviewSection title="PPE Requirements">
        <ul className="space-y-1">
          {data.ppe_requirements.map((item, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <span className="text-accent">&#9679;</span>
              {item}
            </li>
          ))}
        </ul>
      </PreviewSection>

      {/* Emergency Procedures */}
      <PreviewSection title="Emergency Procedures">
        <ol className="space-y-1 list-decimal list-inside">
          {data.emergency_procedures.map((proc, i) => (
            <li key={i} className="text-sm">
              {proc}
            </li>
          ))}
        </ol>
      </PreviewSection>

      {/* Toolbox Talk */}
      <PreviewSection title="Toolbox Talk — Pre-Start Briefing">
        <p className="text-sm italic text-foreground bg-accent/5 p-3 rounded-lg">
          &ldquo;{data.toolbox_talk}&rdquo;
        </p>
      </PreviewSection>

      {/* Legislation */}
      <PreviewSection title="Legislative References">
        <ul className="space-y-1">
          {data.legislation_references.map((ref, i) => (
            <li key={i} className="text-xs text-muted">
              {ref}
            </li>
          ))}
        </ul>
      </PreviewSection>
    </div>
  );
}

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="bg-primary px-4 py-2">
        <h3 className="text-white font-bold text-sm">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function RiskBadge({ rating }: { rating: RiskRating }) {
  const color = RISK_RATING_COLORS[rating] || "#64748b";
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-bold"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {rating}
    </span>
  );
}
