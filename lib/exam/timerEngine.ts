"use client";

import { useEffect, useState } from "react";
import type { ExamMachineEvent } from "./machine.types";

const TICK_INTERVAL_MS = 250;

/**
 * Drives the machine's wall-clock TICK event on an interval. The machine itself
 * decides (via guards comparing `now` to an absolute `endsAt`) whether time is
 * up — this hook only supplies the clock, so it stays trivial to unit-test the
 * machine by sending TICK events directly without any real timers.
 */
export function useExamClockTicker(send: (event: ExamMachineEvent) => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      send({ type: "TICK", now: Date.now() });
    }, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [send, active]);
}

/** Reactive remaining-time display, independent of the machine's own clock tick. */
export function useRemainingMs(endsAt: number | null): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === null) return;
    const interval = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (endsAt === null) return null;
  return Math.max(0, endsAt - now);
}

export function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
