"use client";

import { cn } from "@/lib/utils";

export function QuestionNavigatorGrid({
  total,
  currentIndex,
  answeredIndices,
  onSelect,
}: {
  total: number;
  currentIndex: number;
  answeredIndices: Set<number>;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
      {Array.from({ length: total }, (_, i) => i).map((index) => {
        const isAnswered = answeredIndices.has(index);
        const isCurrent = index === currentIndex;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            aria-current={isCurrent}
            aria-label={`Pregunta ${index + 1}${isAnswered ? ", respondida" : ", sin responder"}`}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
              isCurrent && "border-primary ring-2 ring-primary ring-offset-1 ring-offset-background",
              !isCurrent && isAnswered && "border-primary/40 bg-primary/10 text-primary",
              !isCurrent && !isAnswered && "border-border bg-muted text-muted-foreground"
            )}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}
