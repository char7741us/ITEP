"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface TopicProgress {
  completedIds: string[];
  attempts: number;
  rounds: number;
}

export interface DayProgress {
  attempts: number;
  bestCorrect: number;
  total: number;
  completedAt?: string;
}

interface GrammarProgressState {
  byProfile: Record<string, Record<string, TopicProgress>>;
  daysByProfile: Record<string, Record<number, DayProgress>>;
  startRound: (profileKey: string, topicId: string) => number;
  recordAnswer: (profileKey: string, topicId: string, questionId: string, correct: boolean) => void;
  recordDayResult: (profileKey: string, day: number, correct: number, total: number) => void;
}

const emptyProgress = (): TopicProgress => ({ completedIds: [], attempts: 0, rounds: 0 });

export const useGrammarProgressStore = create<GrammarProgressState>()(
  persist(
    (set, get) => ({
      byProfile: {},
      daysByProfile: {},
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
      recordDayResult: (profileKey, day, correct, total) => {
        set((state) => {
          const existing = state.daysByProfile[profileKey]?.[day];
          const passed = correct >= Math.ceil(total * 0.8);
          return {
            daysByProfile: {
              ...state.daysByProfile,
              [profileKey]: {
                ...state.daysByProfile[profileKey],
                [day]: {
                  attempts: (existing?.attempts ?? 0) + 1,
                  bestCorrect: existing?.total === total ? Math.max(existing.bestCorrect, correct) : correct,
                  total,
                  completedAt: existing?.completedAt ?? (passed ? new Date().toISOString() : undefined),
                },
              },
            },
          };
        });
      },
    }),
    {
      name: "itep-simulator:grammar-c1-progress",
      version: 2,
      migrate: (persisted) => {
        const old = persisted as Partial<GrammarProgressState>;
        return { ...old, daysByProfile: old.daysByProfile ?? {} } as GrammarProgressState;
      },
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ byProfile: state.byProfile, daysByProfile: state.daysByProfile }),
    }
  )
);
