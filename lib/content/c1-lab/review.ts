import type { DailyProgress } from "../daily/progress";
import type { StructureLesson } from "./types";
import { dateFromKey, dateKey } from "@/lib/learning/model";

export const labKey = (username: string | null, id: string) => `${username ?? "guest"}:lab:v1:${id}`;
export function structureReview(days: Record<string, DailyProgress>, username: string | null, lesson: StructureLesson, today: string) {
  const prefix = `${labKey(username, lesson.id)}:structure:`;
  const rounds = Object.entries(days)
    .filter(([key, value]) => key.startsWith(prefix) && /^\d{4}-\d{2}-\d{2}$/.test(key.slice(prefix.length)) && value.completedAt && value.structureRound)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ day: key.slice(prefix.length), assisted: value.structureRound!.assisted,
      correct: lesson.questions.slice(value.structureRound!.form * 3, value.structureRound!.form * 3 + 3).filter((item, i) => value.answers[`grammar-${i}`] === item.correctIndex).length }));
  let stage = 0;
  for (const round of rounds) stage = round.correct === 3 && !round.assisted ? Math.min(4, stage + 1) : 0;
  const last = rounds.at(-1);
  const dueDate = last ? dateFromKey(last.day) : null;
  if (dueDate) dueDate.setDate(dueDate.getDate() + [1, 1, 3, 7, 14][stage]);
  const due = dueDate ? dateKey(dueDate) : today;
  return { rounds, stage, due, isDue: due <= today, todayDone: last?.day === today, nextForm: (rounds.length % 2) as 0 | 1 };
}
