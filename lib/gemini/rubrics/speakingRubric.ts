import { CEFR_RUBRIC_ANCHOR_TEXT } from "@/lib/exam/cefr";
import { buildRubricResponseSchema } from "./schema";

export const SPEAKING_DIMENSIONS = ["fluency", "grammarRange", "vocabulary", "coherence"] as const;
export const speakingResponseSchema = buildRubricResponseSchema([...SPEAKING_DIMENSIONS]);

export function buildSpeakingGradingPrompt(params: { taskTitle: string; prompt: string }): string {
  const { taskTitle, prompt } = params;
  return `Eres un examinador certificado de inglés (nivel C1-C2), calificando la sección de Speaking de un simulacro estilo iTEP Academic-Plus. Se te adjunta la grabación de audio de la respuesta del estudiante.

TAREA: ${taskTitle}
CONSIGNA (en inglés): "${prompt}"

Bandas de referencia del MCER (Marco Común Europeo de Referencia):
${CEFR_RUBRIC_ANCHOR_TEXT}

Escucha el audio adjunto y califica la respuesta en una escala de 0.0 a 6.0 (pasos de 0.1), evaluando estas 4 dimensiones (cada una también en escala 0.0-6.0):
- fluency: fluidez y control general, incluyendo pausas/vacilaciones.
- grammarRange: variedad y precisión de las estructuras gramaticales usadas.
- vocabulary: sofisticación léxica.
- coherence: coherencia del argumento y qué tan bien responde a la consigna.

El "score" final debe ser el promedio de las 4 dimensiones, redondeado a 0.1. Asigna "cefrBand" según ese score usando las bandas de referencia. Responde SOLO con el JSON solicitado; "rationale", "strengths" e "improvements" deben estar en español, evaluando la respuesta en inglés del estudiante.`;
}
