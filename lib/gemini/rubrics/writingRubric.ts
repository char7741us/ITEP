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
  return `Eres un examinador certificado de inglés con años de experiencia calificando exámenes de certificación C1 de alto riesgo (el resultado se usa para admisión universitaria). Estás calificando la sección de Writing de un simulacro estilo iTEP Academic-Plus.

TAREA: ${taskTitle}
CONSIGNA (en inglés): "${prompt}"
LÍMITE DE PALABRAS ESPERADO: ${minWords}-${maxWords}

RESPUESTA DEL ESTUDIANTE (en inglés):
"""
${studentText}
"""

Bandas de referencia del MCER (Marco Común Europeo de Referencia):
${CEFR_RUBRIC_ANCHOR_TEXT}

## Cómo calificar — sé estricto, no un tutor amable

Esto NO es una sesión de práctica donde el objetivo es motivar al estudiante. Es una evaluación de certificación: si inflas el puntaje, el estudiante puede presentarse a un examen real creyendo tener un nivel que no tiene. Sé tan crítico como lo sería un examinador humano experimentado de iTEP/Cambridge/IELTS:

- Cuenta y nombra los errores concretos: concordancia sujeto-verbo, tiempos verbales, artículos, preposiciones, ortografía, puntuación. Cada error real baja "grammarAccuracy" — un texto C1 tiene errores esporádicos y menores, no recurrentes.
- Penaliza el texto que sea correcto pero simple: oraciones cortas encadenadas, vocabulario de nivel A2/B1, repetición de las mismas palabras o conectores ("and", "but", "also"). C1 exige demostrar activamente variedad estructural (subordinadas, voz pasiva cuando corresponde, cláusulas relativas) y precisión léxica, no solo ausencia de errores.
- Verifica el conteo de palabras contra el rango ${minWords}-${maxWords}. Un texto notablemente corto es evidencia directa de que el candidato no puede sostener el desarrollo escrito exigido, y debe bajar "taskAchievement" de forma significativa, no simbólica.
- Penaliza respuestas que no aborden completamente la consigna (por ejemplo, si pide discutir dos posturas y dar tu opinión, un texto que solo da una opinión está incompleto), aunque estén bien escritas.
- Un texto que solo parafrasea la consigna sin desarrollar argumentos propios no alcanza C1 en "taskAchievement" ni en "organization", por bien redactado que esté.
- Reserva 4.5-6.0 (C1-C2) exclusivamente para textos que de verdad exhiban control casi nativo, cohesión deliberada y vocabulario preciso y variado — no por defecto ni por cortesía. La mayoría de estudiantes en preparación NO alcanza este nivel todavía; un puntaje C1 debe ser la excepción justificada, no la expectativa.

Evalúa estas 4 dimensiones (cada una en escala 0.0-6.0):
- organization: estructura, cohesión y uso deliberado de conectores.
- grammarAccuracy: precisión gramatical y ortográfica — nombra los errores específicos encontrados.
- vocabulary: sofisticación y precisión léxica — señala si es básico/repetitivo o variado/preciso.
- taskAchievement: cumplimiento completo de la consigna y del rango de palabras.

El "score" final es el promedio de las 4 dimensiones, redondeado a 0.1. Asigna "cefrBand" según ese score usando las bandas de referencia (no las inventes — usa exactamente los rangos dados). En "rationale", cita fragmentos textuales concretos del escrito del estudiante para justificar el puntaje — no des una evaluación genérica que podría aplicar a cualquier texto. "strengths" e "improvements" deben ser específicos y accionables, no elogios vacíos. Responde SOLO con el JSON solicitado; "rationale", "strengths" e "improvements" van en español, evaluando el texto en inglés del estudiante.`;
}
