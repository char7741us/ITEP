"use client";

import Link from "next/link";
import { Flame, Sparkles, MessageCircle } from "lucide-react";
import { useStudyOverview } from "@/lib/learning/useStudyOverview";
import { useLearningStore } from "@/lib/learning/store";
import { StudyPet } from "./StudyPet";

export function StudyStatus() {
  const { ready, learning, stats } = useStudyOverview();
  return (
    <aside
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-primary/10 bg-white/75 px-3 py-2 text-xs"
      aria-label="Tu compañero y avance de hoy"
    >
      <Link
        href="/"
        className="flex items-center gap-1 font-semibold hover:underline"
      >
        <StudyPet
          color={learning.petColor}
          accessory={learning.accessory}
          happy={stats.goalMet}
          className="h-12 w-14"
        />
        <span>{learning.petName} te acompaña</span>
      </Link>
      <span className="inline-flex items-center gap-1">
        <Flame size={13} />
        {ready ? stats.streak : "…"} {stats.streak === 1 ? "día" : "días"}
      </span>
      <span className="inline-flex items-center gap-1">
        <Sparkles size={13} />
        Hoy: {ready ? stats.actionCount : "…"}/{learning.dailyGoal} pasos{" "}
        {stats.goalMet && "✓"}
      </span>
      <button
        onClick={() => useLearningStore.getState().openCoach()}
        className="ml-auto inline-flex items-center gap-1 rounded-full bg-muted px-3 py-2 font-semibold hover:bg-secondary/50"
      >
        <MessageCircle size={13} />
        Pedir una pista
      </button>
    </aside>
  );
}
