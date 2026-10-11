"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Check, Flame, Headphones, Heart, Lightbulb, RefreshCw, Sparkles, Volume2 } from "lucide-react";
import { loadContentPack } from "@/lib/content/loader";
import { getCoachGuide } from "@/lib/notebook/coach";
import { collectFailedTopics } from "@/lib/notebook/failedRules";
import { consecutiveStudyDays, localStudyDate, notebookProfileKey, recordCompletedAttempt, useErrorNotebookStore } from "@/lib/notebook/store";
import type { ErrorNotebookEntry } from "@/lib/notebook/store";
import { listAttempts } from "@/lib/storage/attemptsRepo";
import { useActiveProfile } from "@/lib/storage/profileRepo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TwinQuestion {
  context: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

const sectionStyle = {
  Grammar: { emoji: "🧩", color: "bg-[#fff0d3] dark:bg-[#674d2a]" },
  Reading: { emoji: "📖", color: "bg-[#fce4ec] dark:bg-[#74334c]" },
  Listening: { emoji: "🎧", color: "bg-[#e8edf9] dark:bg-[#383e6d]" },
} as const;

function NotebookBuddy({ small = false }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 220 220" className={small ? "h-24 w-24 shrink-0" : "h-40 w-40 shrink-0 sm:h-48 sm:w-48"} role="img" aria-label="Un cuaderno sonriente con una estrella">
      <ellipse cx="111" cy="201" rx="69" ry="9" fill="#7a1f35" opacity=".12" />
      <path d="M43 83C21 71 12 93 28 102M178 86c24-15 33 6 17 17" fill="none" stroke="#7a1f35" strokeWidth="7" strokeLinecap="round" />
      <path d="M76 174 65 193M145 174l12 19" stroke="#7a1f35" strokeWidth="8" strokeLinecap="round" />
      <rect x="49" y="35" width="126" height="143" rx="23" fill="#7a1f35" />
      <rect x="58" y="43" width="109" height="127" rx="17" fill="#fffaf1" />
      <path d="M76 44v126" stroke="#f2b6c6" strokeWidth="8" />
      <path d="M80 69h66M80 83h51" stroke="#f2d86a" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="90" cy="115" rx="5" ry="7" fill="#7a1f35" />
      <ellipse cx="136" cy="115" rx="5" ry="7" fill="#7a1f35" />
      <ellipse cx="77" cy="128" rx="10" ry="5" fill="#f2b6c6" />
      <ellipse cx="149" cy="128" rx="10" ry="5" fill="#f2b6c6" />
      <path d="M102 136q11 11 22 0" fill="none" stroke="#7a1f35" strokeWidth="4" strokeLinecap="round" />
      <path d="m174 22 4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill="#f2d86a" stroke="#7a1f35" strokeWidth="2" />
      <path d="m37 27 2 7 7 2-7 2-2 7-2-7-7-2 7-2z" fill="#f2b6c6" />
    </svg>
  );
}

