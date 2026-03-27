"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBuilderStore } from "@/stores/builder-store";
import { jobDetailsSchema } from "@/lib/validators/form-schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { VoiceInput } from "@/components/builder/voice-input";
import { PhotoUpload } from "@/components/builder/photo-upload";
import type { PhotoHazard } from "@/types/swms";

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

  useEffect(() => {
    // Redirect back if no business details
    if (!businessDetails.business_name || !businessDetails.state) {
      router.push("/details");
      return;
    }
    setCurrentStep("job");
  }, []);

  function handleChange(field: string, value: string) {
    setJobDetails({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleVoiceTranscript(text: string) {
    // Append to existing description
    const current = jobDetails.job_description;
    const updated = current ? `${current} ${text}` : text;
    setJobDetails({ job_description: updated });
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

    router.push("/review");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          Describe Your Job
        </h1>
        <p className="text-muted mt-1">
          Tell us what work you&apos;re doing. The more detail, the better your
          SWMS.
        </p>
      </div>

      {/* Voice input -- the hero feature */}
      <VoiceInput onTranscript={handleVoiceTranscript} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-3 text-xs text-muted">
            or type it out
          </span>
        </div>
      </div>

      <Textarea
        label="Job Description"
        required
        placeholder="e.g. Installing timber roof trusses on a two-story residential build. Using a 20-tonne crane for the lift. Working at approximately 6 metres height."
        value={jobDetails.job_description}
        onChange={(e) => handleChange("job_description", e.target.value)}
        error={errors.job_description}
        hint={`${jobDetails.job_description.length}/2000 characters`}
        rows={5}
      />

      {/* Photo hazard scan */}
      <PhotoUpload
        onHazardsDetected={handleHazardsDetected}
        jobDescription={jobDetails.job_description}
      />

      {/* Show detected hazards */}
      {photoHazards.length > 0 && (
        <div className="bg-accent/5 border border-accent/30 rounded-xl p-4 space-y-3">
          <p className="text-sm font-bold text-primary">
            Hazards detected from site photo:
          </p>
          {photoHazards.map((hazard, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hazard.selected}
                onChange={() => togglePhotoHazard(i)}
                className="w-5 h-5 mt-0.5 rounded border-border text-accent focus:ring-accent"
              />
              <div>
                <span className="text-sm font-medium text-primary">
                  {hazard.hazard}
                </span>
                <p className="text-xs text-muted">
                  Controls: {hazard.suggested_controls.join("; ")}
                </p>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Optional fields */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-semibold text-accent hover:text-accent-dark list-none flex items-center gap-2">
          <svg
            className="w-4 h-4 transition-transform group-open:rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          Add site details (optional)
        </summary>
        <div className="mt-3 space-y-4">
          <Input
            label="Site Address"
            placeholder="e.g. 45 George St, Parramatta NSW 2150"
            value={jobDetails.site_address}
            onChange={(e) => handleChange("site_address", e.target.value)}
          />
          <Input
            label="Principal Contractor"
            placeholder="e.g. HomeBuilt Construction Pty Ltd"
            value={jobDetails.principal_contractor}
            onChange={(e) =>
              handleChange("principal_contractor", e.target.value)
            }
          />
          <Input
            label="Job / Project Reference"
            placeholder="e.g. JOB-2026-045"
            value={jobDetails.job_reference}
            onChange={(e) => handleChange("job_reference", e.target.value)}
          />
        </div>
      </details>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/details")}
          className="flex-1"
        >
          Back
        </Button>
        <Button type="submit" size="lg" className="flex-1">
          Generate SWMS
        </Button>
      </div>
    </form>
  );
}
