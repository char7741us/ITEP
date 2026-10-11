"use client";

import { MessageCircle } from "lucide-react";
import { useLearningStore } from "@/lib/learning/store";

export function CoachHelpButton({
  skill,
  question,
  explanation,
}: {
  skill: string;
  question: string;
  explanation: string;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        useLearningStore.getState().openCoach({ skill, question, explanation })
      }
      className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-primary/15 bg-white/70 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 dark:bg-white/5"
    >
      <MessageCircle className="h-4 w-4" /> Entenderlo con mi coach
    </button>
  );
}
