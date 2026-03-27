// Claude API integration for SWMS generation
// Handles: prompt assembly, API call, response parsing, validation, and retry

import Anthropic from "@anthropic-ai/sdk";
import { buildSwmsPrompt, buildCorrectionPrompt } from "./prompts";
import { parseSwmsResponse, validateSwmsQuality } from "./schema";
import type { SwmsData, AustralianState } from "@/types/swms";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 8192;
const MAX_RETRIES = 1;

function getClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

export interface GenerateSwmsInput {
  job_description: string;
  state: AustralianState;
  site_address?: string;
  principal_contractor?: string;
  additional_hazards?: string[];
}

export interface GenerateSwmsResult {
  success: true;
  data: SwmsData;
  compliance_score: number;
  validation_warnings: string[];
}

export interface GenerateSwmsError {
  success: false;
  error: string;
  details?: string[];
}

export async function generateSwms(
  input: GenerateSwmsInput
): Promise<GenerateSwmsResult | GenerateSwmsError> {
  const { system, user } = buildSwmsPrompt({
    state: input.state,
    job_description: input.job_description,
    site_address: input.site_address,
    principal_contractor: input.principal_contractor,
    additional_hazards: input.additional_hazards,
  });

  // First attempt
  let rawResponse: string;
  try {
    rawResponse = await callClaude(system, user);
  } catch (error) {
    return {
      success: false,
      error: "Failed to generate SWMS. Please try again.",
      details: [error instanceof Error ? error.message : "Unknown API error"],
    };
  }

  // Parse and validate
  let { data, structuralErrors } = parseSwmsResponse(rawResponse);

  if (structuralErrors.length > 0 || !data) {
    // Retry with correction prompt
    try {
      const correctionUser = buildCorrectionPrompt(
        rawResponse,
        structuralErrors
      );
      rawResponse = await callClaude(system, correctionUser);
      const retryResult = parseSwmsResponse(rawResponse);
      data = retryResult.data;
      structuralErrors = retryResult.structuralErrors;
    } catch {
      // If retry also fails, return error
    }

    if (!data) {
      return {
        success: false,
        error:
          "The AI generated an invalid response. Please try again with a different job description.",
        details: structuralErrors,
      };
    }
  }

  // Semantic quality validation
  const quality = validateSwmsQuality(data);

  // If quality is very poor and we haven't retried yet, try once more
  if (quality.score < 60 && quality.issues.length > 3) {
    try {
      const correctionUser = buildCorrectionPrompt(
        JSON.stringify(data, null, 2),
        quality.issues
      );
      const retryResponse = await callClaude(system, correctionUser);
      const retryResult = parseSwmsResponse(retryResponse);

      if (retryResult.data) {
        const retryQuality = validateSwmsQuality(retryResult.data);
        // Use retry result if it's better
        if (retryQuality.score > quality.score) {
          return {
            success: true,
            data: retryResult.data,
            compliance_score: retryQuality.score,
            validation_warnings: retryQuality.issues,
          };
        }
      }
    } catch {
      // Fall through to return original result
    }
  }

  return {
    success: true,
    data,
    compliance_score: quality.score,
    validation_warnings: quality.issues,
  };
}

// ============================================================================
// Claude API Call
// ============================================================================

async function callClaude(system: string, user: string): Promise<string> {
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages: [{ role: "user", content: user }],
  });

  // Extract text content from response
  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in Claude response");
  }

  return textBlock.text;
}
