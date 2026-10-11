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
  return `Actúa como evaluador exigente de práctica de inglés académico. Esta es una simulación inspirada en iTEP Academic-Plus, no una calificación oficial ni una certificación.

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

Criterio de exigencia: el nivel C1 requiere una postura o propósito claro, desarrollo de ideas con detalles concretos, organización coherente y pocos errores de gramática o estilo. No concedas C1 solo por vocabulario sofisticado o por respetar el número de palabras. Comprueba cada requisito de la consigna; una respuesta genérica, parcialmente fuera de tema o que omite un argumento/contraargumento pedido debe perder puntos en taskAchievement y organization. Penaliza errores repetidos que afecten precisión, referencias ambiguas, conectores mecánicos y vocabulario impreciso. Si la respuesta está fuera del rango de palabras, explica la consecuencia en taskAchievement; si es sustancialmente incompleta o vacía, asígnale una nota baja. No inventes contenido que el estudiante no escribió.

En rationale menciona al menos una evidencia concreta del texto y una limitación específica. En improvements da acciones verificables para la siguiente respuesta, no frases genéricas. La escala es orientativa; no afirmes que el resultado equivale a un puntaje oficial iTEP.

El "score" final debe ser el promedio de las 4 dimensiones, redondeado a 0.1. Asigna "cefrBand" según ese score usando las bandas de referencia. Responde SOLO con el JSON solicitado; "rationale", "strengths" e "improvements" deben estar en español, evaluando el texto en inglés del estudiante.`;
}
