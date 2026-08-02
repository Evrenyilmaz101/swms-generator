// Shared helpers for the redesigned builder flow — risk chip mapping,
// excluded-step filtering, doc numbering, and the PDF payload shape.

import { useBuilderStore } from "@/stores/builder-store";
import type { BusinessDetails, JobDetails } from "@/types/form";
import type { RiskRating, SwmsData } from "@/types/swms";

/**
 * Run fn once the persisted builder store has rehydrated from sessionStorage.
 * Guards that read store state on mount must go through this — on a hard
 * page load the mount effect can fire before hydration, see empty defaults,
 * and wrongly redirect. Returns an unsubscribe for effect cleanup.
 */
export function whenHydrated(fn: () => void): (() => void) | undefined {
  const persist = useBuilderStore.persist;
  if (!persist || persist.hasHydrated()) {
    fn();
    return undefined;
  }
  return persist.onFinishHydration(() => fn());
}

/** Short code shown in risk chips. */
export function riskCode(rating: RiskRating): string {
  switch (rating) {
    case "Low": return "L";
    case "Medium": return "M";
    case "High": return "H";
    case "Very High": return "VH";
    case "Extreme": return "E";
  }
}

/** [background, foreground] for a risk chip. */
export function riskColors(rating: RiskRating): [string, string] {
  switch (rating) {
    case "Low": return ["#3F9C55", "#fff"];
    case "Medium": return ["#E3B90F", "#1A1917"];
    case "High": return ["#D6491B", "#fff"];
    case "Very High":
    case "Extreme": return ["#7A1B0C", "#fff"];
  }
}

/** Steps that survive the review screen's unticking, renumbered from 1. */
export function includedSteps(swms: SwmsData, excluded: number[]) {
  return swms.steps
    .filter((s) => !excluded.includes(s.step_number))
    .map((s, i) => ({ ...s, step_number: i + 1 }));
}

/** SwmsData with excluded steps dropped — what preview + PDF should show. */
export function docSwms(swms: SwmsData, excluded: number[]): SwmsData {
  return { ...swms, steps: includedSteps(swms, excluded) };
}

/** Count of distinct hazards across included steps. */
export function hazardCount(swms: SwmsData, excluded: number[]): number {
  return includedSteps(swms, excluded).reduce((a, s) => a + s.hazards.length, 0);
}

/** Stable per-generation document number, e.g. SWMS-0208-347. */
export function makeDocNo(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `SWMS-${dd}${mm}-${seq}`;
}

/** Body for POST /api/download/preview (add `watermark: true` for previews). */
export function pdfPayload(opts: {
  business: BusinessDetails;
  job: JobDetails;
  swms: SwmsData;
  excluded: number[];
  complianceScore: number;
  docNo: string;
}) {
  const { business, job, swms, excluded, complianceScore, docNo } = opts;
  return {
    business_name: business.business_name.trim() || "—",
    abn: business.abn,
    contact_name: business.contact_name,
    phone: business.phone,
    state: business.state,
    logo_base64: business.logo_base64,
    job_description: job.job_description,
    site_address: job.site_address,
    principal_contractor: job.principal_contractor,
    swms_data: docSwms(swms, excluded),
    compliance_score: complianceScore,
    document_reference: docNo,
    revision_number: 1,
    created_at: new Date().toLocaleDateString("en-AU"),
  };
}
