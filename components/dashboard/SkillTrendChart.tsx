"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { AttemptRecord } from "@/lib/types/attempt";

export function SkillTrendChart({ attempts }: { attempts: AttemptRecord[] }) {
  const completed = attempts
    .filter((a) => a.status === "completed" && a.scores)
    .slice()
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

  if (completed.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Completa al menos dos simulacros para ver tu tendencia de progreso.
      </p>
    );
  }

  const data = completed.map((attempt, index) => ({
    name: `#${index + 1}`,
    Reading: attempt.scores!.reading,
    Listening: attempt.scores!.listening,
    Grammar: attempt.scores!.grammar,
    Writing: attempt.scores!.writing,
    Speaking: attempt.scores!.speaking,
    General: attempt.scores!.overall,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis domain={[0, 6]} fontSize={12} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Reading" stroke="var(--chart-1, #2563eb)" strokeWidth={2} />
          <Line type="monotone" dataKey="Listening" stroke="var(--chart-4, #ea580c)" strokeWidth={2} />
          <Line type="monotone" dataKey="Grammar" stroke="var(--chart-2, #16a34a)" strokeWidth={2} />
          <Line type="monotone" dataKey="Writing" stroke="var(--chart-5, #0891b2)" strokeWidth={2} />
          <Line type="monotone" dataKey="Speaking" stroke="#a855f7" strokeWidth={2} />
          <Line type="monotone" dataKey="General" stroke="var(--chart-3, #9333ea)" strokeWidth={2} strokeDasharray="4 4" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
