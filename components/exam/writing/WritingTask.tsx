"use client";

import type { WritingTask as WritingTaskData } from "@/lib/types/content";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { WordCounter } from "./WordCounter";

export function WritingTask({
  task,
  text,
  onChange,
}: {
  task: WritingTaskData;
  text: string;
  onChange: (text: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardDescription>{task.title}</CardDescription>
          <CardTitle className="text-base font-normal leading-relaxed">{task.prompt}</CardTitle>
        </CardHeader>
      </Card>

      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-48 resize-none"
          placeholder="Escribe tu respuesta en inglés..."
        />
        <WordCounter text={text} minWords={task.minWords} maxWords={task.maxWords} />
      </div>
    </div>
  );
}
