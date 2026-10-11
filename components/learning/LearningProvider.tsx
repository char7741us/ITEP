"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { listAttempts } from "@/lib/storage/attemptsRepo";
import type { AttemptRecord } from "@/lib/types/attempt";
import { useDailyProgressStore } from "@/lib/content/daily/progress";
import { useGrammarProgressStore } from "@/lib/grammar-c1/progress";
import { useErrorNotebookStore } from "@/lib/notebook/store";
import {
  hydrateLearning,
  learningProfileKey,
  useLearningStore,
} from "@/lib/learning/store";
import { useFocusStore } from "@/lib/learning/focus";
import type { SkillSection } from "@/lib/types/content";

const LearningContext = createContext({
  ready: false,
  now: new Date(2026, 0, 1),
  attempts: [] as AttemptRecord[],
});
export const useLearningContext = () => useContext(LearningContext);

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(new Date(2026, 0, 1));
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  useEffect(() => {
    const timer = setInterval(() => useFocusStore.getState().tick(), 500);
    const pause = () => {
      if (document.hidden && useFocusStore.getState().running)
        useFocusStore
          .getState()
          .pause("Pausé tu enfoque al salir. Retómalo cuando estés lista.");
    };
    window.addEventListener("pagehide", pause);
    document.addEventListener("visibilitychange", pause);
    return () => {
      clearInterval(timer);
      window.removeEventListener("pagehide", pause);
      document.removeEventListener("visibilitychange", pause);
    };
  }, []);
  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const saved = await listAttempts();
        if (active) setAttempts(saved);
      } catch (error) {
        console.error("No se pudo cargar el historial para el coach:", error);
      }
    }
    async function initialize() {
      try {
        await Promise.all([
          hydrateLearning(),
          useDailyProgressStore.persist.hasHydrated()
            ? undefined
            : useDailyProgressStore.persist.rehydrate(),
          useGrammarProgressStore.persist.hasHydrated()
            ? undefined
            : useGrammarProgressStore.persist.rehydrate(),
          useErrorNotebookStore.persist.hasHydrated()
            ? undefined
            : useErrorNotebookStore.persist.rehydrate(),
        ]);
        const track = useLearningStore.getState().track;
        for (const [key, day] of Object.entries(
          useDailyProgressStore.getState().days,
        )) {
          if (!day.completedAt) continue;
          const separator = key.lastIndexOf(":");
          const username = key.slice(0, separator);
          track(
            learningProfileKey(username === "guest" ? null : username),
            {
              id: `daily:${key}:complete`,
              kind: "daily",
              label: `Día ${key.slice(separator + 1)} completado`,
              at: day.completedAt,
            },
            true,
          );
        }
        for (const [profileKey, days] of Object.entries(
          useGrammarProgressStore.getState().daysByProfile,
        )) {
          for (const [day, progress] of Object.entries(days)) {
            if (progress.completedAt)
              track(
                profileKey,
                {
                  id: `grammar-history:${day}`,
                  kind: "round",
                  skill: "grammar",
                  label: `Día ${day} de Grammar aprobado`,
                  at: progress.completedAt,
                },
                true,
              );
          }
        }
        for (const topic of useErrorNotebookStore.getState().masteredTopics ??
          []) {
          track(
            learningProfileKey(topic.profileUsername),
            {
              id: `mastery:${topic.id}`,
              kind: "mastery",
              skill: topic.section.toLowerCase() as SkillSection,
              label: `${topic.section} · tema superado`,
              at: topic.masteredAt,
            },
            true,
          );
        }
        const saved = await listAttempts();
        for (const attempt of saved) {
          if (attempt.status === "completed" && attempt.completedAt)
            track(
              learningProfileKey(attempt.profileUsername ?? null),
              {
                id: `exam:${attempt.id}:complete`,
                kind: "exam",
                label: "Simulacro completado",
                at: attempt.completedAt,
              },
              true,
            );
        }
        if (active) setAttempts(saved);
      } catch (error) {
        console.error("No se pudo recuperar todo el avance de estudio:", error);
      } finally {
        if (active) {
          setNow(new Date());
          setReady(true);
        }
      }
    }
    void initialize();
    const tick = setInterval(() => {
      if (active) setNow(new Date());
    }, 60000);
    window.addEventListener("itep-attempt-saved", refresh);
    return () => {
      active = false;
      clearInterval(tick);
      window.removeEventListener("itep-attempt-saved", refresh);
    };
  }, []);
  return (
    <LearningContext.Provider value={{ ready, now, attempts }}>
      {children}
    </LearningContext.Provider>
  );
}
