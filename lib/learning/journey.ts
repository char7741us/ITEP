import { dateKey, dateFromKey, type LearningProfile, type StudyPlan } from "./model";
import type { SkillSection } from "@/lib/types/content";

export const DEFAULT_PLAN: StudyPlan = { weeklyDays: 3, focus: "balanced" };
export const JOURNEY_SKILLS: SkillSection[] = ["grammar", "reading", "listening", "writing", "speaking"];

export function weeklyJourney(profile: LearningProfile, now: Date) {
  const today = dateKey(now);
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() + 6) % 7);
  const start = dateKey(monday);
  const days = Array.from({ length: 7 }, (_, index) => dateKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index)));
  const actions = profile.activities.filter((item) => item.day >= start && item.day <= today && ["question", "writing", "speaking"].includes(item.kind));
  const practicedDays = new Set(actions.map((item) => item.day));
  const skills = JOURNEY_SKILLS.map((skill) => ({ skill, count: actions.filter((item) => item.skill === skill).length }));
  const practicedSkills = skills.filter((item) => item.count > 0).length;
  const previousStart = dateKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() - 7));
  const previousDays = new Set(profile.activities.filter((item) => item.day >= previousStart && item.day < start && ["question", "writing", "speaking"].includes(item.kind)).map((item) => item.day)).size;
  return { start, days, practicedDays, skills, practicedSkills, previousDays, actionCount: actions.length };
}

export function daysUntilExam(targetDate: string | undefined, now: Date): number | null {
  if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) return null;
  const target = dateFromKey(targetDate);
  if (dateKey(target) !== targetDate) return null;
  // Calendar-day distance, unaffected by daylight-saving transitions.
  return Math.round((Date.UTC(target.getFullYear(), target.getMonth(), target.getDate()) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86_400_000);
}

/** Repeating a coach/bank question on the same day doesn't generate more points. */
export function questionFingerprint(question: string, options: readonly string[]): string {
  const text = JSON.stringify([question.trim().toLowerCase(), options.map((option) => option.trim().toLowerCase()).sort()]);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  return (hash >>> 0).toString(36);
}
