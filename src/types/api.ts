// API request/response types

import type { AustralianState, PhotoHazard, SwmsData } from "./swms";

// POST /api/generate
export interface GenerateRequest {
  job_description: string;
  state: AustralianState;
  site_address?: string;
  principal_contractor?: string;
  photo_hazards?: PhotoHazard[];
}

export interface GenerateResponse {
  success: true;
  data: SwmsData;
  compliance_score: number;
  validation_warnings: string[];
}

export interface GenerateErrorResponse {
  success: false;
  error: string;
}

// POST /api/checkout
export interface CheckoutRequest {
  product_type: "single" | "three_pack";
  email: string;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

// POST /api/analyze-photo
export interface AnalyzePhotoRequest {
  image_base64: string;
  job_description?: string;
}

export interface AnalyzePhotoResponse {
  success: true;
  hazards: PhotoHazard[];
}
