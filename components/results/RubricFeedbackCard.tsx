import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CEFRBandBadge } from "./CEFRBandBadge";
import type { RubricResult } from "@/lib/types/attempt";

export function RubricFeedbackCard({
  title,
  grading,
  dimensionLabels,
}: {
  title: string;
  grading: RubricResult | undefined;
  dimensionLabels: Record<string, string>;
}) {
  if (!grading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>No se pudo calificar esta respuesta (revisa que tu GEMINI_API_KEY esté configurada).</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tabular-nums">{grading.score.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">/ 6.0</span>
            <CEFRBandBadge band={grading.cefrBand} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(grading.dimensionScores).map(([key, value]) => (
            <div key={key} className="rounded-md bg-muted/50 p-2 text-center">
              <p className="text-xs text-muted-foreground">{dimensionLabels[key] ?? key}</p>
              <p className="font-semibold tabular-nums">{value.toFixed(1)}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground">{grading.rationale}</p>
        {grading.strengths.length > 0 && (
          <div>
            <p className="font-medium">Fortalezas</p>
            <ul className="list-inside list-disc text-muted-foreground">
              {grading.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        {grading.improvements.length > 0 && (
          <div>
            <p className="font-medium">A mejorar</p>
            <ul className="list-inside list-disc text-muted-foreground">
              {grading.improvements.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
