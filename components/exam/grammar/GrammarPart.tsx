"use client";

import type { MCQItem } from "@/lib/types/content";
import type { MCQResponse } from "@/lib/types/attempt";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionNavigatorGrid } from "./QuestionNavigatorGrid";

export function GrammarPart({
  items,
  currentIndex,
  responses,
  onAnswer,
  onNavigate,
  onSubmit,
}: {
  items: MCQItem[];
  currentIndex: number;
  responses: Record<string, MCQResponse>;
  onAnswer: (itemId: string, selectedIndex: number) => void;
  onNavigate: (index: number) => void;
  onSubmit: () => void;
}) {
  const currentItem = items[currentIndex];
  const answeredIndices = new Set(items.map((item, i) => (responses[item.id] ? i : -1)).filter((i) => i >= 0));
  const kindLabel = currentIndex < 13 ? "Completar la oración" : "Identificar el error";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
      <Card>
        <CardHeader>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pregunta {currentIndex + 1} de {items.length} · {kindLabel}
          </p>
          <CardTitle className="text-base font-normal leading-relaxed">{currentItem.prompt}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={responses[currentItem.id]?.selectedIndex?.toString() ?? ""}
            onValueChange={(value) => onAnswer(currentItem.id, Number(value))}
          >
            {currentItem.choices.map((choice, choiceIndex) => (
              <div key={choiceIndex} className="flex items-center gap-2 py-1">
                <RadioGroupItem value={choiceIndex.toString()} id={`${currentItem.id}-${choiceIndex}`} />
                <Label htmlFor={`${currentItem.id}-${choiceIndex}`} className="font-normal">
                  {String.fromCharCode(65 + choiceIndex)}. {choice}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              disabled={currentIndex === 0}
              onClick={() => onNavigate(currentIndex - 1)}
            >
              Anterior
            </Button>
            {currentIndex === items.length - 1 ? (
              <Button onClick={onSubmit}>Enviar Grammar</Button>
            ) : (
              <Button onClick={() => onNavigate(currentIndex + 1)}>Siguiente</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Navegación ({answeredIndices.size}/{items.length} respondidas)</p>
        <QuestionNavigatorGrid
          total={items.length}
          currentIndex={currentIndex}
          answeredIndices={answeredIndices}
          onSelect={onNavigate}
        />
        <Button className="w-full" variant="secondary" onClick={onSubmit}>
          Enviar sección
        </Button>
      </div>
    </div>
  );
}
