"use client";

import { BUILDER_STEPS, type BuilderStep } from "@/types/form";

interface StepIndicatorProps {
  currentStep: BuilderStep;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = BUILDER_STEPS.findIndex((s) => s.key === currentStep);
  const total = BUILDER_STEPS.length;
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="text-[12px] sm:text-[13px] font-medium text-[#78716C]">
        {currentIndex + 1}/{total}
      </span>
      <div className="relative w-[60px] sm:w-[120px] h-1 rounded-full bg-[#E7E5E4] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-[#0C0A09] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
