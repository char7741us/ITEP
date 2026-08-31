"use client";

import type { ReadingPart as ReadingPartData } from "@/lib/types/content";
import type { MCQResponse } from "@/lib/types/attempt";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MCQCard } from "@/components/exam/MCQCard";

export function ReadingPart({
  part,
  responses,
  onAnswer,
}: {
  part: ReadingPartData;
  responses: Record<string, MCQResponse>;
  onAnswer: (itemId: string, selectedIndex: number) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="lg:sticky lg:top-6 lg:self-start">
        <CardHeader>
          <CardTitle className="text-base">{part.passageTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[420px] pr-4">
            <div className="space-y-4 text-sm leading-relaxed whitespace-pre-line">{part.passageText}</div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="space-y-5">
        {part.items.map((item, index) => (
          <MCQCard
            key={item.id}
            item={item}
            index={index}
            selectedIndex={responses[item.id]?.selectedIndex}
            onAnswer={(selectedIndex) => onAnswer(item.id, selectedIndex)}
          />
        ))}
      </div>
    </div>
  );
}
