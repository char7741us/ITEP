import { z } from "zod";

export const coachRequestSchema = z.object({
  message: z.string().trim().min(1).max(1200),
  summary: z.object({
    dailyGoal: z.number().int().min(5).max(15),
    todayActions: z.number().int().min(0).max(10000),
    streak: z.number().int().min(0).max(10000),
    nextDaily: z.number().int().min(1).max(60),
    nextGrammar: z.number().int().min(1).max(20),
    dailyCompleted: z.number().int().min(0).max(60),
    grammarCompleted: z.number().int().min(0).max(20),
    weakest: z.string().max(30).nullable(),
    scores: z.record(z.string().max(30), z.number().min(0).max(6)),
    pendingRules: z.array(z.string().max(600)).max(5),
    improvements: z.array(z.string().max(1500)).max(4),
  }),
  context: z
    .object({
      skill: z.string().max(40).optional(),
      question: z.string().max(4000),
      explanation: z.string().max(4000).optional(),
    })
    .nullable()
    .optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().max(4000),
      }),
    )
    .max(6)
    .default([]),
});
export const coachAnswerSchema = z
  .object({
    message: z.string().trim().min(1).max(2400),
    steps: z.array(z.string().trim().min(1).max(600)).min(1).max(3),
    example: z.string().max(1600),
    quiz: z
      .object({
        skill: z.enum([
          "grammar",
          "reading",
          "listening",
          "writing",
          "speaking",
        ]),
        question: z.string().min(1).max(2000),
        options: z.array(z.string().min(1).max(600)).length(4),
        correctIndex: z.number().int().min(0).max(3),
        explanation: z.string().min(1).max(1600),
      })
      .nullable(),
  })
  .refine(
    (answer) =>
      !answer.quiz ||
      new Set(answer.quiz.options.map((option) => option.toLowerCase().trim()))
        .size === 4,
  );
export type CoachAnswer = z.infer<typeof coachAnswerSchema>;
export type CoachSummary = z.infer<typeof coachRequestSchema>["summary"];

export function suggestedStep(summary: CoachSummary) {
  if (summary.pendingRules.length)
    return {
      title: "Convierte un error en una victoria",
      detail: summary.pendingRules[0],
      href: "/cuaderno-errores",
      action: "Entrenar una debilidad",
      minutes: "5–10 min",
    };
  if (summary.weakest === "Grammar")
    return {
      title: "Tu siguiente pista está en Grammar",
      detail: `Día ${summary.nextGrammar} de tu ruta de 20 días.`,
      href: "/cuaderno-errores/grammar",
      action: "Ir a Grammar C1",
      minutes: "10–15 min",
    };
  return {
    title: "Un paso pequeño, cinco habilidades",
    detail: `Continúa con el día ${summary.nextDaily} de tu práctica diaria.`,
    href: `/practica-diaria/${summary.nextDaily}`,
    action: "Empezar mi misión",
    minutes: "15–20 min",
  };
}

export function localCoach(
  input: z.infer<typeof coachRequestSchema>,
): CoachAnswer {
  const step = suggestedStep(input.summary);
  if (input.context)
    return {
      message:
        "Vamos a desarmar este ejercicio, sin prisa. Primero localiza la pista que distingue la respuesta correcta de la alternativa más tentadora.",
      steps: [
        "Lee la consigna y formula qué te está pidiendo, antes de mirar las opciones.",
        input.context.explanation?.slice(0, 600) ||
          "Compara dos opciones: ¿qué palabra o evidencia permite descartar una?",
        "Explica la regla en tus propias palabras y aplícala a una oración nueva.",
      ],
      example:
        "La explicación del ejercicio es el punto de partida; si necesitas otra versión, vuelve a consultarme cuando esté disponible la conexión de IA.",
      quiz: null,
    };
  const grammar = /grammar|gramática|concordancia|agreement/i.test(
    input.message,
  );
  const short = /5 minutos|poco tiempo|cinco minutos/i.test(input.message);
  return {
    message: grammar
      ? "Hagamos una mini victoria de Grammar. Equivocarse aquí sirve para descubrir qué pista estás pasando por alto."
      : `No necesitas hacerlo todo hoy. Ya llevas ${input.summary.todayActions} pasos de práctica hoy; elige una tarea concreta y termina con una idea nueva.`,
    steps: grammar
      ? [
          "Encuentra el núcleo del sujeto, no el sustantivo más cercano al verbo.",
          "Decide si ese núcleo es singular o plural.",
          "Comprueba el tiempo verbal y la concordancia por separado.",
        ]
      : short
        ? [
            "Abre una pregunta de Grammar o un tema pendiente del Cuaderno; no necesitas terminar una sesión entera.",
            "Responde y usa un minuto para explicar la pista con tus palabras.",
            "Guarda una idea útil y toma una pausa: cinco minutos también sirven.",
          ]
        : [
            step.detail,
            "Antes de responder, justifica tu elección con una pista concreta.",
            "Al terminar, anota una regla útil y toma una pausa.",
          ],
    example: grammar
      ? "The collection of rare maps is stored upstairs. El sujeto es collection (singular); maps no controla el verbo."
      : "Una sesión breve y atenta cuenta más que responder deprisa para llenar un contador.",
    quiz: grammar
      ? {
          skill: "grammar",
          question:
            "Complete: Neither the principal investigator nor her assistants ___ available to discuss the findings yesterday.",
          options: ["was", "were", "has been", "is"],
          correctIndex: 1,
          explanation:
            "Con neither…nor, el verbo concuerda con el sujeto más cercano: assistants (plural). Yesterday exige pasado: were. Was respeta el pasado, pero no la concordancia.",
        }
      : null,
  };
}
