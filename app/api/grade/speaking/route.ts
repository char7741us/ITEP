import { gradeSpeaking } from "@/lib/gemini/grade";
import { speakingGradeRequestSchema } from "@/lib/gemini/validation";
import { limitAIRequest, readLimitedJSON, requestProblemResponse } from "@/lib/server/ai-request";

export const maxDuration = 60;

export async function POST(request: Request) {
  let body;
  try {
    body = speakingGradeRequestSchema.parse(await readLimitedJSON(request, 3_200_000));
  } catch (error) {
    return requestProblemResponse(error);
  }
  const limited = limitAIRequest(request);
  if (limited) return limited;

  try {
    const result = await gradeSpeaking(body);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "No pudimos evaluar Speaking ahora. Conserva tu grabación y vuelve a intentar en un momento." }, { status: 502 });
  }
}
