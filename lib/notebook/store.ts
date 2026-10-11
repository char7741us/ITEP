"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FailedTopic, NotebookSection } from "./failedRules";

export interface ErrorNotebookEntry {
  id: string;
  section: NotebookSection;
  failed_rule: string;
  streak: number;
  profileUsername: string | null;
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
  recordAttempt: (attemptId: string, profileUsername: string | null, topics: FailedTopic[]) => void;
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
          for (const topic of topics) {
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
        }));
        return mastered;
      },
    }),
    {
      name: "itep-simulator:error-notebook",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        entries: state.entries,
        processedAttemptIds: state.processedAttemptIds,
        studyDaysByProfile: state.studyDaysByProfile,
        masteredByProfile: state.masteredByProfile,
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
