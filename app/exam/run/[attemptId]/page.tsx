"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMachine } from "@xstate/react";
import type { Snapshot } from "xstate";
import { examMachine, getGrammarItems, getListeningSegments } from "@/lib/exam/machine";
import { useExamClockTicker } from "@/lib/exam/timerEngine";
import { getAttempt, saveAttempt, saveSpeakingAudio } from "@/lib/storage/attemptsRepo";
import { buildCompletedAttemptRecord } from "@/lib/exam/attemptRecord";
import { loadContentPack } from "@/lib/content/loader";
import { loadRuntimeSnapshot, saveRuntimeSnapshot, clearRuntimeSnapshot } from "@/lib/storage/runtimeRepo";
import type { AttemptRecord } from "@/lib/types/attempt";
import type { ExamContentPack } from "@/lib/types/content";
import { SectionShell } from "@/components/exam/SectionShell";
import { ReadingPart } from "@/components/exam/reading/ReadingPart";
import { ListeningPart } from "@/components/exam/listening/ListeningPart";
import { GrammarPart } from "@/components/exam/grammar/GrammarPart";
import { WritingTask } from "@/components/exam/writing/WritingTask";
import { PrepCountdown } from "@/components/exam/speaking/PrepCountdown";
import { SpeakingTask } from "@/components/exam/speaking/SpeakingTask";
import { MicPermissionGate } from "@/components/common/MicPermissionGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExamRunPage() {
  const params = useParams<{ attemptId: string }>();
  const router = useRouter();
  const [attempt, setAttempt] = useState<AttemptRecord | null | undefined>(undefined);
  const [contentPack, setContentPack] = useState<ExamContentPack | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const record = await getAttempt(params.attemptId);
      if (cancelled) return;
      if (!record) {
        setAttempt(null);
        return;
      }
      const pack = loadContentPack(`${record.contentPackId}@${record.contentPackVersion}`);
      setContentPack(pack);
      setAttempt(record);
    })();
    return () => {
      cancelled = true;
    };
  }, [params.attemptId]);

  if (attempt === undefined) {
    return <CenteredMessage>Cargando simulacro...</CenteredMessage>;
  }

  if (attempt === null || !contentPack) {
    return (
      <CenteredMessage>
        No se encontró este simulacro.{" "}
        <Button variant="link" onClick={() => router.push("/exam/new")}>
          Empezar uno nuevo
        </Button>
      </CenteredMessage>
    );
  }

  return <ExamMachineView attempt={attempt} contentPack={contentPack} />;
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 items-center justify-center p-8 text-center text-muted-foreground">{children}</div>;
}

