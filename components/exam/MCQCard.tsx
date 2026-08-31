"use client";

import type { MCQItem } from "@/lib/types/content";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MCQCard({
  item,
  index,
  selectedIndex,
  onAnswer,
}: {
  item: MCQItem;
  index: number;
  selectedIndex: number | null | undefined;
  onAnswer: (selectedIndex: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          {index + 1}. {item.prompt}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedIndex?.toString() ?? ""} onValueChange={(value) => onAnswer(Number(value))}>
          {item.choices.map((choice, choiceIndex) => (
            <div key={choiceIndex} className="flex items-center gap-2 py-1">
              <RadioGroupItem value={choiceIndex.toString()} id={`${item.id}-${choiceIndex}`} />
              <Label htmlFor={`${item.id}-${choiceIndex}`} className="font-normal">
                {choice}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
