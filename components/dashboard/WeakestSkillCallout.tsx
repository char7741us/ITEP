import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingDown } from "lucide-react";
import type { AttemptRecord } from "@/lib/types/attempt";

const IMPLEMENTED_SECTIONS = ["grammar", "listening", "reading", "writing", "speaking"] as const;

export function WeakestSkillCallout({ attempts }: { attempts: AttemptRecord[] }) {
  const completed = attempts.filter((a) => a.status === "completed" && a.scores);
  if (completed.length === 0) return null;

  const averages = IMPLEMENTED_SECTIONS.map((section) => {
    const graded = completed.filter((attempt) =>
      section !== "writing" && section !== "speaking"
        ? true
        : !attempt.gradingErrors?.some((error) => error.startsWith(section === "writing" ? "Writing" : "Speaking") || error.startsWith("Writing y Speaking:"))
    );
    return { section, average: graded.length ? graded.reduce((sum, a) => sum + a.scores![section], 0) / graded.length : Infinity };
  }).filter((entry) => Number.isFinite(entry.average));

  const weakest = averages.reduce((min, curr) => (curr.average < min.average ? curr : min));
  const labels: Record<(typeof IMPLEMENTED_SECTIONS)[number], string> = {
    grammar: "Grammar",
    listening: "Listening",
    reading: "Reading",
    writing: "Writing",
    speaking: "Speaking",
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