function MasterySteps({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${streak} de 3 aciertos seguidos`}>
      {[0, 1, 2].map((step) => (
        <span key={step} className={cn(
          "grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-bold",
          step < streak ? "border-primary bg-primary text-primary-foreground" : "border-primary/20 bg-white/70 text-primary/50 dark:bg-white/5"
        )}>{step < streak ? <Check className="h-4 w-4" /> : step + 1}</span>
      ))}
    </div>
  );
}

export default function ErrorNotebookPage() {
  const profile = useActiveProfile();
  const entries = useErrorNotebookStore((state) => state.entries);
  const studyDaysByProfile = useErrorNotebookStore((state) => state.studyDaysByProfile);
  const masteredByProfile = useErrorNotebookStore((state) => state.masteredByProfile);
  const [hydrated, setHydrated] = useState(false);
  const [speechSupported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<TwinQuestion[] | null>(null);
  const [questionSource, setQuestionSource] = useState<"ai" | "bank" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [mastered, setMastered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showExampleExplanation, setShowExampleExplanation] = useState(false);
  const answeredRef = useRef(false);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!useErrorNotebookStore.persist.hasHydrated()) await useErrorNotebookStore.persist.rehydrate();
        const attempts = await listAttempts();
        for (const attempt of attempts) {
          if (attempt.status !== "completed") continue;
          try {
            const pack = loadContentPack(`${attempt.contentPackId}@${attempt.contentPackVersion}`);
            await recordCompletedAttempt(attempt.id, attempt.profileUsername ?? null, collectFailedTopics(attempt, pack));
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
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const username = profile?.username ?? null;
  const profileKey = notebookProfileKey(username);
  const visibleEntries = entries.filter((entry) => entry.profileUsername === username);
  const activeEntry = visibleEntries.find((entry) => entry.id === activeId);
  const currentQuestion = questions?.[questionIndex];
  const days = studyDaysByProfile[profileKey] ?? [];
  const studiedToday = days.includes(localStudyDate(new Date()));
  const dayStreak = hydrated ? consecutiveStudyDays(days, new Date()) : 0;
  const masteredCount = masteredByProfile[profileKey] ?? 0;

  function openTopic(entry: ErrorNotebookEntry) {
    requestRef.current?.abort();
    useErrorNotebookStore.getState().markStudyDay(entry.profileUsername, new Date());
    setActiveId(entry.id);
    setQuestions(null);
    setQuestionSource(null);
    setError(null);
    setMastered(false);
    setFinished(false);
    setShowExampleExplanation(false);
  }

  async function loadTwins(entry: ErrorNotebookEntry) {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setQuestions(null);
    setQuestionSource(null);
    setLoading(true);
    setError(null);
    setQuestionIndex(0);
    setSelectedIndex(null);
    setAnswered(false);
    answeredRef.current = false;
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
      if (!Array.isArray(payload.questions) || payload.questions.length !== 3) throw new Error("La respuesta no contiene tres preguntas válidas.");
      setQuestions(payload.questions as TwinQuestion[]);
      setQuestionSource(payload.source === "bank" ? "bank" : "ai");
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
    if (questionIndex === questions.length - 1) setFinished(true);
    else {
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
    setQuestionSource(null);
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-4 py-8 sm:py-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-[#ffe5ec] via-[#fffaf0] to-[#fff0bb] p-6 shadow-sm dark:from-[#6c2b43] dark:via-[#552033] dark:to-[#73552e] sm:p-9">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full border-[20px] border-white/35" aria-hidden="true" />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:gap-8">
          <div className="max-w-xl text-center sm:text-left">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1 text-xs font-bold uppercase tracking-[.12em] text-primary dark:bg-white/10">
              <Sparkles className="h-3.5 w-3.5" /> Tu rincón de crecimiento
            </div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">Cada error es una semilla 🌱</h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-foreground/80 sm:text-base">
              Aquí no vienes a recordar lo que salió mal. Vienes a descubrir la pista, practicar a tu ritmo y celebrar cada avance.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 text-sm font-medium dark:bg-white/10">
              <Heart className="h-4 w-4 fill-[#f2b6c6] text-primary" /> {studiedToday ? "¡Ya dedicaste un ratito a tu cuaderno hoy!" : "Tu mini misión de hoy: explora un tema."}
            </p>
          </div>
          <NotebookBuddy />
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3" aria-label="Tu progreso en el cuaderno">
        <div className="rounded-3xl border border-primary/10 bg-white/80 p-4 shadow-sm dark:bg-card">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Flame className="h-4 w-4 text-[#d67d2b]" /> Constancia</div>
          <p className="mt-2 text-3xl font-extrabold">{dayStreak} <span className="text-sm font-medium">{dayStreak === 1 ? "día seguido" : "días seguidos"}</span></p>
          <p className="mt-1 text-xs text-muted-foreground">Cuenta los días en que abriste un tema.</p>
        </div>
        <div className="rounded-3xl border border-primary/10 bg-white/80 p-4 shadow-sm dark:bg-card">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><BookOpen className="h-4 w-4 text-[#bf5374]" /> Por descubrir</div>
          <p className="mt-2 text-3xl font-extrabold">{hydrated ? visibleEntries.length : "…"} <span className="text-sm font-medium">temas</span></p>
          <p className="mt-1 text-xs text-muted-foreground">Cada tema trae una mini lección.</p>
        </div>
        <div className="rounded-3xl border border-primary/10 bg-white/80 p-4 shadow-sm dark:bg-card">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Sparkles className="h-4 w-4 text-[#bf9525]" /> Ya florecieron</div>
          <p className="mt-2 text-3xl font-extrabold">{masteredCount} <span className="text-sm font-medium">{masteredCount === 1 ? "tema" : "temas"}</span></p>
          <p className="mt-1 text-xs text-muted-foreground">Lograste 3 aciertos seguidos en cada uno.</p>
        </div>
      </div>

      <Link href="/cuaderno-errores/grammar" className="group flex flex-col gap-4 rounded-[2rem] border border-[#bda6e9] bg-gradient-to-r from-[#efe8ff] via-[#fff2f6] to-[#fff4d6] p-5 shadow-sm transition-transform hover:-translate-y-0.5 dark:border-[#635184] dark:from-[#39304f] dark:via-[#573245] dark:to-[#564329] sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-center gap-4"><span className="text-5xl" aria-hidden="true">🕵️‍♀️</span><div><p className="text-xs font-extrabold uppercase tracking-widest text-[#8052aa] dark:text-[#d4b7ff]">Sección especial</p><h2 className="mt-1 text-2xl font-black">Solo Grammar · camino a C1</h2><p className="mt-1 text-sm text-foreground/75">Todo tu mapa de temas, con prioridad en subject–verb agreement y ejercicios de encontrar una sola palabra incorrecta.</p></div></div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground group-hover:bg-primary/90">Entrar a Grammar <ArrowRight className="h-4 w-4" /></span>
      </Link>

      {activeId ? (
        <div className="space-y-5">
          <Button variant="outline" onClick={backToTopics}><ArrowLeft className="h-4 w-4" /> Volver a mis temas</Button>
          {mastered ? (
            <div className="rounded-[2rem] border border-primary/15 bg-gradient-to-br from-[#fff0c9] to-[#ffe6ec] p-7 text-center shadow-sm dark:from-[#74592f] dark:to-[#663047] sm:p-10">
              <div className="text-6xl" aria-hidden="true">🌸</div>
              <h2 className="mt-3 text-2xl font-extrabold">¡Este tema floreció!</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-foreground/80">Tres respuestas correctas seguidas: ya salió de tus pendientes. Tu esfuerzo quedó guardado en este navegador.</p>
              <Button className="mt-5" onClick={backToTopics}>Explorar otro tema <ArrowRight className="h-4 w-4" /></Button>
            </div>
          ) : activeEntry ? (
            <div className="space-y-5">
              <div className={cn("rounded-[2rem] border border-primary/10 p-5 shadow-sm sm:p-7", sectionStyle[activeEntry.section].color)}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-[.12em]">{sectionStyle[activeEntry.section].emoji} {activeEntry.section} · Mini lección</p>
                    <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{getCoachGuide(activeEntry.section, activeEntry.failed_rule).title}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/80">{getCoachGuide(activeEntry.section, activeEntry.failed_rule).idea}</p>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-white/75 p-3 dark:bg-white/10">
                    <p className="mb-2 text-xs font-bold">Camino a dominarlo</p>
                    <MasterySteps streak={activeEntry.streak} />
                  </div>
                </div>
              </div>

              <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]" aria-label="Explicación ilustrada">
                <div className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm dark:bg-card sm:p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold"><Lightbulb className="h-5 w-5 text-[#d99a1f]" /> La idea en un dibujo</h3>
                  <div className="mt-4 rounded-2xl bg-[#fff6d9] p-4 text-center text-base font-bold leading-relaxed text-primary dark:bg-[#745a2c]">
                    {getCoachGuide(activeEntry.section, activeEntry.failed_rule).pattern}
                  </div>
                  <div className="mt-4 rounded-2xl border-l-4 border-[#f2b6c6] bg-[#fff7f9] p-4 dark:bg-white/5">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Míralo en acción</p>
                    <p className="mt-2 font-semibold italic" lang="en">{getCoachGuide(activeEntry.section, activeEntry.failed_rule).example}</p>
                    {showExampleExplanation ? (
                      <p role="status" className="mt-2 rounded-xl bg-white/75 p-3 text-sm leading-relaxed dark:bg-white/10">✨ {getCoachGuide(activeEntry.section, activeEntry.failed_rule).meaning}</p>
                    ) : (
                      <Button className="mt-3" variant="outline" onClick={() => setShowExampleExplanation(true)}>Descubrir la pista <Sparkles className="h-4 w-4" /></Button>
                    )}
                  </div>
                </div>
                <div className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm dark:bg-card sm:p-6">
                  <h3 className="text-lg font-bold">Tu mapa de 3 pasos 🗺️</h3>
                  <ol className="mt-4 space-y-3">
                    {getCoachGuide(activeEntry.section, activeEntry.failed_rule).steps.map((step, index) => (
                      <li key={step} className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3 text-sm font-medium">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{index + 1}</span>{step}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4 rounded-2xl bg-[#fce9ee] p-3 text-sm leading-relaxed dark:bg-[#673347]"><span className="font-bold">👀 Ojo con esto:</span> {getCoachGuide(activeEntry.section, activeEntry.failed_rule).trap}</p>
                </div>
              </section>

              <details className="rounded-2xl border border-primary/10 bg-white/70 px-4 py-3 text-sm dark:bg-card">
                <summary className="cursor-pointer font-semibold">Ver la regla que registró tu simulacro</summary>
                <p className="mt-2 break-words leading-relaxed text-muted-foreground">{activeEntry.failed_rule}</p>
              </details>

              <section className="rounded-[2rem] border border-primary/10 bg-white p-5 shadow-sm dark:bg-card sm:p-7" aria-label="Reto de práctica">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">Cuando quieras</p>
                    <h3 className="mt-1 text-xl font-extrabold">Mini reto de 3 preguntas ✨</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Cada acierto suma una flor. Si fallas, la racha vuelve a cero, pero la lección sigue aquí.</p>
                  </div>
                  {!questions && !loading && !finished && !error && <Button onClick={() => loadTwins(activeEntry)}>Empezar mini reto <ArrowRight className="h-4 w-4" /></Button>}
                </div>
                {loading && <p role="status" className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><RefreshCw className="h-4 w-4 animate-spin" /> Preparando tres preguntas para ti…</p>}
                {questions && <p className="mt-4 rounded-xl bg-muted/60 px-3 py-2 text-xs font-medium text-muted-foreground">{questionSource === "bank" ? "📚 Preguntas originales del banco de práctica. No requieren IA." : "✨ Preguntas nuevas creadas para esta regla."}</p>}
                {error && (
                  <div role="alert" className="mt-5 rounded-2xl bg-[#fff6d9] p-4 text-sm dark:bg-[#745a2c]">
                    <p className="font-semibold">El mini reto no está disponible ahora.</p>
                    <p className="mt-1">La lección y tu progreso siguen guardados. Puedes volver a intentarlo más tarde o explorar otro tema.</p>
                    <p className="mt-1 text-xs text-foreground/70">Detalle: {error}</p>
                    <Button className="mt-3" variant="outline" onClick={() => loadTwins(activeEntry)}>Reintentar <RefreshCw className="h-4 w-4" /></Button>
                  </div>
                )}
                {finished && questions && (
                  <div className="mt-5 rounded-2xl bg-[#fff0d3] p-5 dark:bg-[#674d2a]">
                    <p className="text-2xl" aria-hidden="true">{correctCount === 3 ? "🌷" : "🌱"}</p>
                    <p className="mt-2 font-bold">Terminaste: {correctCount} de {questions.length} correctas.</p>
                    <p className="mt-1 text-sm">Tu racha quedó guardada. Puedes practicar de nuevo con otras preguntas.</p>
                    <Button className="mt-4" onClick={() => loadTwins(activeEntry)}>Otra ronda <ArrowRight className="h-4 w-4" /></Button>
                  </div>
                )}
                {!finished && currentQuestion && (
                  <div className="mt-6 space-y-5 border-t border-primary/10 pt-6">
                    <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                      <span>Pregunta {questionIndex + 1} de {questions?.length}</span>
                      <span className="rounded-full bg-[#fff0d3] px-3 py-1 text-xs dark:bg-[#674d2a]">{correctCount} {correctCount === 1 ? "acierto" : "aciertos"} en esta ronda</span>
                    </div>
                    {currentQuestion.context && (
                      activeEntry.section === "Listening" ? (
                        <div className="space-y-3 rounded-2xl bg-[#eef0fa] p-4 dark:bg-[#383e6d]">
                          <p className="flex items-center gap-2 text-sm font-bold"><Headphones className="h-4 w-4" /> Escucha el diálogo</p>
                          {speechSupported ? <Button variant="outline" onClick={() => playListeningContext(currentQuestion.context)}><Volume2 className="h-4 w-4" /> Reproducir</Button> : <p className="text-xs">Tu navegador no ofrece lectura de voz. Puedes consultar la transcripción.</p>}
                          <details className="text-sm"><summary className="cursor-pointer font-medium">Leer transcripción</summary><p className="mt-2 whitespace-pre-line" lang="en">{currentQuestion.context}</p></details>
                        </div>
                      ) : <p className="whitespace-pre-line rounded-2xl bg-[#fff7e6] p-4 text-sm leading-relaxed dark:bg-white/5" lang="en">{currentQuestion.context}</p>
                    )}
                    <fieldset className="space-y-2.5">
                      <legend className="mb-4 text-lg font-bold" lang="en">{currentQuestion.question}</legend>
                      {currentQuestion.options.map((option, index) => (
                        <button key={index} type="button" disabled={answered} aria-pressed={selectedIndex === index} onClick={() => answerQuestion(index)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-2xl border-2 border-primary/10 bg-white px-4 py-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-[#fff7f9] disabled:cursor-default dark:bg-white/5 dark:hover:bg-white/10",
                            answered && index === currentQuestion.correctIndex && "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30",
                            answered && index === selectedIndex && index !== currentQuestion.correctIndex && "border-destructive bg-red-50 dark:bg-red-900/20"
                          )}>
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">{String.fromCharCode(65 + index)}</span>
                          <span lang="en">{option}</span>
                        </button>
                      ))}
                    </fieldset>
                    {answered && (
                      <div role="status" className={cn("rounded-2xl p-5", selectedIndex === currentQuestion.correctIndex ? "bg-emerald-50 dark:bg-emerald-900/30" : "bg-[#fff1df] dark:bg-[#68472e]")}>
                        <p className="font-extrabold">{selectedIndex === currentQuestion.correctIndex ? "¡Sí! Encontraste la pista 🌟" : "Casi: aquí hay una pista nueva 🌱"}</p>
                        <p className="mt-2 text-sm">La respuesta es <strong lang="en">{currentQuestion.options[currentQuestion.correctIndex]}</strong>.</p>
                        <p className="mt-2 text-sm leading-relaxed">{currentQuestion.explanation}</p>
                        {selectedIndex !== currentQuestion.correctIndex && <p className="mt-2 text-xs font-medium">Tu racha de aciertos vuelve a 0, pero puedes seguir practicando este tema.</p>}
                        <Button className="mt-4" onClick={nextQuestion}>{questionIndex === (questions?.length ?? 0) - 1 ? "Ver resultado" : "Siguiente pregunta"} <ArrowRight className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          ) : <p role="alert" className="text-sm">Este tema ya no está entre tus pendientes. <button className="underline" onClick={backToTopics}>Volver al cuaderno</button></p>}
        </div>
      ) : !hydrated ? (
        <p role="status" className="rounded-3xl bg-white/70 p-6 text-sm text-muted-foreground dark:bg-card">Preparando tu cuaderno…</p>
      ) : error ? (
        <p role="alert" className="rounded-3xl bg-white/70 p-6 text-sm text-destructive dark:bg-card">{error}</p>
      ) : visibleEntries.length === 0 ? (
        <div className="flex flex-col items-center rounded-[2rem] border border-primary/10 bg-white/85 p-7 text-center shadow-sm dark:bg-card sm:p-10">
          <NotebookBuddy small />
          <h2 className="mt-2 text-2xl font-extrabold">Tu jardín está al día 🌷</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">Cuando termines un simulacro o una sesión diaria, los temas que necesiten repaso aparecerán aquí con una explicación y un mini reto.</p>
          <Button className="mt-5" nativeButton={false} render={<Link href="/exam/new">Comenzar un simulacro <ArrowRight className="h-4 w-4" /></Link>} />
        </div>
      ) : (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div><p className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">Elige tu aventura</p><h2 className="mt-1 text-2xl font-extrabold">Tus temas para florecer</h2></div>
            <p className="text-sm text-muted-foreground">Empieza por cualquiera; 5 minutos cuentan 💛</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleEntries.map((entry) => {
              const guide = getCoachGuide(entry.section, entry.failed_rule);
              const style = sectionStyle[entry.section];
              return (
                <button key={entry.id} type="button" onClick={() => openTopic(entry)}
                  className={cn("group flex min-h-52 flex-col rounded-[1.75rem] border border-primary/10 p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-white/10", style.color)}>
                  <div className="flex w-full items-center justify-between gap-2"><span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold dark:bg-white/10">{style.emoji} {entry.section}</span><span className="text-xs font-bold">{entry.streak}/3 flores</span></div>
                  <h3 className="mt-5 text-xl font-extrabold">{guide.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/75">{guide.idea}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground/60">Tu regla: {entry.failed_rule}</p>
                  <div className="mt-auto flex w-full items-center justify-between gap-3 pt-5"><MasterySteps streak={entry.streak} /><span className="flex items-center gap-1 text-sm font-bold group-hover:underline">Explorar <ArrowRight className="h-4 w-4" /></span></div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
        Tu cuaderno, tus días de estudio y tus logros se guardan en este navegador para este perfil. Para seguir mañana, vuelve desde el mismo navegador y dispositivo. 💕
      </p>
    </div>
  );
}
