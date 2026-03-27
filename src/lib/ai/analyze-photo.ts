// Claude Vision API for site photo hazard analysis
// Takes a photo of a worksite and identifies visible hazards

import Anthropic from "@anthropic-ai/sdk";
import type { PhotoHazard } from "@/types/swms";

const MODEL = "claude-sonnet-4-20250514";

function getClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

const PHOTO_ANALYSIS_PROMPT = `You are an Australian WHS (Work Health and Safety) site inspector examining a photo of a construction worksite.

Identify all visible hazards and unsafe conditions in this photo. For each hazard:
1. Describe the specific hazard you can see
2. Suggest practical control measures

Focus on hazards that would be relevant to a SWMS (Safe Work Method Statement). Only identify hazards you can genuinely see in the photo — do not guess or fabricate hazards that are not visible.

Common things to look for:
- Working at height without protection (no guardrails, unprotected edges)
- Unsecured tools or materials that could fall
- Missing PPE on visible workers
- Trip hazards (cables, debris, uneven surfaces)
- Proximity to traffic, power lines, or other services
- Inadequate signage or barriers
- Poor housekeeping
- Weather exposure risks
- Plant and equipment hazards
- Excavation or trench hazards

Respond ONLY with valid JSON in this format:
{
  "hazards": [
    {
      "hazard": "Description of the specific hazard visible in the photo",
      "suggested_controls": ["Control measure 1", "Control measure 2"]
    }
  ]
}

If the photo does not show a worksite or no hazards are visible, return:
{"hazards": []}`;

export async function analyzePhoto(
  imageBase64: string,
  jobDescription?: string
): Promise<PhotoHazard[]> {
  const userContent: Anthropic.MessageCreateParams["messages"][0]["content"] = [
    {
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: imageBase64,
      },
    },
    {
      type: "text",
      text: jobDescription
        ? `Analyze this worksite photo for hazards. The planned work is: "${jobDescription}". Identify hazards relevant to both the visible conditions and the planned work.`
        : "Analyze this worksite photo for hazards.",
    },
  ];

  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: PHOTO_ANALYSIS_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return [];
  }

  try {
    let cleaned = textBlock.text.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed.hazards || !Array.isArray(parsed.hazards)) {
      return [];
    }

    return parsed.hazards.map(
      (h: { hazard: string; suggested_controls: string[] }) => ({
        hazard: h.hazard,
        suggested_controls: h.suggested_controls || [],
        selected: true, // Default to selected; user can deselect
      })
    );
  } catch {
    return [];
  }
}
