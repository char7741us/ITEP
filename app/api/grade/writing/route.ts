import { gradeWriting } from "@/lib/gemini/grade";
import { writingGradeRequestSchema } from "@/lib/gemini/validation";
import { limitAIRequest, readLimitedJSON, requestProblemResponse } from "@/lib/server/ai-request";

export const maxDuration = 60;

export async function POST(request: Request) {
  let body;
  try {
    body = writingGradeRequestSchema.parse(await readLimitedJSON(request));
  } catch (error) {
    return requestProblemResponse(error);
  }
  const limited = limitAIRequest(request);
  if (limited) return limited;

  try {
    const result = await gradeWriting(body);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "No pudimos evaluar Writing ahora. Tu texto sigue guardado; vuelve a intentar en un momento." }, { status: 502 });
  }
}
