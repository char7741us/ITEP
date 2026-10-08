"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadContentPack } from "@/lib/content/loader";
import { collectFailedTopics } from "@/lib/notebook/failedRules";
import { recordCompletedAttempt, useErrorNotebookStore } from "@/lib/notebook/store";
import type { ErrorNotebookEntry } from "@/lib/notebook/store";
import { listAttempts } from "@/lib/storage/attemptsRepo";
import { useActiveProfile } from "@/lib/storage/profileRepo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TwinQuestion {
  context: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export default function ErrorNotebookPage() {
  const profile = useActiveProfile();
  const entries = useErrorNotebookStore((state) => state.entries);
  const [hydrated, setHydrated] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<TwinQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [mastered, setMastered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const answeredRef = useRef(false);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!useErrorNotebookStore.persist.hasHydrated()) {
          await useErrorNotebookStore.persist.rehydrate();
        }
        // Include finished exams from before the notebook was added.
        const attempts = await listAttempts();
        for (const attempt of attempts) {
          if (attempt.status !== "completed") continue;
          try {
            const pack = loadContentPack(`${attempt.contentPackId}@${attempt.contentPackVersion}`);
            await recordCompletedAttempt(
              attempt.id,
              attempt.profileUsername ?? null,
              collectFailedTopics(attempt, pack)
            );
          } catch (cause) {
            console.error("No se pudo importar un simulacro al cuaderno:", cause);
          }
        }
      } catch (cause) {
        console.error("No se pudo cargar el cuaderno de errores:", cause);
        if (mounted) setError("No se pudo cargar el cuaderno guardado en este navegador.");
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => {
      mounted = false;
      requestRef.current?.abort();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const visibleEntries = entries.filter((entry) => entry.profileUsername === (profile?.username ?? null));
  const activeEntry = entries.find((entry) => entry.id === activeId);
  const currentQuestion = questions?.[questionIndex];

  async function loadTwins(entry: ErrorNotebookEntry) {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setActiveId(entry.id);
    setQuestions(null);
    setLoading(true);
    setError(null);
    setQuestionIndex(0);
    setSelectedIndex(null);
    setAnswered(false);
    answeredRef.current = false;
    setMastered(false);
    setFinished(false);
    setCorrectCount(0);
    try {
      const response = await fetch("/api/generate-twins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ failed_rule: entry.failed_rule, section: entry.section }),
        signal: controller.signal,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "No se pudieron generar las preguntas.");
      if (!Array.isArray(payload.questions) || payload.questions.length !== 3) {
        throw new Error("La respuesta no contiene tres preguntas válidas.");
      }
      setQuestions(payload.questions as TwinQuestion[]);
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(cause instanceof Error ? cause.message : "No se pudieron generar las preguntas.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  function answerQuestion(choiceIndex: number) {
    if (!activeEntry || !currentQuestion || answeredRef.current) return;
    answeredRef.current = true;
    const correct = choiceIndex === currentQuestion.correctIndex;
    const reachedMastery = useErrorNotebookStore.getState().answer(activeEntry.id, correct);
    setSelectedIndex(choiceIndex);
    setAnswered(true);
    if (correct) setCorrectCount((count) => count + 1);
    if (reachedMastery) setMastered(true);
  }

  function nextQuestion() {
    if (!questions) return;
    if (questionIndex === questions.length - 1) {
      setFinished(true);
    } else {
      setQuestionIndex((index) => index + 1);
      setSelectedIndex(null);
      setAnswered(false);
      answeredRef.current = false;
    }
  }

  function backToTopics() {
    requestRef.current?.abort();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setActiveId(null);
    setQuestions(null);
    setError(null);
  }

  function playListeningContext(context: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(context);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Cuaderno de Errores</h1>
        <p className="text-sm text-muted-foreground">
          Entrena los temas que fallaste en tus simulacros. Cada respuesta correcta suma una a tu racha; una incorrecta la reinicia.
          Al lograr tres aciertos seguidos, el tema sale del cuaderno.
        </p>
      </div>

      {activeId ? (
        <div className="space-y-5">
          <Button variant="outline" onClick={backToTopics}>Volver a mis temas</Button>
          {mastered ? (
            <Card>
              <CardHeader>
                <CardTitle>¡Tema dominado!</CardTitle>
                <CardDescription>Lograste tres aciertos consecutivos. Este tema ya salió de tu cuaderno.</CardDescription>
              </CardHeader>
              <CardContent><Button onClick={backToTopics}>Ver otros temas</Button></CardContent>
            </Card>
          ) : activeEntry && (
            <Card>
              <CardHeader>
                <CardTitle>{activeEntry.section}: {activeEntry.failed_rule}</CardTitle>
                <CardDescription>Racha actual: {activeEntry.streak} de 3 aciertos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {loading && <p role="status" className="text-sm text-muted-foreground">Generando tres ejercicios nuevos...</p>}
                {error && (
                  <div role="alert" className="space-y-3">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button onClick={() => loadTwins(activeEntry)}>Intentar de nuevo</Button>
                  </div>
                )}
                {finished && questions && (
                  <div className="space-y-3">
                    <p>Terminaste esta ronda: {correctCount} de {questions.length} respuestas correctas.</p>
                    <p className="text-sm text-muted-foreground">Tu racha permanece guardada. Puedes generar otra ronda para seguir practicando.</p>
                    <Button onClick={() => loadTwins(activeEntry)}>Generar otras tres preguntas</Button>
                  </div>
                )}
                {!finished && currentQuestion && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Pregunta {questionIndex + 1} de {questions?.length}
                    </p>
                    {currentQuestion.context && (
                      activeEntry.section === "Listening" ? (
                        <div className="space-y-2 rounded-lg bg-muted p-4">
                          <p className="text-sm font-medium">Diálogo para escuchar</p>
                          <Button variant="outline" onClick={() => playListeningContext(currentQuestion.context)}>
                            Escuchar diálogo
                          </Button>
                          <details className="text-sm">
                            <summary className="cursor-pointer">Mostrar transcripción</summary>
                            <p className="mt-2 whitespace-pre-line">{currentQuestion.context}</p>
                          </details>
                        </div>
                      ) : (
                        <p className="whitespace-pre-line rounded-lg bg-muted p-4 text-sm">{currentQuestion.context}</p>
                      )
                    )}
                    <fieldset className="space-y-2">
                      <legend className="mb-3 font-medium">{currentQuestion.question}</legend>
                      {currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          type="button"
                          disabled={answered}
                          aria-pressed={selectedIndex === index}
                          onClick={() => answerQuestion(index)}
                          className={cn(
                            "block w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors hover:bg-muted disabled:cursor-default",
                            answered && index === currentQuestion.correctIndex && "border-emerald-600 bg-emerald-500/10",
                            answered && index === selectedIndex && index !== currentQuestion.correctIndex && "border-destructive bg-destructive/10"
                          )}
                        >
                          {String.fromCharCode(65 + index)}. {option}
                        </button>
                      ))}
                    </fieldset>
                    {answered && (
                      <div role="status" className="space-y-3">
                        <p className="font-medium">
                          {selectedIndex === currentQuestion.correctIndex ? "¡Correcto!" : "Respuesta incorrecta; tu racha volvió a cero."}
                        </p>
                        <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                        <Button onClick={nextQuestion}>
                          {questionIndex === (questions?.length ?? 0) - 1 ? "Terminar ronda" : "Siguiente pregunta"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : !hydrated ? (
        <p role="status" className="text-sm text-muted-foreground">Cargando tu cuaderno...</p>
      ) : error ? (
        <p role="alert" className="text-sm text-destructive">{error}</p>
      ) : visibleEntries.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No hay temas pendientes</CardTitle>
            <CardDescription>Cuando termines un simulacro, las preguntas incorrectas u omitidas aparecerán aquí.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button nativeButton={false} render={<Link href="/exam/new">Comenzar un simulacro</Link>} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">{visibleEntries.length} {visibleEntries.length === 1 ? "tema pendiente" : "temas pendientes"}</p>
          {visibleEntries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle>{entry.section}</CardTitle>
                <CardDescription>{entry.failed_rule}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">Racha: {entry.streak}/3</span>
                <Button onClick={() => loadTwins(entry)}>Entrenar debilidad</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
