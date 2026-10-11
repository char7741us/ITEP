"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Sparkles, Pause, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLearningStore } from "@/lib/learning/store";
import { useStudyOverview } from "@/lib/learning/useStudyOverview";
import { CoachPanel } from "./CoachPanel";
import { StudyPet } from "./StudyPet";
import { useFocusStore } from "@/lib/learning/focus";

export function LearningOverlay() {
  const pathname = usePathname();
  const { learning, profileKey, ready, stats, student } = useStudyOverview();
  const focus = useFocusStore();
  const open = useLearningStore((state) => state.coachOpen);
  const context = useLearningStore((state) => state.coachContext);
  const celebration = useLearningStore((state) => state.celebration);
  const noHelp = pathname.startsWith("/exam/run/");
  const previousProfile = useRef(profileKey);
  useEffect(() => {
    if (previousProfile.current !== profileKey) {
      useLearningStore.getState().closeCoach();
      useFocusStore.getState().reset();
      previousProfile.current = profileKey;
    }
  }, [profileKey]);
  useEffect(() => {
    if (noHelp && useFocusStore.getState().running)
      useFocusStore
        .getState()
        .pause("El simulacro usa su propio reloj. Tu enfoque quedó pausado.");
  }, [noHelp]);
  useEffect(() => {
    if (!celebration || noHelp) return;
    const timer = setTimeout(
      () => useLearningStore.getState().clearCelebration(),
      6500,
    );
    return () => clearTimeout(timer);
  }, [celebration, noHelp]);
  if (noHelp || !ready) return null;
  return (
    <>
      {pathname !== "/" && <div className="h-24 shrink-0" aria-hidden="true" />}
      {pathname !== "/" && focus.sessionId && (
        <div className="fixed left-3 bottom-4 z-30 flex items-center gap-1 rounded-full border bg-background/95 p-2 shadow-lg sm:left-6 sm:bottom-6">
          <span className="px-2 font-mono text-xs tabular-nums">
            {focus.remaining
              ? `${String(Math.floor(focus.remaining / 60)).padStart(2, "0")}:${String(focus.remaining % 60).padStart(2, "0")}`
              : "🌿 Pausa"}
          </span>
          <button
            aria-label={focus.running ? "Pausar enfoque" : "Continuar enfoque"}
            onClick={() => focus.toggle(student?.username ?? null)}
            className="rounded-full p-2 hover:bg-muted"
          >
            {focus.running ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button
            aria-label="Cerrar enfoque"
            onClick={focus.reset}
            className="rounded-full p-2 hover:bg-muted"
          >
            <X size={13} />
          </button>
        </div>
      )}
      {pathname !== "/" && (
        <button
          onClick={() => useLearningStore.getState().openCoach()}
          className="companion-dock fixed right-3 bottom-4 z-30 flex items-center gap-1 rounded-full border border-primary/15 bg-background/95 py-1 pr-4 pl-1 shadow-lg backdrop-blur-sm transition hover:-translate-y-1 sm:right-6 sm:bottom-6"
          aria-label="Abrir mi coach de estudio"
        >
          <StudyPet
            color={learning.petColor}
            accessory={learning.accessory}
            happy={stats.goalMet}
            className="h-12 w-14"
          />
          <span className="text-left">
            <span className="block text-xs font-bold">¿Lo vemos juntos?</span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <MessageCircle size={10} />
              Tu coach
            </span>
          </span>
        </button>
      )}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) useLearningStore.getState().closeCoach();
        }}
      >
        <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl p-5 sm:max-w-xl sm:p-6">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles size={19} />
            Mi coach de estudio
          </DialogTitle>
          <DialogDescription>
            Entender la pista, practicarla y seguir a tu ritmo.
          </DialogDescription>
          <CoachPanel
            key={`${profileKey}:${context?.question ?? "general"}`}
            context={context}
            compact
          />
        </DialogContent>
      </Dialog>
      {celebration?.profileKey === profileKey && (
        <div
          role="status"
          className="study-celebration fixed right-4 bottom-24 left-4 z-40 flex items-center gap-3 rounded-2xl border border-primary/15 bg-background p-4 shadow-xl sm:right-auto sm:bottom-6 sm:left-6 sm:max-w-md"
        >
          <span className="text-2xl" aria-hidden="true">
            🌸
          </span>
          <p className="flex-1 text-sm font-semibold">{celebration.message}</p>
          <button
            onClick={() => useLearningStore.getState().clearCelebration()}
            aria-label="Cerrar celebración"
            className="rounded-full p-1 hover:bg-muted"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}
