"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { trackedStorage, reportStorageProblem } from "@/lib/storage/health";
import {
  ACCESSORIES,
  dateKey,
  emptyLearningProfile,
  learningStats,
  XP,
} from "./model";
import type {
  ActivityInput,
  LearningProfile,
  PetAccessory,
  PetColor,
  RecallRecord,
} from "./model";

export interface CoachContext {
  skill?: string;
  question: string;
  explanation?: string;
}
interface LearningState {
  profiles: Record<string, LearningProfile>;
  coachOpen: boolean;
  coachContext: CoachContext | null;
  celebration: { id: string; profileKey: string; message: string } | null;
  track: (profileKey: string, input: ActivityInput, silent?: boolean) => void;
  customize: (
    profileKey: string,
    settings: Partial<
      Pick<LearningProfile, "petName" | "petColor" | "dailyGoal" | "studyPlan">
    >,
  ) => void;
  wear: (profileKey: string, accessory: PetAccessory) => void;
  openCoach: (context?: CoachContext) => void;
  closeCoach: () => void;
  clearCelebration: () => void;
  saveRecall: (profileKey: string, day: string, record: RecallRecord) => void;
  reflectRecall: (profileKey: string, day: string, reflection: string) => void;
}

export const learningProfileKey = (username: string | null) =>
  username === null ? "guest" : `profile:${username}`;
export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      profiles: {},
      coachOpen: false,
      coachContext: null,
      celebration: null,
      track: (profileKey, input, silent = false) =>
        set((state) => {
          const profile = state.profiles[profileKey] ?? emptyLearningProfile();
          if (profile.activities.some((activity) => activity.id === input.id))
            return state;
          const at = input.at ?? new Date().toISOString();
          const date = new Date(at);
          if (!Number.isFinite(date.getTime())) return state;
          const activity = {
            ...input,
            at,
            day: dateKey(date),
            xp: XP[input.kind],
          };
          const updated = {
            ...profile,
            activities: [...profile.activities, activity],
          };
          const before = learningStats(profile, date);
          const after = learningStats(updated, date);
          let message: string | null = null;
          if (!before.goalMet && after.goalMet)
            message = `¡Meta de hoy cumplida! ${after.actionCount} pasos que ya son tuyos.`;
          else if (after.levelIndex > before.levelIndex)
            message = `¡Tu compañero creció! Nivel ${after.levelIndex + 1}: ${after.level.name}.`;
          else if (input.kind === "mastery")
            message = `¡Una nueva flor! Superaste un tema y ganaste ${activity.xp} destellos.`;
          else if (["daily", "exam", "round"].includes(input.kind))
            message = `${input.label} · +${activity.xp} destellos. Tu esfuerzo cuenta.`;
          return {
            profiles: { ...state.profiles, [profileKey]: updated },
            ...(!silent && message
              ? { celebration: { id: input.id, profileKey, message } }
              : {}),
          };
        }),
      customize: (profileKey, settings) =>
        set((state) => {
          const profile = state.profiles[profileKey] ?? emptyLearningProfile();
          const color: PetColor = settings.petColor ?? profile.petColor;
          return {
            profiles: {
              ...state.profiles,
              [profileKey]: {
                ...profile,
                ...settings,
                petName:
                  settings.petName?.trim().slice(0, 24) || profile.petName,
                petColor: color,
              },
            },
          };
        }),
      wear: (profileKey, accessory) =>
        set((state) => {
          const profile = state.profiles[profileKey] ?? emptyLearningProfile();
          const item = ACCESSORIES.find(
            (candidate) => candidate.id === accessory,
          );
          if (!item || learningStats(profile, new Date()).xp < item.xp)
            return state;
          return {
            profiles: {
              ...state.profiles,
              [profileKey]: { ...profile, accessory },
            },
          };
        }),
      openCoach: (context) =>
        set({ coachOpen: true, coachContext: context ?? null }),
      closeCoach: () => set({ coachOpen: false, coachContext: null }),
      clearCelebration: () => set({ celebration: null }),
      saveRecall: (profileKey, day, record) => set((state) => {
        const profile = state.profiles[profileKey] ?? emptyLearningProfile();
        if (profile.recalls?.[day]) return state;
        return { profiles: { ...state.profiles, [profileKey]: { ...profile, recalls: { ...profile.recalls, [day]: { ...record, prediction: record.prediction.slice(0, 500), reflection: record.reflection.slice(0, 600) } } } } };
      }),
      reflectRecall: (profileKey, day, reflection) => set((state) => {
        const profile = state.profiles[profileKey];
        const record = profile?.recalls?.[day];
        if (!record) return state;
        return { profiles: { ...state.profiles, [profileKey]: { ...profile, recalls: { ...profile.recalls, [day]: { ...record, reflection: reflection.slice(0, 600) } } } } };
      }),
    }),
    {
      name: "itep-simulator:learning-companion",
      version: 1,
      storage: createJSONStorage(() => trackedStorage),
      onRehydrateStorage: () => (_state, error) => { if (error) reportStorageProblem(); },
      skipHydration: true,
      partialize: (state) => ({ profiles: state.profiles }),
    },
  ),
);

let hydration: Promise<void> | null = null;
export async function hydrateLearning(): Promise<void> {
  if (useLearningStore.persist.hasHydrated()) return;
  if (!hydration)
    hydration = Promise.resolve(useLearningStore.persist.rehydrate())
      .then(() => {})
      .finally(() => {
        hydration = null;
      });
  await hydration;
}

export async function recordLearningActivity(
  username: string | null,
  input: ActivityInput,
  silent = false,
): Promise<void> {
  try {
    await hydrateLearning();
    useLearningStore
      .getState()
      .track(learningProfileKey(username), input, silent);
  } catch (error) {
    console.error("No se pudo guardar el avance del compañero:", error);
  }
}
