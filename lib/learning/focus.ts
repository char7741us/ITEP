"use client";

import { create } from "zustand";
import { recordLearningActivity } from "./store";

interface FocusState {
  minutes: number;
  remaining: number;
  running: boolean;
  deadline: number;
  sessionId: string;
  owner: string | null;
  message: string;
  choose: (minutes: number) => void;
  toggle: (owner: string | null) => void;
  pause: (message?: string) => void;
  reset: () => void;
  tick: () => void;
}
const initialMessage =
  "Elige una sola intención: entender una regla, no hacerlo todo.";
// Lives in the root layout: navigating to a practice does not discard the timer.
// Not persisted: a closed browser is a break, never counted as focus time.
export const useFocusStore = create<FocusState>((set, get) => ({
  minutes: 5,
  remaining: 300,
  running: false,
  deadline: 0,
  sessionId: "",
  owner: null,
  message: initialMessage,
  choose: (minutes) => {
    if (!get().running && [5, 10, 15].includes(minutes))
      set({ minutes, remaining: minutes * 60, sessionId: "" });
  },
  toggle: (owner) => {
    const state = get();
    if (state.running) {
      state.pause();
      return;
    }
    const remaining = state.remaining || state.minutes * 60;
    set({
      running: true,
      remaining,
      deadline: Date.now() + remaining * 1000,
      ...(!state.sessionId || !state.remaining
        ? { sessionId: crypto.randomUUID(), owner }
        : {}),
      message: "Un paso a la vez. El tiempo es un apoyo, no una carrera.",
    });
  },
  pause: (message) =>
    set((state) => ({
      remaining: state.running
        ? Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000))
        : state.remaining,
      running: false,
      ...(message ? { message } : {}),
    })),
  reset: () =>
    set((state) => ({
      running: false,
      remaining: state.minutes * 60,
      sessionId: "",
      message: "Un inicio nuevo, a tu ritmo.",
    })),
  tick: () => {
    const state = get();
    if (!state.running) return;
    const remaining = Math.max(
      0,
      Math.ceil((state.deadline - Date.now()) / 1000),
    );
    set({
      remaining,
      ...(remaining === 0
        ? {
            running: false,
            message:
              "¡Pausa merecida! Estira, respira y recuerda una idea que te llevas.",
          }
        : {}),
    });
    if (remaining === 0)
      void recordLearningActivity(state.owner, {
        id: `focus:${state.sessionId}`,
        kind: "focus",
        label: "Momento de enfoque completado",
      });
  },
}));
