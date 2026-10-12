"use client";

import { loadContentPack } from "@/lib/content/loader";
import { getSpeakingAudio } from "@/lib/storage/attemptsRepo";
import { getReadingItems, getGrammarItems } from "./items";
import { getListeningItems } from "./listening";
import { scoreObjectiveSection, averageScore } from "./scoring";
import { scoreToBand } from "./cefr";
import type { ExamMachineContext } from "./machine.types";
import type { AttemptRecord, AttemptScores, RubricResult } from "@/lib/types/attempt";
import type { ExamContentPack } from "@/lib/types/content";
import { requestGrade } from "./grade-request";

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function fetchGrade(url: string, body: unknown): Promise<RubricResult> {
  return requestGrade(url, body);
}

export async function gradeWritingTask(
  taskTitle: string,
  prompt: string,
  minWords: number,
  maxWords: number,
  studentText: string
): Promise<RubricResult | null> {
  if (!studentText.trim()) return null;
  return fetchGrade("/api/grade/writing", { taskTitle, prompt, minWords, maxWords, studentText });
}

export async function gradeSpeakingTask(taskTitle: string, prompt: string, blobKey: string | undefined): Promise<RubricResult | null> {
  if (!blobKey) return null;
  const blob = await getSpeakingAudio(blobKey);
  if (!blob) return null;
  const audioBase64 = await blobToBase64(blob);
  return fetchGrade("/api/grade/speaking", { taskTitle, prompt, audioBase64, mimeType: blob.type || "audio/webm" });
}

export interface GradingResult {
  scores: AttemptScores;
  writingGrades: Partial<Record<1 | 2, RubricResult>>;
  speakingGrades: Partial<Record<1 | 2, RubricResult>>;
  gradingErrors: string[];
}

export async function gradeFullAttempt(context: ExamMachineContext): Promise<GradingResult> {
  const pack = loadContentPack(context.contentPackKey);
  const readingScore = scoreObjectiveSection(getReadingItems(context.contentPackKey), Object.values(context.reading.responses));
  const listeningScore = scoreObjectiveSection(getListeningItems(pack), Object.values(context.listening.responses));
  const grammarScore = scoreObjectiveSection(getGrammarItems(context.contentPackKey), Object.values(context.grammar.responses));

  const [w1, w2] = pack.writing.tasks;
  const [s1, s2] = pack.speaking.tasks;

  const [w1Result, w2Result, s1Result, s2Result] = await Promise.allSettled([
    gradeWritingTask(w1.title, w1.prompt, w1.minWords, w1.maxWords, context.writing.texts[1]),
    gradeWritingTask(w2.title, w2.prompt, w2.minWords, w2.maxWords, context.writing.texts[2]),
    gradeSpeakingTask(s1.title, s1.prompt, context.speaking.audioBlobKeyByTask[1]),
    gradeSpeakingTask(s2.title, s2.prompt, context.speaking.audioBlobKeyByTask[2]),
  ]);

  const gradingErrors: string[] = [];
  const writingGrades: Partial<Record<1 | 2, RubricResult>> = {};
  const speakingGrades: Partial<Record<1 | 2, RubricResult>> = {};

  if (w1Result.status === "fulfilled" && w1Result.value) writingGrades[1] = w1Result.value;
  else gradingErrors.push(`Writing Tarea 1: ${w1Result.status === "rejected" ? w1Result.reason : "No hay respuesta escrita para evaluar."}`);

  if (w2Result.status === "fulfilled" && w2Result.value) writingGrades[2] = w2Result.value;
  else gradingErrors.push(`Writing Tarea 2: ${w2Result.status === "rejected" ? w2Result.reason : "No hay respuesta escrita para evaluar."}`);

  if (s1Result.status === "fulfilled" && s1Result.value) speakingGrades[1] = s1Result.value;
  else gradingErrors.push(`Speaking Tarea 1: ${s1Result.status === "rejected" ? s1Result.reason : "No hay grabación disponible para evaluar."}`);

  if (s2Result.status === "fulfilled" && s2Result.value) speakingGrades[2] = s2Result.value;
  else gradingErrors.push(`Speaking Tarea 2: ${s2Result.status === "rejected" ? s2Result.reason : "No hay grabación disponible para evaluar."}`);

  const writingScores = Object.values(writingGrades).map((g) => g!.score);
  const speakingScores = Object.values(speakingGrades).map((g) => g!.score);
  const writingScore = writingScores.length ? averageScore(writingScores) : 0;
  const speakingScore = speakingScores.length ? averageScore(speakingScores) : 0;

  // An unavailable AI grade is not a zero earned by the student. Leave that
  // section out of the provisional overall score and flag it in the report.
  const overallSections = [readingScore, listeningScore, grammarScore];
  if (!gradingErrors.some((error) => error.startsWith("Writing "))) overallSections.push(writingScore);
  if (!gradingErrors.some((error) => error.startsWith("Speaking "))) overallSections.push(speakingScore);
  const overall = averageScore(overallSections);

  return {
    scores: {
      reading: readingScore,
      listening: listeningScore,
      grammar: grammarScore,
      writing: writingScore,
      speaking: speakingScore,
      overall,
      overallBand: scoreToBand(overall).band,
    },
    writingGrades,
    speakingGrades,
    gradingErrors,
  };
}

