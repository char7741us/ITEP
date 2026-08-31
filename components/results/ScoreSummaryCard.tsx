import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CEFRBandBadge } from "./CEFRBandBadge";
import { scoreToBand } from "@/lib/exam/cefr";
import type { AttemptScores } from "@/lib/types/attempt";

export function ScoreSummaryCard({ scores, isPartial }: { scores: AttemptScores; isPartial: boolean }) {
  const bandInfo = scoreToBand(scores.overall);
  return (
    <Card>
      <CardHeader>
        <CardDescription>
          {isPartial ? "Puntaje general (parcial: Reading + Listening + Grammar)" : "Puntaje general"}
        </CardDescription>
        <div className="flex items-baseline gap-3">
          <CardTitle className="text-4xl font-bold tabular-nums">{scores.overall.toFixed(1)}</CardTitle>
          <span className="text-muted-foreground">/ 6.0</span>
          <CEFRBandBadge band={scores.overallBand} className="ml-auto" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{bandInfo.description}</p>
      </CardContent>
    </Card>
  );
}
