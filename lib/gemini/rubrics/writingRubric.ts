import { CEFR_RUBRIC_ANCHOR_TEXT } from "@/lib/exam/cefr";
import { buildRubricResponseSchema } from "./schema";

export const WRITING_DIMENSIONS = ["organization", "grammarAccuracy", "vocabulary", "taskAchievement"] as const;
export const writingResponseSchema = buildRubricResponseSchema([...WRITING_DIMENSIONS]);

export function buildWritingGradingPrompt(params: {
  taskTitle: string;
  prompt: string;
  minWords: number;
  maxWords: number;
  studentText: string;
}): string {
  const { taskTitle, prompt, minWords, maxWords, studentText } = params;
  return `Eres un examinador certificado de inglés (nivel C1-C2), calificando la sección de Writing de un simulacro estilo iTEP Academic-Plus.

TAREA: ${taskTitle}
CONSIGNA (en inglés): "${prompt}"
LÍMITE DE PALABRAS ESPERADO: ${minWords}-${maxWords}

RESPUESTA DEL ESTUDIANTE (en inglés):
"""
${studentText}
"""

Bandas de referencia del MCER (Marco Común Europeo de Referencia):
${CEFR_RUBRIC_ANCHOR_TEXT}

Califica la respuesta en una escala de 0.0 a 6.0 (pasos de 0.1), evaluando estas 4 dimensiones (cada una también en escala 0.0-6.0):
- organization: organización, cohesión y uso de conectores.
- grammarAccuracy: precisión gramatical y ortográfica.
- vocabulary: sofisticación y precisión del vocabulario.
- taskAchievement: qué tan bien la respuesta cumple con la consigna y el rango de palabras pedido.

El "score" final debe ser el promedio de las 4 dimensiones, redondeado a 0.1. Asigna "cefrBand" según ese score usando las bandas de referencia. Responde SOLO con el JSON solicitado; "rationale", "strengths" e "improvements" deben estar en español, evaluando el texto en inglés del estudiante.`;
}
