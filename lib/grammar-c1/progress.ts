"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface TopicProgress {
  completedIds: string[];
  attempts: number;
  rounds: number;
}

interface GrammarProgressState {
  byProfile: Record<string, Record<string, TopicProgress>>;
  startRound: (profileKey: string, topicId: string) => number;
  recordAnswer: (profileKey: string, topicId: string, questionId: string, correct: boolean) => void;
}

const emptyProgress = (): TopicProgress => ({ completedIds: [], attempts: 0, rounds: 0 });

export const useGrammarProgressStore = create<GrammarProgressState>()(
  persist(
    (set, get) => ({
      byProfile: {},
      startRound: (profileKey, topicId) => {
        const current = get().byProfile[profileKey]?.[topicId] ?? emptyProgress();
        set((state) => ({
          byProfile: {
            ...state.byProfile,
            [profileKey]: {
              ...state.byProfile[profileKey],
              [topicId]: { ...current, rounds: current.rounds + 1 },
            },
          },
        }));
        return current.rounds;
      },
      recordAnswer: (profileKey, topicId, questionId, correct) => {
        set((state) => {
          const current = state.byProfile[profileKey]?.[topicId] ?? emptyProgress();
          return {
            byProfile: {
              ...state.byProfile,
              [profileKey]: {
                ...state.byProfile[profileKey],
                [topicId]: {
                  ...current,
                  attempts: current.attempts + 1,
                  completedIds: correct && !current.completedIds.includes(questionId)
                    ? [...current.completedIds, questionId]
                    : current.completedIds,
                },
              },
            },
          };
        });
      },
    }),
    {
      name: "itep-simulator:grammar-c1-progress",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ byProfile: state.byProfile }),
    }
  )
);
