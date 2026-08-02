// Form step types for the builder flow
// ORDER: Describe (job) → Review → Preview → Pay/Download (checkout)

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

export type BuilderStep = "job" | "review" | "preview" | "checkout";

export const BUILDER_STEPS: { key: BuilderStep; label: string; path: string }[] = [
  { key: "job", label: "01 DESCRIBE", path: "/job" },
  { key: "review", label: "02 REVIEW", path: "/review" },
  { key: "preview", label: "03 PREVIEW", path: "/preview" },
  { key: "checkout", label: "04 DOWNLOAD", path: "/checkout" },
];
