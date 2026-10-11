import type { AttemptRecord } from "@/lib/types/attempt";
import type { ExamContentPack, MCQItem } from "@/lib/types/content";
import { countCorrect } from "./scoring";

export interface ReadinessCheck {
  section: "Reading" | "Listening" | "Grammar" | "Writing" | "Speaking";
  met: boolean;
  detail: string;
}

/** A demanding study target, not an iTEP/CEFR certification or score conversion. */
export function getC1PracticeReadiness(attempt: AttemptRecord, pack: ExamContentPack): { ready: boolean; checks: ReadinessCheck[] } {
  const objective: Array<[ReadinessCheck["section"], MCQItem[], AttemptRecord["responses"]["reading"]]> = [
    ["Reading", pack.reading.parts.flatMap((part) => part.items), attempt.responses.reading],
    ["Listening", pack.listening.parts.flatMap((part) => part.segments.flatMap((segment) => segment.items)), attempt.responses.listening],
    ["Grammar", pack.grammar.parts.flatMap((part) => part.items), attempt.responses.grammar],
  ];
  const checks: ReadinessCheck[] = objective.map(([section, items, responses]) => {
    const { correct, total } = countCorrect(items, responses);
    const target = Math.ceil(total * 0.85);
    return { section, met: correct >= target, detail: `${correct}/${total} · meta ${target}/${total} aciertos` };
  });
  for (const section of ["Writing", "Speaking"] as const) {
    const tasks = pack[section.toLowerCase() as "writing" | "speaking"].tasks;
    const grades = section === "Writing" ? attempt.responses.writing : attempt.responses.speaking;
    const taskScores = tasks.map((task) => grades.find((response) => response.taskNumber === task.taskNumber)?.grading?.score);
    const met = taskScores.every((score) => score !== undefined && score >= 4.5);
    const detail = taskScores.some((score) => score === undefined)
      ? "Falta evaluar una o ambas tareas con IA"
      : `Tareas ${taskScores.map((score) => score!.toFixed(1)).join(" y ")}/6 · meta 4.5 en cada una`;
    checks.push({ section, met, detail });
  }
  return { ready: checks.every((check) => check.met), checks };
}
