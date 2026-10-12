import { z } from "zod";
import { getLabModule } from "@/lib/content/c1-lab/bank";
import { getDailySession } from "@/lib/content/daily/build";
import { synthesizeAccent } from "@/lib/gemini/accent-tts";
import { limitAIRequest, readLimitedJSON, requestProblemResponse } from "@/lib/server/ai-request";

export const maxDuration = 60;
const schema = z.object({ source: z.enum(["daily", "lab"]), id: z.string().min(1).max(60), accent: z.enum(["us", "ca", "gb", "au", "in"]) }).strict();
const cache = new Map<string, { audio: Uint8Array; at: number }>();

export async function POST(request: Request) {
  let input;
  try { input = schema.parse(await readLimitedJSON(request, 2048)); }
  catch (error) { return requestProblemResponse(error); }
  const limited = limitAIRequest(request);
  if (limited) return limited;
  const lines = input.source === "lab" ? getLabModule(input.id)?.listening.lines : /^([1-9]|[1-5]\d|60)$/.test(input.id) ? getDailySession(Number(input.id))?.listening.lines : undefined;
  if (!lines) return Response.json({ error: "No se encontró este diálogo." }, { status: 404 });
  const cacheKey = `${input.source}:${input.id}:${input.accent}`;
  let entry = cache.get(cacheKey);
  try {
    if (!entry || Date.now() - entry.at > 3_600_000) {
      entry = { audio: await synthesizeAccent(lines, input.accent), at: Date.now() };
      // Bounded per-instance cache, not a distributed quota or permanent asset store.
      if (cache.size >= 12) cache.delete(cache.keys().next().value!);
      cache.set(cacheKey, entry);
    }
    return new Response(entry.audio.slice().buffer as ArrayBuffer, { headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store" } });
  } catch (cause) {
    const code = cause instanceof Error && /^TTS_(?:\d{3}|UNAVAILABLE|NO_AUDIO|INVALID_WAV)$/.test(cause.message) ? cause.message : "TTS_CONNECTION";
    console.warn("Regional listening generation unavailable:", code);
    return Response.json({ error: "No se pudo crear este audio ahora. Vuelve a intentar más tarde o usa el audio original si está disponible. No se cambió tu progreso." }, { status: 502 });
  }
}
