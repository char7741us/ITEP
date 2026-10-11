import { CEFR_RUBRIC_ANCHOR_TEXT } from "@/lib/exam/cefr";
import { buildRubricResponseSchema } from "./schema";

export const SPEAKING_DIMENSIONS = ["fluency", "grammarRange", "vocabulary", "coherence"] as const;
export const speakingResponseSchema = buildRubricResponseSchema([...SPEAKING_DIMENSIONS]);

export function buildSpeakingGradingPrompt(params: { taskTitle: string; prompt: string }): string {
  const { taskTitle, prompt } = params;
  return `Actúa como evaluador exigente de práctica oral de inglés académico. Esta es una simulación inspirada en iTEP Academic-Plus, no una calificación oficial ni una certificación. Se adjunta la grabación de la respuesta.

TAREA: ${taskTitle}
CONSIGNA (en inglés): "${prompt}"

Bandas de referencia del MCER (Marco Común Europeo de Referencia):
${CEFR_RUBRIC_ANCHOR_TEXT}

Escucha el audio adjunto y califica la respuesta en una escala de 0.0 a 6.0 (pasos de 0.1), evaluando estas 4 dimensiones (cada una también en escala 0.0-6.0):
- fluency: fluidez y control general, incluyendo pausas/vacilaciones.
- grammarRange: variedad y precisión de las estructuras gramaticales usadas.
- vocabulary: sofisticación léxica.
- coherence: coherencia del argumento y qué tan bien responde a la consigna.

Criterio de exigencia: C1 implica explicar y desarrollar ideas con fluidez, organización y vocabulario apropiado, con errores ocasionales pero no persistentes. Escucha la grabación completa. Distingue pausas naturales de vacilaciones que interrumpen el argumento. No premies un discurso fluido si evita partes de la consigna, usa afirmaciones genéricas sin ejemplos, repite vocabulario básico o no llega a una conclusión. Penaliza respuestas muy breves, parcialmente inaudibles o fuera de tema. No infieras contenido que no se pueda oír. Si no hay habla inteligible, la nota debe ser baja. La pronunciación solo debe influir cuando perjudica la inteligibilidad, no por el acento.

En rationale cita brevemente una idea efectivamente dicha y una limitación observable. En improvements da acciones concretas para una nueva grabación. No afirmes que esta estimación equivale a un puntaje oficial iTEP.

El "score" final debe ser el promedio de las 4 dimensiones, redondeado a 0.1. Asigna "cefrBand" según ese score usando las bandas de referencia. Responde SOLO con el JSON solicitado; "rationale", "strengths" e "improvements" deben estar en español, evaluando la respuesta en inglés del estudiante.`;
}
