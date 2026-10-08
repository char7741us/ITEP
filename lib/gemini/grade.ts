import { ApiError } from "@google/genai";
import { getGeminiClient, GRADING_MODELS } from "./provider";
import type { RubricResult } from "@/lib/types/attempt";
import { buildWritingGradingPrompt, writingResponseSchema } from "./rubrics/writingRubric";
import { buildSpeakingGradingPrompt, speakingResponseSchema } from "./rubrics/speakingRubric";

async function callGemini(contents: unknown, responseSchema: object): Promise<RubricResult> {
  const client = getGeminiClient();
  let response;
  let lastError: unknown;

  for (const [index, model] of GRADING_MODELS.entries()) {
    try {
      response = await client.models.generateContent({
        model,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contents: contents as any,
        config: {
          responseMimeType: "application/json",
          responseSchema,
        },
      });
      break;
    } catch (error) {
      lastError = error;
      const hasFallback = index < GRADING_MODELS.length - 1;
      const canRetryWithFallback = error instanceof ApiError && [404, 429, 503].includes(error.status);
      if (!hasFallback || !canRetryWithFallback) throw error;
    }
  }

  if (!response) {
    throw lastError instanceof Error ? lastError : new Error("Gemini no pudo calificar esta respuesta.");
  }
  const text = response.text;
  if (!text) {
    throw new Error("Gemini no devolvió contenido para calificar esta respuesta.");
  }
  return JSON.parse(text) as RubricResult;
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
