import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MCQItem } from "@/lib/types/content";
import type { MCQResponse } from "@/lib/types/attempt";
import { cn } from "@/lib/utils";

export function ItemReviewList({ title, items, responses }: { title: string; items: MCQItem[]; responses: MCQResponse[] }) {
  const responseMap = new Map(responses.map((r) => [r.itemId, r.selectedIndex]));

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      {items.map((item, index) => {
        const selected = responseMap.get(item.id) ?? null;
        const isCorrect = selected === item.correctIndex;
        const isUnanswered = selected === null || selected === undefined;

        return (
          <Card key={item.id}>
            <CardHeader className="flex-row items-start gap-2 space-y-0">
              {isUnanswered ? (
                <MinusCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              ) : isCorrect ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              )}
              <CardTitle className="text-sm font-medium leading-relaxed">
                {index + 1}. {item.prompt}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ul className="space-y-1">
                {item.choices.map((choice, choiceIndex) => (
                  <li
                    key={choiceIndex}
                    className={cn(
                      "rounded px-2 py-1",
                      choiceIndex === item.correctIndex && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                      choiceIndex === selected && choiceIndex !== item.correctIndex && "bg-destructive/10 text-destructive"
                    )}
                  >
                    {String.fromCharCode(65 + choiceIndex)}. {choice}
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground">{item.explanation}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
