"use client";

import { loadContentPack } from "@/lib/content/loader";
import { getSpeakingAudio } from "@/lib/storage/attemptsRepo";
import { getReadingItems, getGrammarItems } from "./items";
import { getListeningItems } from "./listening";
import { scoreObjectiveSection, averageScore } from "./scoring";
import { scoreToBand } from "./cefr";
import type { ExamMachineContext } from "./machine.types";
import type { AttemptScores, RubricResult } from "@/lib/types/attempt";

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function fetchGrade(url: string, body: unknown): Promise<RubricResult> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error ?? `Error ${res.status} al calificar`);
  }
  return res.json();
}

async function gradeWritingTask(
  taskTitle: string,
  prompt: string,
  minWords: number,
  maxWords: number,
  studentText: string
): Promise<RubricResult | null> {
  if (!studentText.trim()) return null;
  return fetchGrade("/api/grade/writing", { taskTitle, prompt, minWords, maxWords, studentText });
}

async function gradeSpeakingTask(taskTitle: string, prompt: string, blobKey: string | undefined): Promise<RubricResult | null> {
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
  else if (w1Result.status === "rejected") gradingErrors.push(`Writing Tarea 1: ${w1Result.reason}`);

  if (w2Result.status === "fulfilled" && w2Result.value) writingGrades[2] = w2Result.value;
  else if (w2Result.status === "rejected") gradingErrors.push(`Writing Tarea 2: ${w2Result.reason}`);

  if (s1Result.status === "fulfilled" && s1Result.value) speakingGrades[1] = s1Result.value;
  else if (s1Result.status === "rejected") gradingErrors.push(`Speaking Tarea 1: ${s1Result.reason}`);

  if (s2Result.status === "fulfilled" && s2Result.value) speakingGrades[2] = s2Result.value;
  else if (s2Result.status === "rejected") gradingErrors.push(`Speaking Tarea 2: ${s2Result.reason}`);

  const writingScores = Object.values(writingGrades).map((g) => g!.score);
  const speakingScores = Object.values(speakingGrades).map((g) => g!.score);
  const writingScore = writingScores.length ? averageScore(writingScores) : 0;
  const speakingScore = speakingScores.length ? averageScore(speakingScores) : 0;

  const overall = averageScore([readingScore, listeningScore, grammarScore, writingScore, speakingScore]);

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
