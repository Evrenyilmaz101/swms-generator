"use client";

import { StepIndicator } from "@/components/builder/step-indicator";
import { useBuilderStore } from "@/stores/builder-store";

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentStep = useBuilderStore((s) => s.currentStep);

  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <header className="bg-primary text-white py-3 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/" className="text-lg font-bold">
            <span className="text-accent">SWMS</span> Generator
          </a>
          <span className="text-xs text-white/60">Australian WHS Compliant</span>
        </div>
      </header>

      {/* Step indicator */}
      <div className="bg-white border-b border-border py-4 px-4">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Page content */}
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
