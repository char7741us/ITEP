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

interface ErrorNotebookState {
  entries: ErrorNotebookEntry[];
  processedAttemptIds: string[];
  recordAttempt: (attemptId: string, profileUsername: string | null, topics: FailedTopic[]) => void;
  answer: (id: string, correct: boolean) => boolean;
}

export const useErrorNotebookStore = create<ErrorNotebookState>()(
  persist(
    (set, get) => ({
      entries: [],
      processedAttemptIds: [],
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
        set((state) => ({
          entries:
            streak >= 3
              ? state.entries.filter((item) => item.id !== id)
              : state.entries.map((item) => (item.id === id ? { ...item, streak } : item)),
        }));
        return streak >= 3;
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
