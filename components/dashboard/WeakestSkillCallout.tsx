import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingDown } from "lucide-react";
import type { AttemptRecord } from "@/lib/types/attempt";

const IMPLEMENTED_SECTIONS = ["reading", "listening", "grammar"] as const;

export function WeakestSkillCallout({ attempts }: { attempts: AttemptRecord[] }) {
  const completed = attempts.filter((a) => a.status === "completed" && a.scores);
  if (completed.length === 0) return null;

  const averages = IMPLEMENTED_SECTIONS.map((section) => ({
    section,
    average: completed.reduce((sum, a) => sum + a.scores![section], 0) / completed.length,
  }));

  const weakest = averages.reduce((min, curr) => (curr.average < min.average ? curr : min));
  const labels: Record<(typeof IMPLEMENTED_SECTIONS)[number], string> = {
    reading: "Reading",
    listening: "Listening",
    grammar: "Grammar",
  };

  return (
    <Alert>
      <TrendingDown className="h-4 w-4" />
      <AlertTitle>Área a reforzar: {labels[weakest.section]}</AlertTitle>
      <AlertDescription>
        Tu promedio en {labels[weakest.section]} es {weakest.average.toFixed(1)}/6.0, tu puntaje más bajo entre las
        secciones evaluadas hasta ahora. Practica más simulacros enfocados en esa habilidad.
      </AlertDescription>
    </Alert>
  );
}
