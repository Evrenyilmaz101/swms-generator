"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBuilderStore } from "@/stores/builder-store";
import { jobDetailsSchema } from "@/lib/validators/form-schemas";
import { VoiceInput } from "@/components/builder/voice-input";
import { PhotoUpload } from "@/components/builder/photo-upload";
import { AUSTRALIAN_STATES } from "@/lib/constants/states";
import type { AustralianState, PhotoHazard } from "@/types/swms";

export default function JobPage() {
  const router = useRouter();
  const {
    businessDetails,
    jobDetails,
    setJobDetails,
    setCurrentStep,
    photoHazards,
    setPhotoHazards,
    togglePhotoHazard,
  } = useBuilderStore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOptional, setShowOptional] = useState(false);

  useEffect(() => {
    setCurrentStep("job");
  }, []);

  const setGeneratedSwms = useBuilderStore((s) => s.setGeneratedSwms);

  function handleChange(field: string, value: string) {
    setJobDetails({ [field]: value });
    // Clear old generated SWMS when job description changes — forces regeneration
    if (field === "job_description") {
      setGeneratedSwms(null);
    }
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleVoiceTranscript(text: string) {
    const current = jobDetails.job_description;
    const updated = current ? `${current} ${text}` : text;
    setJobDetails({ job_description: updated });
    setGeneratedSwms(null); // Force regeneration with new content
  }

  function handleHazardsDetected(hazards: PhotoHazard[]) {
    setPhotoHazards(hazards);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = jobDetailsSchema.safeParse(jobDetails);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    // Validate state is selected
    if (!businessDetails.state) {
      setErrors((prev) => ({ ...prev, state: "Please select your state" }));
      return;
    }

    router.push("/review");
  }

  const charCount = jobDetails.job_description.length;

  return (
    <form onSubmit={handleSubmit} className="max-w-[720px] mx-auto py-6 sm:py-20 px-1">
      {/* Eyebrow */}
      <p className="text-[11px] font-semibold text-[#78716C] tracking-[0.15em]">
        DESCRIBE THE JOB
      </p>

      {/* Headline */}
      <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold text-[#0C0A09] tracking-[-0.03em] leading-[1.1] mt-2">
        What&apos;s the job?
      </h1>
      <p className="text-[17px] text-[#78716C] mt-3 leading-relaxed max-w-xl">
        Talk, type, or snap a photo. Use whatever slang you want &mdash; we speak tradie.
      </p>

      {/* Input card */}
      <div className="mt-10 bg-white rounded-2xl border border-[#E7E5E4] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <textarea
          value={jobDetails.job_description}
          onChange={(e) => handleChange("job_description", e.target.value)}
          placeholder="e.g. Rewiring a 3-bedroom house in Parramatta. Pulling out old wiring, new consumer unit, circuits to lights and power points. About 3 days work, me and one off-sider."
          maxLength={2000}
          className="w-full px-6 py-5 text-[15px] text-[#0C0A09] placeholder:text-[#A8A29E] bg-transparent border-0 outline-none resize-none leading-[1.6] min-h-[140px]"
          rows={5}
        />
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E7E5E4]">
          <div className="flex items-center gap-2">
            <div className="inline-flex">
              <VoiceInput onTranscript={handleVoiceTranscript} />
            </div>
            <div className="inline-flex">
              <PhotoUpload
                onHazardsDetected={handleHazardsDetected}
                jobDescription={jobDetails.job_description}
              />
            </div>
          </div>
          <span className="text-[12px] font-medium text-[#A8A29E]">
            {charCount} / 2000
          </span>
        </div>
      </div>

      {errors.job_description && (
        <p className="text-[13px] text-red-600 mt-2">{errors.job_description}</p>
      )}

      {/* Photo hazards */}
      {photoHazards.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-[#E7E5E4] p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-[#FF8A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-[13px] font-semibold text-[#0C0A09] tracking-wide">
              Hazards detected from your photo
            </p>
          </div>
          <div className="space-y-2">
            {photoHazards.map((hazard, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={hazard.selected}
                  onChange={() => togglePhotoHazard(i)}
                  className="w-4 h-4 mt-0.5 rounded border-[#D6D3D1] text-[#0C0A09] focus:ring-[#0C0A09] focus:ring-offset-0"
                />
                <div className="flex-1">
                  <span className="text-[14px] font-medium text-[#0C0A09]">
                    {hazard.hazard}
                  </span>
                  <p className="text-[12px] text-[#78716C] mt-0.5">
                    {hazard.suggested_controls.join(" · ")}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Optional site details */}
      <div className="mt-8">
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          className="text-[14px] font-medium text-[#0C0A09] hover:text-[#78716C] transition-colors flex items-center gap-1.5"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showOptional ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Add site details (optional)
        </button>
        {showOptional && (
          <div className="mt-4 grid gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#0C0A09] mb-1.5">
                Site address
              </label>
              <input
                type="text"
                placeholder="e.g. 45 George St, Parramatta NSW 2150"
                value={jobDetails.site_address}
                onChange={(e) => handleChange("site_address", e.target.value)}
                className="w-full h-11 px-3.5 text-[14px] text-[#0C0A09] placeholder:text-[#A8A29E] bg-[#FAFAF9] border border-[#E7E5E4] rounded-[10px] outline-none focus:border-[#0C0A09] focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#0C0A09] mb-1.5">
                Principal contractor
              </label>
              <input
                type="text"
                placeholder="e.g. HomeBuilt Construction Pty Ltd"
                value={jobDetails.principal_contractor}
                onChange={(e) => handleChange("principal_contractor", e.target.value)}
                className="w-full h-11 px-3.5 text-[14px] text-[#0C0A09] placeholder:text-[#A8A29E] bg-[#FAFAF9] border border-[#E7E5E4] rounded-[10px] outline-none focus:border-[#0C0A09] focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#0C0A09] mb-1.5">
                Job reference
              </label>
              <input
                type="text"
                placeholder="e.g. JOB-2026-045"
                value={jobDetails.job_reference}
                onChange={(e) => handleChange("job_reference", e.target.value)}
                className="w-full h-11 px-3.5 text-[14px] text-[#0C0A09] placeholder:text-[#A8A29E] bg-[#FAFAF9] border border-[#E7E5E4] rounded-[10px] outline-none focus:border-[#0C0A09] focus:bg-white transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* State selector */}
      <div className="mt-8">
        <label className="block text-[14px] font-semibold text-[#0C0A09] mb-2">
          Which state? *
        </label>
        <div className="flex flex-wrap gap-2">
          {AUSTRALIAN_STATES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                useBuilderStore.getState().setBusinessDetails({ state: s.value as AustralianState });
              }}
              className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                businessDetails.state === s.value
                  ? "bg-[#0C0A09] text-white"
                  : "bg-white border border-[#E7E5E4] text-[#78716C] hover:border-[#D6D3D1]"
              }`}
            >
              {s.value}
            </button>
          ))}
        </div>
        {!businessDetails.state && errors.state && (
          <p className="text-[13px] text-red-600 mt-1">{errors.state}</p>
        )}
      </div>

      {/* CTA row */}
      <div className="flex items-center justify-between mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-[#E7E5E4]">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-[13px] sm:text-[14px] font-medium text-[#78716C] hover:text-[#0C0A09] transition-colors shrink-0"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 bg-[#0C0A09] text-white text-[14px] sm:text-[15px] font-semibold rounded-[10px] hover:bg-[#1C1917] transition-colors"
        >
          Generate SWMS
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </form>
  );
}
