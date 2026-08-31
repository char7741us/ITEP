"use client";

import { useRemainingMs, formatRemaining } from "@/lib/exam/timerEngine";
import { cn } from "@/lib/utils";

export function CountdownTimer({ endsAt, className }: { endsAt: number | null; className?: string }) {
  const remainingMs = useRemainingMs(endsAt);
  if (remainingMs === null) return null;
  const isLow = remainingMs <= 60_000;

  return (
    <div
      className={cn(
        "font-mono text-lg font-semibold tabular-nums tracking-tight",
        isLow ? "text-destructive" : "text-foreground",
        className
      )}
      role="timer"
      aria-live="off"
    >
      {formatRemaining(remainingMs)}
    </div>
  );
}