function ExamMachineView({ attempt, contentPack }: { attempt: AttemptRecord; contentPack: ExamContentPack }) {
  const router = useRouter();
  const contentPackKey = `${contentPack.manifest.packId}@${contentPack.manifest.version}`;

  // Read once, synchronously, so the very first render already knows whether to
  // resume a persisted mid-exam snapshot or start fresh — avoids a flash of
  // "setup" before swapping to the resumed section.
  const initialSnapshot = useMemo(() => loadRuntimeSnapshot(attempt.id) as Snapshot<unknown> | null, [attempt.id]);

  // `input` is only used to build a fresh context and is ignored once `snapshot`
  // is present (the snapshot already carries its own context) — it still has to
  // be passed either way because the machine's input type has no optional keys.
  const [state, send, actorRef] = useMachine(examMachine, {
    input: { attemptId: attempt.id, mode: attempt.mode, contentPackKey },
    ...(initialSnapshot ? { snapshot: initialSnapshot } : {}),
  });

  useEffect(() => {
    const subscription = actorRef.subscribe((snapshot) => {
      if (snapshot.status === "done") {
        clearRuntimeSnapshot(attempt.id);
      } else {
        saveRuntimeSnapshot(attempt.id, actorRef.getPersistedSnapshot());
      }
    });
    return () => subscription.unsubscribe();
  }, [actorRef, attempt.id]);

  const isTiming =
    state.matches("reading") ||
    state.matches("listening") ||
    state.matches("grammar") ||
    state.matches("writing") ||
    state.matches("speaking");
  useExamClockTicker(send, isTiming);

  useEffect(() => {
    if (!state.matches("done")) return;
    (async () => {
      const completed = buildCompletedAttemptRecord(attempt, state.context);
      await saveAttempt(completed);
      router.push(`/results/${attempt.id}`);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.value]);

  async function handleSpeakingRecorded(taskNumber: 1 | 2, blob: Blob) {
    const blobKey = `${attempt.id}:${taskNumber}`;
    await saveSpeakingAudio(blobKey, blob);
    send({ type: "SAVE_SPEAKING_RECORDING", taskNumber, blobKey });
  }

  if (state.matches("setup")) {
    return <Instructions mode={attempt.mode} onStart={() => send({ type: "START" })} />;
  }

  if (state.matches("reading")) {
    const partIndex = state.context.reading.partIndex;
    const part = contentPack.reading.parts[partIndex];
    const isLastPart = partIndex === contentPack.reading.parts.length - 1;
    return (
      <SectionShell
        sectionLabel="Reading"
        subLabel={`Parte ${partIndex + 1} de ${contentPack.reading.parts.length}`}
        endsAt={state.context.reading.endsAt}
        mode={attempt.mode}
      >
        <div className="space-y-6">
          <ReadingPart
            part={part}
            responses={state.context.reading.responses}
            onAnswer={(itemId, selectedIndex) => send({ type: "ANSWER_READING", itemId, selectedIndex, timeSpentMs: 0 })}
          />
          <div className="flex justify-end">
            {isLastPart ? (
              <Button size="lg" onClick={() => send({ type: "SUBMIT_READING" })}>
                Enviar Reading y continuar a Listening
              </Button>
            ) : (
              <Button size="lg" onClick={() => send({ type: "NEXT_READING_PART" })}>
                Siguiente parte
              </Button>
            )}
          </div>
        </div>
      </SectionShell>
    );
  }

  if (state.matches("listening")) {
    const segments = getListeningSegments(contentPack);
    const segment = segments[state.context.listening.currentSegmentIndex];
    const isLastSegment = state.context.listening.currentSegmentIndex === segments.length - 1;
    return (
      <SectionShell
        sectionLabel="Listening"
        subLabel={`Segmento ${state.context.listening.currentSegmentIndex + 1} de ${segments.length}`}
        endsAt={state.context.listening.endsAt}
        mode={attempt.mode}
      >
        <ListeningPart
          segment={segment}
          isLastSegment={isLastSegment}
          alreadyPlayed={state.context.listening.playedSegmentIndices.includes(segment.globalIndex)}
          responses={state.context.listening.responses}
          onPlaybackEnd={() => send({ type: "MARK_SEGMENT_PLAYED", index: segment.globalIndex })}
          onAnswer={(itemId, selectedIndex) => send({ type: "ANSWER_LISTENING", itemId, selectedIndex, timeSpentMs: 0 })}
          onNext={() => send({ type: "NEXT_LISTENING_SEGMENT" })}
          onSubmit={() => send({ type: "SUBMIT_LISTENING" })}
        />
      </SectionShell>
    );
  }

  if (state.matches("grammar")) {
    const items = getGrammarItems(contentPackKey);
    return (
      <SectionShell sectionLabel="Grammar" subLabel="25 preguntas · navegación libre" endsAt={state.context.grammar.endsAt} mode={attempt.mode}>
        <GrammarPart
          items={items}
          currentIndex={state.context.grammar.currentIndex}
          responses={state.context.grammar.responses}
          onAnswer={(itemId, selectedIndex) => send({ type: "ANSWER_GRAMMAR", itemId, selectedIndex, timeSpentMs: 0 })}
          onNavigate={(index) => send({ type: "GO_TO_GRAMMAR_ITEM", index })}
          onSubmit={() => send({ type: "SUBMIT_GRAMMAR" })}
        />
      </SectionShell>
    );
  }

  if (state.matches("writing")) {
    const taskNumber = state.matches({ writing: "task1" }) ? 1 : 2;
    const task = contentPack.writing.tasks[taskNumber - 1];
    const isLastTask = taskNumber === 2;
    return (
      <SectionShell
        sectionLabel="Writing"
        subLabel={`Tarea ${taskNumber} de 2`}
        endsAt={state.context.writing.endsAtByTask[taskNumber]}
        mode={attempt.mode}
      >
        <div className="space-y-6">
          <WritingTask
            task={task}
            text={state.context.writing.texts[taskNumber]}
            onChange={(text) => send({ type: "UPDATE_WRITING_TEXT", taskNumber, text })}
          />
          <div className="flex justify-end">
            <Button size="lg" onClick={() => send({ type: "SUBMIT_WRITING_TASK" })}>
              {isLastTask ? "Enviar Writing y continuar a Speaking" : "Siguiente tarea"}
            </Button>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (state.matches("speaking")) {
    if (state.matches({ speaking: "warmup" })) {
      return (
        <SectionShell sectionLabel="Speaking" subLabel="Calentamiento" endsAt={state.context.speaking.warmupEndsAt} mode={attempt.mode}>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Prepárate para Speaking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                La sección de Speaking tiene 2 tareas. Cada una tiene un tiempo de preparación y luego se graba tu
                respuesta automáticamente. No podrás repetir tu grabación.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-card p-3">
                  <p className="text-xs font-medium">Tarea 1 — Experiencia Personal</p>
                  <p className="text-xs text-muted-foreground">30s preparación · 45s grabación</p>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <p className="text-xs font-medium">Tarea 2 — Opinión sobre un Debate</p>
                  <p className="text-xs text-muted-foreground">45s preparación · 60s grabación</p>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Importante:</span> Asegúrate de tener un micrófono funcionando.
                  Habla con claridad y organiza tus ideas antes de empezar.
                </p>
              </div>
            </CardContent>
          </Card>
        </SectionShell>
      );
    }

    const taskNumber = state.matches({ speaking: "task1Prep" }) || state.matches({ speaking: "task1Record" }) ? 1 : 2;
    const task = contentPack.speaking.tasks[taskNumber - 1];
    const isPrep = state.matches({ speaking: "task1Prep" }) || state.matches({ speaking: "task2Prep" });
    const endsAt = isPrep ? state.context.speaking.prepEndsAtByTask[taskNumber] : state.context.speaking.recordEndsAtByTask[taskNumber];

    return (
      <SectionShell
        sectionLabel="Speaking"
        subLabel={`Tarea ${taskNumber} de 2 · ${isPrep ? "Preparación" : "Grabando respuesta"}`}
        endsAt={endsAt}
        mode={attempt.mode}
      >
        {isPrep ? (
          <PrepCountdown
            title={task.title}
            prompt={task.prompt}
            taskNumber={taskNumber}
            prepSeconds={task.prepSeconds}
          />
        ) : (
          <SpeakingTask
            title={task.title}
            prompt={task.prompt}
            taskNumber={taskNumber}
            responseSeconds={task.responseSeconds}
            onRecorded={(blob) => handleSpeakingRecorded(taskNumber, blob)}
          />
        )}
      </SectionShell>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
      <div>
        <p className="font-medium">Calificando con IA...</p>
        <p className="text-sm text-muted-foreground">
          Procesando tus respuestas de Writing y Speaking con Gemini AI. Esto puede tomar unos segundos.
        </p>
      </div>
    </div>
  );
}

function Instructions({ mode, onStart }: { mode: AttemptRecord["mode"]; onStart: () => void }) {
  // Requesting mic access here — on a real click, well before the timer-driven
  // Speaking section — matters most on Safari/iOS, which often refuses
  // getUserMedia() when it isn't triggered by a direct user gesture. Asking
  // now means the browser already has an answer by the time Speaking's
  // auto-advancing timer needs the mic, instead of a silent failure mid-exam.
  const [micGranted, setMicGranted] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Antes de comenzar</CardTitle>
          <CardDescription>
            El simulacro sigue el orden real del iTEP: Reading → Listening → Grammar → Writing → Speaking. Una vez
            enviada una sección no podrás regresar a ella.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• Reading: 25 minutos, 10 preguntas en 2 partes (avance únicamente hacia adelante).</p>
          <p>• Listening: 20 minutos, 14 preguntas en 3 partes. Cada audio se reproduce una sola vez.</p>
          <p>• Grammar: 10 minutos, 25 preguntas, puedes navegar libremente entre ellas.</p>
          <p>• Writing: 2 tareas (5 y 20 minutos) calificadas por IA.</p>
          <p>• Speaking: 2 tareas grabadas con preparación cronometrada, calificadas por IA.</p>
          {mode === "intensive" && (
            <p className="font-medium text-foreground">
              Estás en Modo Entrenamiento Intensivo: el tiempo se agota automáticamente y no hay pistas disponibles.
            </p>
          )}
          <div className="border-t pt-3">
            <MicPermissionGate onGranted={() => setMicGranted(true)} />
          </div>
        </CardContent>
      </Card>
      <Button size="lg" onClick={onStart} disabled={!micGranted}>
        {micGranted ? "Comenzar Reading" : "Habilita el micrófono para continuar"}
      </Button>
    </div>
  );
}
