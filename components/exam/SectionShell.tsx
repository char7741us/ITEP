"use client";

import type { ReactNode } from "react";
import { CountdownTimer } from "@/components/exam/Timer/CountdownTimer";
import { Badge } from "@/components/ui/badge";
import { EXAM_MODE_LABELS, type ExamMode } from "@/lib/types/mode";

export function SectionShell({
  sectionLabel,
  subLabel,
  endsAt,
  mode,
  children,
}: {
  sectionLabel: string;
  subLabel?: string;
  endsAt: number | null;
  mode: ExamMode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-xl font-semibold">{sectionLabel}</h1>
          {subLabel && <p className="text-sm text-muted-foreground">{subLabel}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={mode === "intensive" ? "destructive" : "secondary"}>{EXAM_MODE_LABELS[mode]}</Badge>
          <CountdownTimer endsAt={endsAt} />
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
