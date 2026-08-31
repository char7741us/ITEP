import { gradeWriting } from "@/lib/gemini/grade";

interface WritingGradeRequestBody {
  taskTitle: string;
  prompt: string;
  minWords: number;
  maxWords: number;
  studentText: string;
}

export async function POST(request: Request) {
  let body: WritingGradeRequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Cuerpo de la solicitud inválido." }, { status: 400 });
  }

  if (!body.studentText || !body.studentText.trim()) {
    return Response.json({ error: "No hay texto para calificar." }, { status: 400 });
  }

  try {
    const result = await gradeWriting(body);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al calificar con Gemini.";
    return Response.json({ error: message }, { status: 502 });
  }
}
