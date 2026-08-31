import { GoogleGenAI } from "@google/genai";

/** Cheap, multimodal, GA model — plenty for rubric-based grading (not the Live/realtime path). */
export const GRADING_MODEL = "gemini-2.5-flash";

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
