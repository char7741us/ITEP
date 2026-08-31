"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAttempt } from "@/lib/storage/attemptsRepo";
import { loadContentPack } from "@/lib/content/loader";
import { getReadingItems, getGrammarItems } from "@/lib/exam/machine";
import { getListeningItems } from "@/lib/exam/listening";
import type { AttemptRecord } from "@/lib/types/attempt";
import type { ExamContentPack } from "@/lib/types/content";
import { ScoreSummaryCard } from "@/components/results/ScoreSummaryCard";
import { SectionBreakdownTable } from "@/components/results/SectionBreakdownTable";
import { ItemReviewList } from "@/components/results/ItemReviewList";
import { RubricFeedbackCard } from "@/components/results/RubricFeedbackCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const WRITING_DIMENSION_LABELS = {
  organization: "Organización",
  grammarAccuracy: "Gramática",
  vocabulary: "Vocabulario",
  taskAchievement: "Cumplimiento",
};

const SPEAKING_DIMENSION_LABELS = {
  fluency: "Fluidez",
  grammarRange: "Gramática",
  vocabulary: "Vocabulario",
  coherence: "Coherencia",
};

export default function ResultsPage() {
  const params = useParams<{ attemptId: string }>();
  const [attempt, setAttempt] = useState<AttemptRecord | null | undefined>(undefined);
  const [contentPack, setContentPack] = useState<ExamContentPack | null>(null);

  useEffect(() => {
    (async () => {
      const record = await getAttempt(params.attemptId);
      if (!record) {
        setAttempt(null);
        return;
      }
      setContentPack(loadContentPack(`${record.contentPackId}@${record.contentPackVersion}`));
      setAttempt(record);
    })();
  }, [params.attemptId]);

  if (attempt === undefined) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Cargando resultados...</div>;
  }

  if (!attempt || !contentPack || !attempt.scores) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center text-muted-foreground">
        <p>No se encontraron resultados para este simulacro.</p>
        <Button nativeButton={false} render={<Link href="/exam/new">Comenzar un nuevo simulacro</Link>} />
      </div>
    );
  }

  const contentPackKey = `${attempt.contentPackId}@${attempt.contentPackVersion}`;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resultados del simulacro</h1>
        <Button variant="outline" nativeButton={false} render={<Link href="/dashboard">Ver progreso</Link>} />
      </div>

      <ScoreSummaryCard scores={attempt.scores} isPartial={false} />
      <SectionBreakdownTable scores={attempt.scores} />

      <Separator />

      <ItemReviewList title="Revisión de Reading" items={getReadingItems(contentPackKey)} responses={attempt.responses.reading} />
      <ItemReviewList title="Revisión de Listening" items={getListeningItems(contentPack)} responses={attempt.responses.listening} />
      <ItemReviewList title="Revisión de Grammar" items={getGrammarItems(contentPackKey)} responses={attempt.responses.grammar} />

      <Separator />

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Writing</h3>
        {contentPack.writing.tasks.map((task) => {
          const response = attempt.responses.writing.find((r) => r.taskNumber === task.taskNumber);
          return (
            <RubricFeedbackCard
              key={task.taskNumber}
              title={`Tarea ${task.taskNumber}: ${task.title}`}
              grading={response?.grading}
              dimensionLabels={WRITING_DIMENSION_LABELS}
            />
          );
        })}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Speaking</h3>
        {contentPack.speaking.tasks.map((task) => {
          const response = attempt.responses.speaking.find((r) => r.taskNumber === task.taskNumber);
          return (
            <RubricFeedbackCard
              key={task.taskNumber}
              title={`Tarea ${task.taskNumber}: ${task.title}`}
              grading={response?.grading}
              dimensionLabels={SPEAKING_DIMENSION_LABELS}
            />
          );
        })}
      </div>

      <div className="flex justify-center pb-8">
        <Button size="lg" nativeButton={false} render={<Link href="/exam/new">Hacer otro simulacro</Link>} />
      </div>
    </div>
  );
}
