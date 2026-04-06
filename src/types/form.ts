// Form step types for the builder flow
// ORDER: Job first (value-first) → Review → Details → Checkout

import type { AustralianState, PhotoHazard } from "./swms";

export interface BusinessDetails {
  business_name: string;
  abn: string;
  contact_name: string;
  phone: string;
  state: AustralianState | "";
  logo_base64: string;
}

export interface JobDetails {
  job_description: string;
  site_address: string;
  principal_contractor: string;
  job_reference: string;
  photo_hazards: PhotoHazard[];
}

export type BuilderStep = "job" | "review" | "details" | "checkout";

export const BUILDER_STEPS: { key: BuilderStep; label: string; path: string }[] = [
  { key: "job", label: "Describe Job", path: "/job" },
  { key: "review", label: "Review SWMS", path: "/review" },
  { key: "details", label: "Your Details", path: "/details" },
  { key: "checkout", label: "Download", path: "/checkout" },
];
