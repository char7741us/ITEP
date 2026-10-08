import { z } from "zod";

const mcqItemSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  choices: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correctIndex: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  explanation: z.string().min(1),
});

const readingPartSchema = z.object({
  partNumber: z.union([z.literal(1), z.literal(2)]),
  passageTitle: z.string().min(1),
  passageText: z.string().min(1),
  items: z.array(mcqItemSchema),
});

const listeningLineSchema = z.object({
  speaker: z.string().min(1),
  text: z.string().min(1),
});

const listeningSegmentSchema = z.object({
  audioScript: z.array(listeningLineSchema).min(1),
  audioAssetPath: z.string().min(1),
  durationSeconds: z.number().positive(),
  items: z.array(mcqItemSchema).min(1),
});

const listeningPartSchema = z.object({
  partNumber: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  title: z.string().min(1),
  segments: z.array(listeningSegmentSchema).min(1),
});

const grammarPartSchema = z.object({
  partNumber: z.union([z.literal(1), z.literal(2)]),
  kind: z.enum(["sentence-completion", "error-identification"]),
  items: z.array(mcqItemSchema),
});

const writingTaskSchema = z.object({
  taskNumber: z.union([z.literal(1), z.literal(2)]),
  title: z.string().min(1),
  prompt: z.string().min(1),
  minWords: z.number().positive(),
  maxWords: z.number().positive(),
  timeLimitSeconds: z.number().positive(),
});

const speakingTaskSchema = z.object({
  taskNumber: z.union([z.literal(1), z.literal(2)]),
  title: z.string().min(1),
  prompt: z.string().min(1),
  prepSeconds: z.number().positive(),
  responseSeconds: z.number().positive(),
});

export const contentPackSchema = z.object({
  manifest: z.object({
    packId: z.string().min(1),
    version: z.string().min(1),
    locale: z.literal("en"),
    createdAt: z.string().min(1),
    title: z.string().min(1),
  }),
  reading: z.object({
    totalTimeSeconds: z.number().positive(),
    parts: z.tuple([readingPartSchema, readingPartSchema]),
  }),
  listening: z.object({
    totalTimeSeconds: z.number().positive(),
    parts: z.tuple([listeningPartSchema, listeningPartSchema, listeningPartSchema]),
  }),
  grammar: z.object({
    totalTimeSeconds: z.number().positive(),
    parts: z.tuple([grammarPartSchema, grammarPartSchema]),
  }),
  writing: z.object({
    totalTimeSeconds: z.number().positive(),
    tasks: z.tuple([writingTaskSchema, writingTaskSchema]),
  }),
  speaking: z.object({
    warmupSeconds: z.number().positive(),
    tasks: z.tuple([speakingTaskSchema, speakingTaskSchema]),
  }),
});

export type ValidatedContentPack = z.infer<typeof contentPackSchema>;

export function validateContentPack(data: unknown): ValidatedContentPack {
  const result = contentPackSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Banco de contenido inválido:\n${issues}`);
  }

  const readingItemCount = result.data.reading.parts.reduce((sum, p) => sum + p.items.length, 0);
  if (readingItemCount !== 10 || result.data.reading.parts[0].items.length !== 4 || result.data.reading.parts[1].items.length !== 6) {
    throw new Error(`Reading debe tener 10 preguntas en total (4 + 6), encontró ${readingItemCount}`);
  }
  if (result.data.reading.totalTimeSeconds !== 20 * 60) throw new Error("Reading debe durar 20 minutos");

  const grammarItemCount = result.data.grammar.parts.reduce((sum, p) => sum + p.items.length, 0);
  if (grammarItemCount !== 25 || result.data.grammar.parts[0].items.length !== 13 || result.data.grammar.parts[1].items.length !== 12) {
    throw new Error(`Grammar debe tener 25 preguntas en total (13 + 12), encontró ${grammarItemCount}`);
  }
  if (result.data.grammar.totalTimeSeconds !== 10 * 60) throw new Error("Grammar debe durar 10 minutos");

  const listeningItemCount = result.data.listening.parts.reduce(
    (sum, part) => sum + part.segments.reduce((s, seg) => s + seg.items.length, 0),
    0
  );
  if (listeningItemCount !== 14) {
    throw new Error(`Listening debe tener 14 preguntas en total, encontró ${listeningItemCount}`);
  }
  if (result.data.listening.totalTimeSeconds !== 20 * 60) throw new Error("Listening debe durar 20 minutos");
  const listeningShape = result.data.listening.parts.map((part) => [part.segments.length, part.segments.reduce((sum, segment) => sum + segment.items.length, 0)]);
  if (JSON.stringify(listeningShape) !== JSON.stringify([[4, 4], [1, 4], [1, 6]])) {
    throw new Error("Listening debe tener 4 conversaciones breves, 1 conversación larga y 1 clase (4 + 4 + 6 preguntas)");
  }
  if (result.data.writing.totalTimeSeconds !== 25 * 60 ||
      result.data.writing.tasks[0].timeLimitSeconds !== 5 * 60 ||
      result.data.writing.tasks[1].timeLimitSeconds !== 20 * 60) {
    throw new Error("Writing debe durar 5 + 20 minutos");
  }
  if (result.data.speaking.warmupSeconds !== 60 ||
      result.data.speaking.tasks[0].prepSeconds !== 30 ||
      result.data.speaking.tasks[0].responseSeconds !== 45 ||
      result.data.speaking.tasks[1].prepSeconds !== 45 ||
      result.data.speaking.tasks[1].responseSeconds !== 60) {
    throw new Error("Los tiempos de Speaking no coinciden con iTEP Academic-Plus");
  }

  const allItems = [
    ...result.data.reading.parts.flatMap((part) => part.items),
    ...result.data.listening.parts.flatMap((part) => part.segments.flatMap((segment) => segment.items)),
    ...result.data.grammar.parts.flatMap((part) => part.items),
  ];
  if (new Set(allItems.map((item) => item.id)).size !== allItems.length) {
    throw new Error("Los ID de preguntas deben ser únicos dentro de cada simulacro");
  }

  return result.data;
}
