import type { DailySession } from "../daily/schema";

export type LabQuestion = DailySession["grammar"][number];
export interface StructureLesson {
  id: string;
  title: string;
  purpose: string;
  timeline: string[];
  rule: string;
  contrast: [string, string];
  retrieval: string;
  model: string;
  speakingFrame: string;
  questions: LabQuestion[];
}
export interface LabModule {
  id: string;
  title: string;
  lesson: StructureLesson;
  reading: DailySession["reading"];
  listening: DailySession["listening"];
  speaking: [string, string, string, string];
  writing: [string, string];
}
/** First choice is authored as the key, then rotated deterministically. */
export function q(prompt: string, correct: string, distractors: [string, string, string], explanation: string, offset = 0): LabQuestion {
  const choices = [correct, ...distractors];
  if (prompt.startsWith("Identify the ONE")) {
    const marked = [...prompt.matchAll(/\[([ABCD])\]([A-Za-z-]+)/g)].map((match) => match[2]);
    if (marked.length !== 4 || marked.some((word) => !choices.includes(word)) || !marked.includes(correct)) throw new Error(`Invalid single-word exercise: ${prompt}`);
    return { prompt, choices: marked as LabQuestion["choices"], correctIndex: marked.indexOf(correct), explanation };
  }
  const shift = ((offset % 4) + 4) % 4;
  return { prompt, choices: choices.map((_, i) => choices[(i + shift) % 4]) as LabQuestion["choices"], correctIndex: (4 - shift) % 4, explanation };
}
