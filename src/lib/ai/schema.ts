// Zod schema for validating Claude's SWMS JSON output
// + semantic quality checks that go beyond structural validation

import { z } from "zod";
import { HRCW_CATEGORIES } from "@/lib/constants/hrcw-categories";
import {
  getNumericRiskScore,
  getRiskRating,
} from "@/lib/constants/risk-matrix";
import type {
  RiskLikelihood,
  RiskConsequence,
  RiskRating,
  SwmsData,
} from "@/types/swms";

// ============================================================================
// Structural Validation (Zod Schema)
// ============================================================================

const likelihoodValues = [
  "Rare",
  "Unlikely",
  "Possible",
  "Likely",
  "Almost Certain",
] as const;

const consequenceValues = [
  "Insignificant",
  "Minor",
  "Moderate",
  "Major",
  "Catastrophic",
] as const;

const ratingValues = ["Low", "Medium", "High", "Very High", "Extreme"] as const;

const riskAssessmentSchema = z.object({
  likelihood: z.enum(likelihoodValues),
  consequence: z.enum(consequenceValues),
  rating: z.enum(ratingValues),
});

const procedureStepSchema = z.object({
  step_number: z.number().int().positive(),
  activity: z.string().min(10, "Activity description too short"),
  hazards: z
    .array(z.string().min(5, "Hazard description too short"))
    .min(1, "Each step must have at least one hazard"),
  initial_risk: riskAssessmentSchema,
  controls: z
    .array(z.string().min(10, "Control description too short"))
    .min(1, "Each step must have at least one control measure"),
  residual_risk: riskAssessmentSchema,
  responsible: z.string().min(1, "Responsible person/role required"),
});

const plantEquipmentSchema = z.object({
  item: z.string().min(2, "Equipment item name required"),
  pre_use_checks: z.string().min(5, "Pre-use checks required"),
});

const emergencyContactSchema = z.object({
  role: z.string().min(1, "Contact role required"),
  contact: z.string().min(1, "Contact number/method required"),
});

export const swmsResponseSchema = z.object({
  document_purpose: z.string().min(20, "Document purpose too brief"),
  scope_of_work: z.string().min(20, "Scope of work too brief"),
  hrcw_activities: z
    .array(z.string())
    .min(1, "At least one HRCW activity must be identified"),
  environmental_conditions: z
    .array(z.string())
    .min(1, "At least one environmental condition expected"),
  training_competency: z
    .array(z.string())
    .min(1, "At least one training/competency requirement expected"),
  plant_equipment: z
    .array(plantEquipmentSchema)
    .min(1, "At least one plant/equipment item expected"),
  steps: z
    .array(procedureStepSchema)
    .min(3, "SWMS must have at least 3 procedure steps")
    .max(20, "SWMS should not exceed 20 procedure steps"),
  ppe_requirements: z
    .array(z.string())
    .min(1, "At least one PPE requirement expected"),
  emergency_procedures: z
    .array(z.string())
    .min(1, "At least one emergency procedure required"),
  emergency_contacts: z
    .array(emergencyContactSchema)
    .min(1, "At least one emergency contact required"),
  permit_requirements: z
    .array(z.string())
    .min(1, "Permit requirements section required"),
  communication_consultation: z
    .array(z.string())
    .min(1, "Communication/consultation section required"),
  legislation_references: z
    .array(z.string())
    .min(1, "At least one legislative reference required"),
  toolbox_talk: z
    .string()
    .min(100, "Toolbox talk too short — needs at least 100 characters"),
});

// ============================================================================
// Semantic Quality Checks
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  score: number; // 0-100 compliance score
}

const GENERIC_HAZARDS = [
  "slip/trip/fall",
  "injury",
  "safety risks",
  "general hazards",
  "accidents",
  "harm",
  "danger",
  "risks",
  "health issues",
];

const CONTROL_PREFIXES = [
  "[ELIMINATE]",
  "[SUBSTITUTE]",
  "[ISOLATE]",
  "[ENGINEERING]",
  "[ADMIN]",
  "[PPE]",
];

