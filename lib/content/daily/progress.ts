"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RubricResult } from "@/lib/types/attempt";

export interface DailyProgress {
  answers: Record<string, number>;
  writingText: string;
  writingGrade?: RubricResult;
  speakingAudioKey?: string;
  speakingPracticed?: boolean;
  speakingGrade?: RubricResult;
  completedAt?: string;
}

interface DailyProgressState {
  days: Record<string, DailyProgress>;
  answer: (key: string, questionId: string, choice: number) => void;
  setWriting: (key: string, value: string) => void;
  setWritingGrade: (key: string, grade: RubricResult) => void;
  setSpeakingAudio: (key: string, audioKey: string) => void;
  markSpeakingPracticed: (key: string) => void;
  setSpeakingGrade: (key: string, grade: RubricResult) => void;
  complete: (key: string) => void;
}

const empty: DailyProgress = { answers: {}, writingText: "" };

export function dailyProgressKey(username: string | null, day: number): string {
  return `${username ?? "guest"}:${day}`;
}

export const useDailyProgressStore = create<DailyProgressState>()(
  persist(
    (set) => ({
      days: {},
      answer: (key, questionId, choice) => set((state) => {
        const current = state.days[key] ?? empty;
        if (current.answers[questionId] !== undefined || current.completedAt) return state;
        return { days: { ...state.days, [key]: { ...current, answers: { ...current.answers, [questionId]: choice } } } };
      }),
      setWriting: (key, value) => set((state) => {
        const current = state.days[key] ?? empty;
        if (current.completedAt) return state;
        return { days: { ...state.days, [key]: { ...current, writingText: value, writingGrade: undefined } } };
      }),
      setWritingGrade: (key, grade) => set((state) => {
        const current = state.days[key] ?? empty;
        return { days: { ...state.days, [key]: { ...current, writingGrade: grade } } };
      }),
      setSpeakingAudio: (key, audioKey) => set((state) => {
        const current = state.days[key] ?? empty;
        return { days: { ...state.days, [key]: { ...current, speakingAudioKey: audioKey, speakingPracticed: true, speakingGrade: undefined } } };
      }),
      markSpeakingPracticed: (key) => set((state) => {
        const current = state.days[key] ?? empty;
        return { days: { ...state.days, [key]: { ...current, speakingPracticed: true } } };
      }),
      setSpeakingGrade: (key, grade) => set((state) => {
        const current = state.days[key] ?? empty;
        return { days: { ...state.days, [key]: { ...current, speakingGrade: grade } } };
      }),
      complete: (key) => set((state) => {
        const current = state.days[key] ?? empty;
        if (current.completedAt) return state;
        return { days: { ...state.days, [key]: { ...current, completedAt: new Date().toISOString() } } };
      }),
    }),
    {
      name: "itep-simulator:daily-progress",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ days: state.days }),
    }
  )
);
