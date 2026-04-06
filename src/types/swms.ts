// Core SWMS data types -- the structured output from Claude AI

export type RiskLikelihood =
  | "Rare"
  | "Unlikely"
  | "Possible"
  | "Likely"
  | "Almost Certain";

export type RiskConsequence =
  | "Insignificant"
  | "Minor"
  | "Moderate"
  | "Major"
  | "Catastrophic";

export type RiskRating = "Low" | "Medium" | "High" | "Very High" | "Extreme";

export interface RiskAssessment {
  likelihood: RiskLikelihood;
  consequence: RiskConsequence;
  rating: RiskRating;
}

export interface ProcedureStep {
  step_number: number;
  activity: string;
  hazards: string[];
  initial_risk: RiskAssessment;
  controls: string[];
  residual_risk: RiskAssessment;
  responsible: string;
}

export interface PlantEquipment {
  item: string;
  pre_use_checks: string;
}

export interface EmergencyContact {
  role: string;
  contact: string;
}

export interface SwmsData {
  document_purpose: string;
  scope_of_work: string;
  hrcw_activities: string[];
  environmental_conditions: string[];
  training_competency: string[];
  plant_equipment: PlantEquipment[];
  steps: ProcedureStep[];
  ppe_requirements: string[];
  emergency_procedures: string[];
  emergency_contacts: EmergencyContact[];
  permit_requirements: string[];
  communication_consultation: string[];
  legislation_references: string[];
  toolbox_talk: string;
}

export interface SwmsDocument {
  id: string;
  // Business details
  business_name: string;
  abn?: string;
  contact_name: string;
  phone: string;
  state: AustralianState;
  logo_base64?: string;
  // Job details
  job_description: string;
  site_address?: string;
  principal_contractor?: string;
  job_reference?: string;
  // Generated content
  swms_data: SwmsData;
  compliance_score: number;
  // Metadata
  document_reference: string;
  revision_number: number;
  created_at: string;
}

export type AustralianState =
  | "NSW"
  | "VIC"
  | "QLD"
  | "WA"
  | "SA"
  | "TAS"
  | "NT"
  | "ACT";

export interface PhotoHazard {
  hazard: string;
  suggested_controls: string[];
  selected: boolean;
}