export function validateSwmsQuality(data: SwmsData): ValidationResult {
  const issues: string[] = [];
  let deductions = 0;

  // 1. Check risk reduction for every step
  for (const step of data.steps) {
    const initialScore = getNumericRiskScore(
      step.initial_risk.likelihood as RiskLikelihood,
      step.initial_risk.consequence as RiskConsequence
    );
    const residualScore = getNumericRiskScore(
      step.residual_risk.likelihood as RiskLikelihood,
      step.residual_risk.consequence as RiskConsequence
    );

    if (residualScore >= initialScore) {
      issues.push(
        `Step ${step.step_number}: Residual risk (${step.residual_risk.rating}) is not lower than initial risk (${step.initial_risk.rating}). Controls must demonstrably reduce risk.`
      );
      deductions += 5;
    }

    // 2. Auto-correct risk matrix ratings to match our 5x5 matrix
    // The AI sometimes picks ratings 1 level off -- fix silently rather than penalise
    const expectedInitialRating = getRiskRating(
      step.initial_risk.likelihood as RiskLikelihood,
      step.initial_risk.consequence as RiskConsequence
    );
    if (step.initial_risk.rating !== expectedInitialRating) {
      step.initial_risk.rating = expectedInitialRating;
    }

    const expectedResidualRating = getRiskRating(
      step.residual_risk.likelihood as RiskLikelihood,
      step.residual_risk.consequence as RiskConsequence
    );
    if (step.residual_risk.rating !== expectedResidualRating) {
      step.residual_risk.rating = expectedResidualRating;
    }

    // 3. Check for generic hazards
    for (const hazard of step.hazards) {
      const lower = hazard.toLowerCase();
      for (const generic of GENERIC_HAZARDS) {
        if (lower === generic || (lower.length < 20 && lower.includes(generic))) {
          issues.push(
            `Step ${step.step_number}: Hazard "${hazard}" is too generic. Hazards must be specific to the work activity.`
          );
          deductions += 3;
          break;
        }
      }
    }

    // 4. Check controls have hierarchy prefixes
    const hasPrefix = step.controls.some((c) =>
      CONTROL_PREFIXES.some((p) => c.toUpperCase().startsWith(p))
    );
    if (!hasPrefix) {
      issues.push(
        `Step ${step.step_number}: Controls should be prefixed with their type ([ENGINEERING], [ADMIN], [PPE], etc.).`
      );
      deductions += 2;
    }

    // 5. Check controls aren't PPE-only
    const allPPE = step.controls.every(
      (c) =>
        c.toUpperCase().startsWith("[PPE]") ||
        c.toLowerCase().includes("wear") ||
        c.toLowerCase().includes("ppe")
    );
    if (allPPE && step.controls.length > 0) {
      issues.push(
        `Step ${step.step_number}: Controls are PPE-only. Higher-order controls (engineering, admin) should be applied first.`
      );
      deductions += 4;
    }
  }

  // 6. Validate HRCW categories reference valid items
  const validDescriptionStarts = HRCW_CATEGORIES.map((c) =>
    String(c.id) + "."
  );
  for (const activity of data.hrcw_activities) {
    const matchesKnown = validDescriptionStarts.some((prefix) =>
      activity.trim().startsWith(prefix)
    );
    if (!matchesKnown) {
      // Try to see if it loosely matches any category description
      const matchesDescription = HRCW_CATEGORIES.some(
        (c) =>
          activity.toLowerCase().includes(c.short_label.toLowerCase()) ||
          c.description.toLowerCase().includes(activity.toLowerCase().replace(/^\d+\.\s*/, ""))
      );
      if (!matchesDescription) {
        issues.push(
          `HRCW activity "${activity}" does not match any of the 19 valid categories.`
        );
        deductions += 3;
      }
    }
  }

  // 7. Check step count is reasonable
  if (data.steps.length < 5) {
    issues.push(
      `Only ${data.steps.length} procedure steps. A thorough SWMS typically has 5-15 steps.`
    );
    deductions += 3;
  }

  // 8. Check toolbox talk is conversational
  if (data.toolbox_talk) {
    const hasConversationalTone =
      data.toolbox_talk.includes("you") ||
      data.toolbox_talk.includes("we") ||
      data.toolbox_talk.includes("team") ||
      data.toolbox_talk.includes("everyone");
    if (!hasConversationalTone) {
      issues.push(
        "Toolbox talk should be written in conversational language (use 'you', 'we', 'team')."
      );
      deductions += 2;
    }
  }

  // 9. Check emergency procedures are specific
  if (data.emergency_procedures.length === 1) {
    const proc = data.emergency_procedures[0].toLowerCase();
    if (
      proc.includes("call 000") &&
      proc.length < 50 &&
      !proc.includes("specific")
    ) {
      issues.push(
        "Emergency procedures are too generic. Include specific responses for the identified hazards."
      );
      deductions += 3;
    }
  }

  // Calculate compliance score (0-100)
  const score = Math.max(0, Math.min(100, 100 - deductions));

  return {
    valid: issues.length === 0,
    issues,
    score,
  };
}

// ============================================================================
// Parse and Validate
// ============================================================================

export function parseSwmsResponse(raw: string): {
  data: SwmsData | null;
  structuralErrors: string[];
} {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // Try to parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return {
      data: null,
      structuralErrors: [
        "Response is not valid JSON. Raw output started with: " +
          cleaned.substring(0, 100),
      ],
    };
  }

  // Validate against Zod schema
  const result = swmsResponseSchema.safeParse(parsed);
  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    return { data: null, structuralErrors: errors };
  }

  return { data: result.data as SwmsData, structuralErrors: [] };
}
