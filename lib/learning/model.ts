import type { SkillSection } from "@/lib/types/content";

export type ActivityKind =
  | "question"
  | "writing"
  | "speaking"
  | "round"
  | "mastery"
  | "daily"
  | "exam"
  | "focus";
export interface LearningActivity {
  id: string;
  kind: ActivityKind;
  label: string;
  skill?: SkillSection;
  at: string;
  day: string;
  xp: number;
}
export type ActivityInput = Omit<LearningActivity, "at" | "day" | "xp"> & {
  at?: string;
};
export type PetColor = "mint" | "rose" | "lavender";
export type PetAccessory = "none" | "star" | "flower" | "scholar";
export interface LearningProfile {
  activities: LearningActivity[];
  petName: string;
  petColor: PetColor;
  accessory: PetAccessory;
  dailyGoal: 5 | 10 | 15;
}
export const emptyLearningProfile = (): LearningProfile => ({
  activities: [],
  petName: "Mochi",
  petColor: "mint",
  accessory: "none",
  dailyGoal: 5,
});
export const XP: Record<ActivityKind, number> = {
  question: 5,
  writing: 15,
  speaking: 15,
  round: 20,
  mastery: 30,
  daily: 40,
  exam: 80,
  focus: 0,
};
export const LEVELS = [
  { name: "Primer brote", min: 0 },
  { name: "Explorador", min: 100 },
  { name: "Creador de hábitos", min: 300 },
  { name: "Mente curiosa", min: 700 },
  { name: "Constancia en flor", min: 1400 },
];
export const ACCESSORIES: {
  id: PetAccessory;
  label: string;
  xp: number;
  emoji: string;
}[] = [
  { id: "none", label: "Al natural", xp: 0, emoji: "🌱" },
  { id: "star", label: "Estrella curiosa", xp: 100, emoji: "⭐" },
  { id: "flower", label: "Flor de constancia", xp: 300, emoji: "🌸" },
  { id: "scholar", label: "Birrete explorador", xp: 700, emoji: "🎓" },
];

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dateFromKey(day: string): Date {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date);
}
export function practiceActions(activities: LearningActivity[]): number {
  return activities.filter((activity) =>
    ["question", "writing", "speaking"].includes(activity.kind),
  ).length;
}
export function learningStats(profile: LearningProfile, now: Date) {
  const todayKey = dateKey(now);
  const today = profile.activities.filter(
    (activity) => activity.day === todayKey,
  );
  const days = [
    ...new Set(
      profile.activities
        .filter((activity) => activity.kind !== "focus")
        .map((activity) => activity.day),
    ),
  ].sort();
  const studied = new Set(days);
  let offset = studied.has(todayKey) ? 0 : 1;
  let streak = 0;
  while (
    studied.has(
      dateKey(
        new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset),
      ),
    )
  ) {
    streak += 1;
    offset += 1;
  }
  let bestStreak = 0;
  let run = 0;
  let previous = "";
  for (const day of days) {
    const date = dateFromKey(day);
    const yesterday = dateKey(
      new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1),
    );
    run = previous === yesterday ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    previous = day;
  }
  const xp = profile.activities.reduce(
    (total, activity) => total + activity.xp,
    0,
  );
  const levelIndex = Math.max(
    0,
    LEVELS.findLastIndex((level) => xp >= level.min),
  );
  const nextLevel = LEVELS[levelIndex + 1];
  const levelProgress = nextLevel
    ? (xp - LEVELS[levelIndex].min) / (nextLevel.min - LEVELS[levelIndex].min)
    : 1;
  const actionCount = practiceActions(today);
  return {
    today,
    days,
    streak,
    bestStreak,
    xp,
    levelIndex,
    level: LEVELS[levelIndex],
    nextLevel,
    levelProgress,
    actionCount,
    goalMet: actionCount >= profile.dailyGoal,
  };
}

export function learningBadges(profile: LearningProfile, now: Date) {
  const stats = learningStats(profile, now);
  const count = (kind: ActivityKind) =>
    profile.activities.filter((activity) => activity.kind === kind).length;
  const skills = new Set(
    profile.activities.map((activity) => activity.skill).filter(Boolean),
  );
  return [
    {
      id: "first",
      emoji: "🌱",
      title: "Primer paso",
      detail: "Haz tu primera actividad",
      earned: stats.days.length > 0,
    },
    {
      id: "three",
      emoji: "🔥",
      title: "Una pequeña racha",
      detail: "Practica 3 días seguidos",
      earned: stats.bestStreak >= 3,
    },
    {
      id: "seven",
      emoji: "🌈",
      title: "Semana en flor",
      detail: "Practica 7 días seguidos",
      earned: stats.bestStreak >= 7,
    },
    {
      id: "questions",
      emoji: "🔎",
      title: "Mente curiosa",
      detail: "Responde 25 preguntas",
      earned: count("question") >= 25,
    },
    {
      id: "grammar",
      emoji: "🧩",
      title: "Detective Grammar",
      detail: "Completa 5 rondas de Grammar",
      earned:
        profile.activities.filter(
          (activity) =>
            activity.kind === "round" && activity.skill === "grammar",
        ).length >= 5,
    },
    {
      id: "mastery",
      emoji: "🌸",
      title: "Aprender del error",
      detail: "Supera 3 temas del Cuaderno",
      earned: count("mastery") >= 3,
    },
    {
      id: "daily",
      emoji: "🗓️",
      title: "Vuelvo por mí",
      detail: "Completa 3 sesiones diarias",
      earned: count("daily") >= 3,
    },
    {
      id: "balanced",
      emoji: "🦋",
      title: "Cinco alas",
      detail: "Practica las cinco habilidades",
      earned: skills.size >= 5,
    },
  ];
}
