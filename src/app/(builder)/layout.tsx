"use client";

import Link from "next/link";
import { StepIndicator } from "@/components/builder/step-indicator";
import { useBuilderStore } from "@/stores/builder-store";

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentStep = useBuilderStore((s) => s.currentStep);

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Top bar */}
      <header className="bg-[#FAFAF9] border-b border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="w-6 h-6 rounded-md bg-[#0C0A09] flex items-center justify-center">
              <span className="text-[13px] font-extrabold text-[#FFD600]">S</span>
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-[#0C0A09] tracking-[-0.01em]">Instant SWMS</span>
          </Link>
          <StepIndicator currentStep={currentStep} />
          <Link href="/" className="text-[12px] sm:text-[13px] font-medium text-[#78716C] hover:text-[#0C0A09] transition-colors shrink-0">
            Exit
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="px-5">
        {children}
      </main>
    </div>
  );
}
