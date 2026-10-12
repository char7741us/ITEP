import { z } from "zod";
import { scoreToBand } from "@/lib/exam/cefr";
import type { RubricResult } from "@/lib/types/attempt";

const promptFields = {
  taskTitle: z.string().trim().min(1).max(300),
  prompt: z.string().trim().min(1).max(8000),
};
export const writingGradeRequestSchema = z.object({
  ...promptFields,
  minWords: z.number().int().min(1).max(2000),
  maxWords: z.number().int().min(1).max(3000),
  studentText: z.string().trim().min(1).max(20000),
}).refine((body) => body.maxWords >= body.minWords);
export const speakingGradeRequestSchema = z.object({
  ...promptFields,
  audioBase64: z.string().min(16).max(3_000_000).regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/),
  mimeType: z.string().regex(/^audio\/(webm|mp4|mpeg|mp3|wav|x-wav|ogg|aac|flac)(?:;\s*codecs=[\w.,-]+)?$/i),
});

export const rubricResultSchema = z.object({
  score: z.number().min(0).max(6),
  cefrBand: z.enum(["Below B2", "B2", "C1", "C2"]),
  dimensionScores: z.record(z.string().max(60), z.number().min(0).max(6)),
  rationale: z.string().trim().min(1).max(6000),
  strengths: z.array(z.string().max(2000)).max(10),
  improvements: z.array(z.string().max(2000)).max(10),
});

/** Do not trust an LLM's arithmetic or display an invalid rubric as a grade. */
export function validateRubricResult(value: unknown, dimensions: readonly string[]): RubricResult {
  const result = rubricResultSchema.parse(value);
  if (dimensions.some((key) => result.dimensionScores[key] === undefined) || Object.keys(result.dimensionScores).length !== dimensions.length) {
    throw new Error("La evaluación no incluye todas las dimensiones requeridas.");
  }
  const score = Math.round(dimensions.reduce((sum, key) => sum + result.dimensionScores[key], 0) / dimensions.length * 10) / 10;
  return { ...result, score, cefrBand: scoreToBand(score).band };
}
