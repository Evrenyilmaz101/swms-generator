// Form step types for the builder flow

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

export type BuilderStep = "details" | "job" | "review" | "checkout";

export const BUILDER_STEPS: { key: BuilderStep; label: string; path: string }[] = [
  { key: "details", label: "Your Details", path: "/details" },
  { key: "job", label: "Job Description", path: "/job" },
  { key: "review", label: "Review SWMS", path: "/review" },
  { key: "checkout", label: "Download", path: "/checkout" },
];
