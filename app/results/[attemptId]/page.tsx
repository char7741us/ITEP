"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAttempt, saveAttempt } from "@/lib/storage/attemptsRepo";
import { loadContentPack } from "@/lib/content/loader";
import { retryMissingGrades } from "@/lib/exam/grading";
import { hasCompleteSkillGrade, isPartialAttempt } from "@/lib/exam/grade-status";
import { getC1PracticeReadiness } from "@/lib/exam/readiness";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    (async () => {
      const record = await getAttempt(params.attemptId);
      if (!record) {
        setAttempt(null);
        return;
      }
      setContentPack(loadContentPack(`${record.contentPackId}@${record.contentPackVersion}`));
      setAttempt(record);
    })().catch(() => { setLoadError(true); setAttempt(null); });
  }, [params.attemptId]);

  if (attempt === undefined) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Cargando resultados...</div>;
  }

  if (!attempt || !contentPack || !attempt.scores) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center text-muted-foreground">
        <p>{loadError ? "No se pudo acceder al historial. Revisa el almacenamiento de este navegador; no borres sus datos." : "No se encontraron resultados para este simulacro en este navegador."}</p>
        <Button nativeButton={false} render={<Link href="/exam/new">Comenzar un nuevo simulacro</Link>} />
      </div>
    );
  }

  const contentPackKey = `${attempt.contentPackId}@${attempt.contentPackVersion}`;
  const readiness = getC1PracticeReadiness(attempt, contentPack);
  const partial = isPartialAttempt(attempt);
  const ungradedSections = ["writing", "speaking"].filter((section) => !hasCompleteSkillGrade(attempt, section as "writing" | "speaking"));
  const canRetry = partial && (
    attempt.responses.writing.some((response) => response.text.trim() && !response.grading) ||
    attempt.responses.speaking.some((response) => response.audioBlobKey && !response.grading)
  );

  async function retryGrades() {
    if (!attempt || !contentPack || retrying) return;
    setRetrying(true);
    setRetryError(null);
    try {
      const updated = await retryMissingGrades(attempt, contentPack);
      await saveAttempt(updated);
      setAttempt(updated);
    } catch (error) {
      setRetryError(error instanceof Error ? error.message : "No se pudo volver a intentar la calificación.");
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resultados del simulacro</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href="/cuaderno-errores">Entrenar debilidades</Link>} />
          <Button variant="outline" nativeButton={false} render={<Link href="/dashboard">Ver progreso</Link>} />
        </div>
      </div>

      {partial && (
        <Alert variant="destructive">
          <AlertTitle>Calificación incompleta</AlertTitle>
          <AlertDescription>
            La evaluación de IA no terminó para todas las respuestas. El promedio mostrado excluye las secciones sin
            calificación en los resultados nuevos; no lo interpretes como nota final. Una sección sin respuesta o grabación tampoco constituye una evaluación. Tus respuestas disponibles siguen guardadas en este navegador.
          </AlertDescription>
          {canRetry && <Button className="mt-3" onClick={retryGrades} disabled={retrying}>{retrying ? "Calificando respuestas guardadas…" : "Reintentar Writing y Speaking"}</Button>}
        </Alert>
      )}
      {retryError && <Alert variant="destructive"><AlertTitle>No se pudo guardar la nueva calificación</AlertTitle><AlertDescription>{retryError}</AlertDescription></Alert>}
      <ScoreSummaryCard scores={attempt.scores} isPartial={partial} />
      <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5" aria-label="Meta de práctica C1">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Tu siguiente misión</p>
        <h2 className="mt-1 text-xl font-bold">{readiness.ready ? "🌟 Alcanzaste la meta exigente de práctica C1" : "🎯 Camino a la meta de práctica C1"}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Esta meta de estudio exige al menos 85 % en cada sección objetiva y 4.5/6 en cada tarea de Writing y Speaking. Es una referencia interna del simulador, no una certificación ni la conversión oficial de iTEP.</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {readiness.checks.map((check) => <li key={check.section} className="rounded-xl bg-background p-3 text-sm"><span className="font-semibold">{check.met ? "✅" : "🌱"} {check.section}</span><span className="block text-xs text-muted-foreground">{check.detail}</span></li>)}
        </ul>
        {!readiness.ready && <p className="mt-4 text-sm">Siguiente paso: <Link className="font-semibold text-primary underline" href="/cuaderno-errores">entrena tus errores generales</Link> o sigue tu <Link className="font-semibold text-primary underline" href="/cuaderno-errores/grammar">plan de Grammar C1</Link>.</p>}
      </section>
      <SectionBreakdownTable scores={attempt.scores} ungradedSections={ungradedSections} />

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
