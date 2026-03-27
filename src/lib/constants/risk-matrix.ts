// 5x5 Risk Assessment Matrix
// Likelihood × Consequence = Risk Rating

import type {
  RiskLikelihood,
  RiskConsequence,
  RiskRating,
} from "@/types/swms";

export const LIKELIHOOD_LEVELS: RiskLikelihood[] = [
  "Rare",
  "Unlikely",
  "Possible",
  "Likely",
  "Almost Certain",
];

export const CONSEQUENCE_LEVELS: RiskConsequence[] = [
  "Insignificant",
  "Minor",
  "Moderate",
  "Major",
  "Catastrophic",
];

export const RISK_RATINGS: RiskRating[] = [
  "Low",
  "Medium",
  "High",
  "Very High",
  "Extreme",
];

// Numeric scores for comparison (higher = worse)
const LIKELIHOOD_SCORE: Record<RiskLikelihood, number> = {
  Rare: 1,
  Unlikely: 2,
  Possible: 3,
  Likely: 4,
  "Almost Certain": 5,
};

const CONSEQUENCE_SCORE: Record<RiskConsequence, number> = {
  Insignificant: 1,
  Minor: 2,
  Moderate: 3,
  Major: 4,
  Catastrophic: 5,
};

// 5x5 matrix lookup: RISK_MATRIX[likelihood][consequence] = rating
const RISK_MATRIX: Record<RiskLikelihood, Record<RiskConsequence, RiskRating>> =
  {
    Rare: {
      Insignificant: "Low",
      Minor: "Low",
      Moderate: "Low",
      Major: "Medium",
      Catastrophic: "Medium",
    },
    Unlikely: {
      Insignificant: "Low",
      Minor: "Low",
      Moderate: "Medium",
      Major: "High",
      Catastrophic: "High",
    },
    Possible: {
      Insignificant: "Low",
      Minor: "Medium",
      Moderate: "High",
      Major: "High",
      Catastrophic: "Very High",
    },
    Likely: {
      Insignificant: "Low",
      Minor: "Medium",
      Moderate: "High",
      Major: "Very High",
      Catastrophic: "Extreme",
    },
    "Almost Certain": {
      Insignificant: "Medium",
      Minor: "High",
      Moderate: "Very High",
      Major: "Extreme",
      Catastrophic: "Extreme",
    },
  };

const RATING_SCORE: Record<RiskRating, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  "Very High": 4,
  Extreme: 5,
};

export function getRiskRating(
  likelihood: RiskLikelihood,
  consequence: RiskConsequence
): RiskRating {
  return RISK_MATRIX[likelihood][consequence];
}

export function getRiskScore(rating: RiskRating): number {
  return RATING_SCORE[rating];
}

export function getNumericRiskScore(
  likelihood: RiskLikelihood,
  consequence: RiskConsequence
): number {
  return LIKELIHOOD_SCORE[likelihood] * CONSEQUENCE_SCORE[consequence];
}

export function isRiskReduced(
  initial: { likelihood: RiskLikelihood; consequence: RiskConsequence },
  residual: { likelihood: RiskLikelihood; consequence: RiskConsequence }
): boolean {
  return (
    getNumericRiskScore(residual.likelihood, residual.consequence) <
    getNumericRiskScore(initial.likelihood, initial.consequence)
  );
}

export const RISK_RATING_COLORS: Record<RiskRating, string> = {
  Low: "#22c55e",
  Medium: "#eab308",
  High: "#f97316",
  "Very High": "#ef4444",
  Extreme: "#7f1d1d",
};
