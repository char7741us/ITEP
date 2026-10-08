import { GoogleGenAI } from "@google/genai";

/**
 * Stable multimodal models for rubric-based text and audio grading.
 * The second model keeps grading available when the primary model is overloaded.
 */
export const GRADING_MODELS = ["gemini-3.7-flash", "gemini-3.5-flash-lite"] as const;

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
