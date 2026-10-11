"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FailedTopic, NotebookSection } from "./failedRules";
import type { RubricResult } from "@/lib/types/attempt";

export interface ErrorNotebookEntry {
  id: string;
  section: NotebookSection;
  failed_rule: string;
  streak: number;
  profileUsername: string | null;
}

export interface MasteredTopic {
  id: string;
  section: NotebookSection;
  failed_rule: string;
  profileUsername: string | null;
  masteredAt: string;
}

export interface ProductiveFeedback {
  id: string;
  section: "Writing" | "Speaking";
  taskNumber: 1 | 2;
  score: number;
  rationale: string;
  improvements: string[];
  profileUsername: string | null;
  recordedAt: string;
}

export function notebookProfileKey(username: string | null): string {
  return username === null ? "guest" : `profile:${username}`;
}

export function localStudyDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function consecutiveStudyDays(days: string[], today: Date): number {
  const studied = new Set(days);
  let offset = studied.has(localStudyDate(today)) ? 0 : 1;
  let streak = 0;
  while (studied.has(localStudyDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)))) {
    streak += 1;
    offset += 1;
  }
  return streak;
}

interface ErrorNotebookState {
  entries: ErrorNotebookEntry[];
  processedAttemptIds: string[];
  studyDaysByProfile: Record<string, string[]>;
  masteredByProfile: Record<string, number>;
  masteredTopics: MasteredTopic[];
  productiveFeedback: ProductiveFeedback[];
  recordAttempt: (attemptId: string, profileUsername: string | null, topics: FailedTopic[]) => void;
  recordProductiveFeedback: (attemptId: string, profileUsername: string | null, section: "Writing" | "Speaking", taskNumber: 1 | 2, grading: RubricResult) => void;
  markStudyDay: (profileUsername: string | null, date: Date) => void;
  answer: (id: string, correct: boolean) => boolean;
}

export const useErrorNotebookStore = create<ErrorNotebookState>()(
  persist(
    (set, get) => ({
      entries: [],
      processedAttemptIds: [],
      studyDaysByProfile: {},
      masteredByProfile: {},
      masteredTopics: [],
      productiveFeedback: [],
      recordProductiveFeedback: (attemptId, profileUsername, section, taskNumber, grading) => {
        const id = `${attemptId}:${section}:${taskNumber}`;
        set((state) => {
          const existing = (state.productiveFeedback ?? []).find((item) => item.id === id);
          if (grading.score >= 4.5 && !existing) return state;
          if (existing && existing.score === grading.score && existing.rationale === grading.rationale &&
              JSON.stringify(existing.improvements) === JSON.stringify(grading.improvements ?? [])) return state;
          const others = (state.productiveFeedback ?? []).filter((item) => item.id !== id);
          if (grading.score >= 4.5) return { productiveFeedback: others };
          return { productiveFeedback: [...others, {
            id, section, taskNumber, score: grading.score, rationale: grading.rationale ?? "Revisa esta respuesta y vuelve a intentarlo.",
            improvements: grading.improvements ?? [], profileUsername, recordedAt: new Date().toISOString(),
          }] };
        });
      },
      markStudyDay: (profileUsername, date) => {
        const key = notebookProfileKey(profileUsername);
        const day = localStudyDate(date);
        set((state) => {
          const existing = state.studyDaysByProfile[key] ?? [];
          if (existing.includes(day)) return state;
          return { studyDaysByProfile: { ...state.studyDaysByProfile, [key]: [...existing, day] } };
        });
      },
      recordAttempt: (attemptId, profileUsername, topics) => {
        if (get().processedAttemptIds.includes(attemptId)) return;
        set((state) => {
          const entries = [...state.entries];
          const masteredTopics = [...(state.masteredTopics ?? [])];
          for (const topic of topics) {
            const masteredIndex = masteredTopics.findIndex((saved) =>
              saved.profileUsername === profileUsername && saved.section === topic.section && saved.failed_rule === topic.failed_rule
            );
            if (masteredIndex >= 0) masteredTopics.splice(masteredIndex, 1);
            const existingIndex = entries.findIndex(
              (entry) =>
                entry.profileUsername === profileUsername &&
                entry.section === topic.section &&
                entry.failed_rule === topic.failed_rule
            );
            if (existingIndex >= 0) {
              entries[existingIndex] = { ...entries[existingIndex], streak: 0 };
            } else {
              entries.push({
                id: crypto.randomUUID(),
                section: topic.section,
                failed_rule: topic.failed_rule,
                streak: 0,
                profileUsername,
              });
            }
          }
          return {
            entries,
            masteredTopics,
            processedAttemptIds: [...state.processedAttemptIds, attemptId],
          };
        });
      },
      answer: (id, correct) => {
        const entry = get().entries.find((item) => item.id === id);
        if (!entry) return false;
        const streak = correct ? entry.streak + 1 : 0;
        const mastered = streak >= 3;
        const profileKey = notebookProfileKey(entry.profileUsername);
        set((state) => ({
          entries:
            mastered
              ? state.entries.filter((item) => item.id !== id)
              : state.entries.map((item) => (item.id === id ? { ...item, streak } : item)),
          masteredByProfile: mastered
            ? { ...state.masteredByProfile, [profileKey]: (state.masteredByProfile[profileKey] ?? 0) + 1 }
            : state.masteredByProfile,
          masteredTopics: mastered
            ? [...(state.masteredTopics ?? []), {
                id: entry.id,
                section: entry.section,
                failed_rule: entry.failed_rule,
                profileUsername: entry.profileUsername,
                masteredAt: new Date().toISOString(),
              }]
            : state.masteredTopics,
        }));
        return mastered;
      },
    }),
    {
      name: "itep-simulator:error-notebook",
      version: 3,
      migrate: (persisted) => {
        const old = persisted as Partial<ErrorNotebookState>;
        return { ...old, masteredTopics: old.masteredTopics ?? [], productiveFeedback: old.productiveFeedback ?? [] } as ErrorNotebookState;
      },
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        entries: state.entries,
        processedAttemptIds: state.processedAttemptIds,
        studyDaysByProfile: state.studyDaysByProfile,
        masteredByProfile: state.masteredByProfile,
        masteredTopics: state.masteredTopics,
        productiveFeedback: state.productiveFeedback,
      }),
    }
  )
);

export async function recordCompletedAttempt(
  attemptId: string,
  profileUsername: string | null,
  topics: FailedTopic[]
): Promise<void> {
  if (!useErrorNotebookStore.persist.hasHydrated()) {
    await useErrorNotebookStore.persist.rehydrate();
  }
  useErrorNotebookStore.getState().recordAttempt(attemptId, profileUsername, topics);
}

export async function saveProductiveFeedback(
  attemptId: string,
  profileUsername: string | null,
  section: "Writing" | "Speaking",
  taskNumber: 1 | 2,
  grading: RubricResult
): Promise<void> {
  if (!useErrorNotebookStore.persist.hasHydrated()) {
    await useErrorNotebookStore.persist.rehydrate();
  }
  useErrorNotebookStore.getState().recordProductiveFeedback(attemptId, profileUsername, section, taskNumber, grading);
}
