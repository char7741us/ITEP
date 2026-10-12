import type { ListeningLine } from "@/lib/types/content";
import { accents, type AccentId } from "@/lib/content/c1-lab/accents";

export const ACCENT_TTS_MODEL = "gemini-3.8-flash-lite-tts";
/** Author-supplied transcript only. No user voice, free text, or API key reaches the browser. */
export async function synthesizeAccent(lines: ListeningLine[], accent: AccentId): Promise<Uint8Array> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("TTS_UNAVAILABLE");
  const style = accents.find((item) => item.id === accent)!.instruction;
  const speakers = [...new Set(lines.map((line) => line.speaker))];
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST", headers: { "x-goog-api-key": key, "Content-Type": "application/json" }, signal: AbortSignal.timeout(45_000),
    body: JSON.stringify({ model: ACCENT_TTS_MODEL, input: [{ type: "user_input", content: lines.map((line) => ({ type: "text", text: line.text, annotations: [{ type: "speech_metadata", speaker: line.speaker, style: `Speak in ${style}. Conversational academic dialogue, moderate natural pace. Read exactly the supplied text; do not add or omit words.` }] })) }], response_format: { type: "audio" }, generation_config: { speech_config: { speakers: speakers.map((speaker, i) => ({ speaker, voice: i % 2 ? "Kore" : "Puck" })) } } }),
  });
  if (!response.ok) throw new Error(`TTS_${response.status}`);
  const payload = await response.json();
  const block = payload.steps?.filter((step: { type?: string }) => step.type === "model_output").flatMap((step: { content?: { type?: string; data?: string; mime_type?: string }[] }) => step.content ?? []).findLast((item: { type?: string }) => item.type === "audio");
  if (!block?.data) throw new Error("TTS_NO_AUDIO");
  const audio = Buffer.from(block.data, "base64");
  if (audio.length < 1000 || audio.length > 8_000_000 || audio.toString("ascii", 0, 4) !== "RIFF" || audio.toString("ascii", 8, 12) !== "WAVE") throw new Error("TTS_INVALID_WAV");
  return new Uint8Array(audio);
}
