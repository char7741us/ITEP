import { GoogleGenAI } from "@google/genai";

/**
 * Stable multimodal models for rubric-based text and audio grading.
 * The second model keeps grading available when the primary model is overloaded.
 */
export const GRADING_MODELS = ["gemini-3.8-flash", "gemini-3.5-flash-lite"] as const;
/** Writing rubrics are text-only and latency-sensitive; Lite still returns
 * the same structured rubric, with 3.8 Flash available as a fallback. */
export const WRITING_MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash"] as const;

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY no está configurada. Copia .env.local.example a .env.local, agrega tu key y reinicia el servidor."
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}