/** Re-evaluate only responses whose Gemini grade is still missing, preserving completed grades. */
export async function retryMissingGrades(attempt: AttemptRecord, pack: ExamContentPack): Promise<AttemptRecord> {
  const writing = attempt.responses.writing.map((response) => ({ ...response }));
  const speaking = attempt.responses.speaking.map((response) => ({ ...response }));
  const errors: string[] = [];

  await Promise.all([
    ...pack.writing.tasks.map(async (task) => {
      const response = writing.find((item) => item.taskNumber === task.taskNumber);
      if (response?.grading) return;
      if (!response?.text.trim()) { errors.push(`Writing Tarea ${task.taskNumber}: No hay respuesta escrita para evaluar.`); return; }
      try {
        response.grading = (await gradeWritingTask(task.title, task.prompt, task.minWords, task.maxWords, response.text)) ?? undefined;
      } catch (error) {
        errors.push(`Writing Tarea ${task.taskNumber}: ${error instanceof Error ? error.message : "No se pudo calificar."}`);
      }
    }),
    ...pack.speaking.tasks.map(async (task) => {
      const response = speaking.find((item) => item.taskNumber === task.taskNumber);
      if (response?.grading) return;
      if (!response?.audioBlobKey) { errors.push(`Speaking Tarea ${task.taskNumber}: No hay grabación disponible para evaluar.`); return; }
      try {
        const grade = await gradeSpeakingTask(task.title, task.prompt, response.audioBlobKey);
        if (grade) response.grading = grade;
        else errors.push(`Speaking Tarea ${task.taskNumber}: No se encontró el audio guardado en este navegador.`);
      } catch (error) {
        errors.push(`Speaking Tarea ${task.taskNumber}: ${error instanceof Error ? error.message : "No se pudo calificar."}`);
      }
    }),
  ]);

  const writingScores = writing.flatMap((response) => response.grading ? [response.grading.score] : []);
  const speakingScores = speaking.flatMap((response) => response.grading ? [response.grading.score] : []);
  const writingScore = writingScores.length ? averageScore(writingScores) : 0;
  const speakingScore = speakingScores.length ? averageScore(speakingScores) : 0;
  const previous = attempt.scores;
  if (!previous) return attempt;
  const overallSections = [previous.reading, previous.listening, previous.grammar];
  if (!errors.some((error) => error.startsWith("Writing "))) overallSections.push(writingScore);
  if (!errors.some((error) => error.startsWith("Speaking "))) overallSections.push(speakingScore);
  const overall = averageScore(overallSections);

  return {
    ...attempt,
    responses: { ...attempt.responses, writing, speaking },
    gradingErrors: errors,
    scores: { ...previous, writing: writingScore, speaking: speakingScore, overall, overallBand: scoreToBand(overall).band },
  };
}
