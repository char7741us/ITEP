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
  if (readingItemCount !== 10) {
    throw new Error(`Reading debe tener 10 preguntas en total (4 + 6), encontró ${readingItemCount}`);
  }

  const grammarItemCount = result.data.grammar.parts.reduce((sum, p) => sum + p.items.length, 0);
  if (grammarItemCount !== 25) {
    throw new Error(`Grammar debe tener 25 preguntas en total (13 + 12), encontró ${grammarItemCount}`);
  }

  const listeningItemCount = result.data.listening.parts.reduce(
    (sum, part) => sum + part.segments.reduce((s, seg) => s + seg.items.length, 0),
    0
  );
  if (listeningItemCount !== 14) {
    throw new Error(`Listening debe tener 14 preguntas en total, encontró ${listeningItemCount}`);
  }

  return result.data;
}
