"use client";

import { useState, useRef } from "react";
import type { PhotoHazard } from "@/types/swms";

interface PhotoUploadProps {
  onHazardsDetected: (hazards: PhotoHazard[]) => void;
  jobDescription?: string;
  disabled?: boolean;
}

export function PhotoUpload({
  onHazardsDetected,
  jobDescription,
  disabled,
}: PhotoUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Full = event.target?.result as string;
      const base64 = base64Full.split(",")[1];

      setIsAnalyzing(true);
      try {
        const response = await fetch("/api/analyze-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_base64: base64,
            job_description: jobDescription,
          }),
        });

        const data = await response.json();

        if (data.success && data.hazards.length > 0) {
          onHazardsDetected(data.hazards);
        } else if (data.hazards?.length === 0) {
          setError("No hazards detected. Try a different angle.");
        } else {
          setError(data.error || "Failed to analyze photo.");
        }
      } catch {
        setError("Failed to analyze photo.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled || isAnalyzing}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium border bg-[#FAFAF9] border-[#E7E5E4] text-[#0C0A09] hover:bg-[#F5F5F4] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? (
          <>
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Photo
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoCapture}
      />
      {error && (
        <span className="text-[12px] text-red-600">{error}</span>
      )}
    </>
  );
}
