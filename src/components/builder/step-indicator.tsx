"use client";

import { BUILDER_STEPS, type BuilderStep } from "@/types/form";

interface StepIndicatorProps {
  currentStep: BuilderStep;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = BUILDER_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-between w-full max-w-lg mx-auto mb-8">
      {BUILDER_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-0">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  text-sm font-bold transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-accent text-primary"
                      : isCurrent
                        ? "bg-primary text-white ring-4 ring-accent/30"
                        : "bg-border text-muted"
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`
                  text-xs mt-1 font-medium hidden sm:block
                  ${isCurrent ? "text-primary" : "text-muted"}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < BUILDER_STEPS.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-2 rounded-full transition-all duration-300
                  ${isCompleted ? "bg-accent" : "bg-border"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
