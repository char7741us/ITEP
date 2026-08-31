import { gradeSpeaking } from "@/lib/gemini/grade";

interface SpeakingGradeRequestBody {
  taskTitle: string;
  prompt: string;
  audioBase64: string;
  mimeType: string;
}

export async function POST(request: Request) {
  let body: SpeakingGradeRequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Cuerpo de la solicitud inválido." }, { status: 400 });
  }

  if (!body.audioBase64) {
    return Response.json({ error: "No hay audio para calificar." }, { status: 400 });
  }

  try {
    const result = await gradeSpeaking(body);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al calificar con Gemini.";
    return Response.json({ error: message }, { status: 502 });
  }
}
