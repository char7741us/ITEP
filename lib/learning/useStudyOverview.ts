"use client";

import { useLearningContext } from "@/components/learning/LearningProvider";
import { useActiveProfile } from "@/lib/storage/profileRepo";
import {
  useDailyProgressStore,
  dailyProgressKey,
} from "@/lib/content/daily/progress";
import { useGrammarProgressStore } from "@/lib/grammar-c1/progress";
import { useErrorNotebookStore } from "@/lib/notebook/store";
import { emptyLearningProfile, learningStats } from "./model";
import { learningProfileKey, useLearningStore } from "./store";
import { hasCompleteSkillGrade } from "@/lib/exam/grade-status";

const EMPTY = emptyLearningProfile();
const SKILLS = [
  "grammar",
  "reading",
  "listening",
  "writing",
  "speaking",
] as const;
export const skillNames = {
  grammar: "Grammar",
  reading: "Reading",
  listening: "Listening",
  writing: "Writing",
  speaking: "Speaking",
};

export function useStudyOverview() {
  const { ready, now, attempts: allAttempts } = useLearningContext();
  const student = useActiveProfile();
  const username = student?.username ?? null;
  const profileKey = learningProfileKey(username);
  const learning =
    useLearningStore((state) => state.profiles[profileKey]) ?? EMPTY;
  const daily = useDailyProgressStore((state) => state.days);
  const grammar =
    useGrammarProgressStore((state) => state.daysByProfile[profileKey]) ?? {};
  const entries = useErrorNotebookStore((state) => state.entries).filter(
    (entry) => entry.profileUsername === username,
  );
  const feedback = (
    useErrorNotebookStore((state) => state.productiveFeedback) ?? []
  ).filter((item) => item.profileUsername === username);
  const legacyMastered = useErrorNotebookStore((state) => state.masteredByProfile[profileKey]) ?? 0;
  const masteredTotal = Math.max(legacyMastered, learning.activities.filter((activity) => activity.kind === "mastery").length);
  const attempts = allAttempts.filter(
    (attempt) =>
      (attempt.profileUsername ?? null) === username &&
      attempt.status === "completed",
  );
  const latest = attempts[0];
  const scoredSkills = latest?.scores
    ? SKILLS.filter((skill) => hasCompleteSkillGrade(latest, skill))
    : [];
  const weakest =
    latest?.scores && scoredSkills.length
      ? [...scoredSkills].sort(
          (a, b) => latest.scores![a] - latest.scores![b],
        )[0]
      : entries.length
        ? (entries[0].section.toLowerCase() as (typeof SKILLS)[number])
        : null;
  const nextDaily =
    Array.from({ length: 60 }, (_, index) => index + 1).find(
      (day) => !daily[dailyProgressKey(username, day)]?.completedAt,
    ) ?? 60;
  const nextGrammar =
    Array.from({ length: 20 }, (_, index) => index + 1).find(
      (day) => !grammar[day]?.completedAt,
    ) ?? 20;
  const dailyCompleted = Array.from(
    { length: 60 },
    (_, index) => index + 1,
  ).filter((day) => daily[dailyProgressKey(username, day)]?.completedAt).length;
  const grammarCompleted = Object.values(grammar).filter(
    (day) => day.completedAt,
  ).length;
  const stats = learningStats(learning, now);
  const coachSummary = {
    dailyGoal: learning.dailyGoal,
    todayActions: stats.actionCount,
    streak: stats.streak,
    nextDaily,
    nextGrammar,
    dailyCompleted,
    grammarCompleted,
    weakest: weakest ? skillNames[weakest] : null,
    scores: latest?.scores
      ? Object.fromEntries(
          scoredSkills.map((skill) => [
            skillNames[skill],
            latest.scores![skill],
          ]),
        )
      : {},
    pendingRules: entries
      .slice(0, 5)
      .map((entry) => `${entry.section}: ${entry.failed_rule}`.slice(0, 600)),
    improvements: feedback
      .slice(-2)
      .flatMap((item) =>
        item.improvements
          .slice(0, 2)
          .map((text) => `${item.section}: ${text}`.slice(0, 1500)),
      ),
  };
  return {
    ready,
    now,
    student,
    profileKey,
    learning,
    stats,
    entries,
    feedback,
    attempts,
    weakest,
    nextDaily,
    nextGrammar,
    dailyCompleted,
    grammarCompleted,
    coachSummary,
    masteredTotal,
  };
}
