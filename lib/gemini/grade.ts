import { getGeminiClient, GRADING_MODEL } from "./provider";
import { scoreToBand } from "@/lib/exam/cefr";
import type { RubricResult } from "@/lib/types/attempt";
import { buildWritingGradingPrompt, writingResponseSchema } from "./rubrics/writingRubric";
import { buildSpeakingGradingPrompt, speakingResponseSchema } from "./rubrics/speakingRubric";

async function callGemini(contents: unknown, responseSchema: object): Promise<RubricResult> {
  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: GRADING_MODEL,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contents: contents as any,
    config: {
      responseMimeType: "application/json",
      responseSchema,
      // Grading must be reproducible and defensible: the same response should
      // not swing between B2 and C1 across runs, so sample deterministically.
      temperature: 0,
    },
  });
  const text = response.text;
  if (!text) {
    throw new Error("Gemini no devolvió contenido para calificar esta respuesta.");
  }
  return normalizeRubricResult(JSON.parse(text) as RubricResult);
}

/**
 * The model occasionally returns a `score` that doesn't match the dimension
 * scores it just gave, or a `cefrBand` inconsistent with that score. The band
 * a student sees drives a real decision, so recompute both from the dimension
 * scores rather than trusting the model's own arithmetic.
 */
function normalizeRubricResult(result: RubricResult): RubricResult {
  const dimensionValues = Object.values(result.dimensionScores ?? {}).filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value)
  );
  if (dimensionValues.length === 0) return result;

  const clamp = (value: number) => Math.min(6, Math.max(0, value));
  const average = dimensionValues.reduce((sum, value) => sum + clamp(value), 0) / dimensionValues.length;
  const score = Math.round(average * 10) / 10;

  return { ...result, score, cefrBand: scoreToBand(score).band };
}

export async function gradeWriting(params: {
  taskTitle: string;
  prompt: string;
  minWords: number;
  maxWords: number;
  studentText: string;
}): Promise<RubricResult> {
  const promptText = buildWritingGradingPrompt(params);
  return callGemini([{ role: "user", parts: [{ text: promptText }] }], writingResponseSchema);
}

export async function gradeSpeaking(params: {
  taskTitle: string;
  prompt: string;
  audioBase64: string;
  mimeType: string;
}): Promise<RubricResult> {
  const promptText = buildSpeakingGradingPrompt(params);
  return callGemini(
    [
      {
        role: "user",
        parts: [{ text: promptText }, { inlineData: { data: params.audioBase64, mimeType: params.mimeType } }],
      },
    ],
    speakingResponseSchema
  );
}
