"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CircleHelp, RotateCcw, Sparkles, Target } from "lucide-react";
import { correctedSentence, grammarC1Topics, sentenceParts } from "@/lib/grammar-c1/bank";
import type { Mark } from "@/lib/grammar-c1/bank";
import { useGrammarProgressStore } from "@/lib/grammar-c1/progress";
import { notebookProfileKey, useErrorNotebookStore } from "@/lib/notebook/store";
import { useActiveProfile } from "@/lib/storage/profileRepo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const labels: Mark[] = ["A", "B", "C", "D"];
const roundSize = 5;

export default function GrammarC1Page() {
  const profile = useActiveProfile();
  const profileKey = notebookProfileKey(profile?.username ?? null);
  const progressByProfile = useGrammarProgressStore((state) => state.byProfile);
  const [hydrated, setHydrated] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [roundIds, setRoundIds] = useState<number[]>([]);
  const [position, setPosition] = useState(0);
  const [selected, setSelected] = useState<Mark | null>(null);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const answeredRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    Promise.resolve(useGrammarProgressStore.persist.rehydrate()).then(() => {
      if (mounted) setHydrated(true);
    });
    return () => { mounted = false; };
  }, []);

  const topic = grammarC1Topics.find((item) => item.id === activeTopicId);
  const questionIndex = roundIds[position];
  const question = topic && questionIndex !== undefined ? topic.questions[questionIndex] : null;
  const topicProgress = progressByProfile[profileKey] ?? {};
  const totalQuestions = grammarC1Topics.reduce((total, item) => total + item.questions.length, 0);
  const completedQuestions = grammarC1Topics.reduce((total, item) => total + (topicProgress[item.id]?.completedIds.length ?? 0), 0);

  async function startTopic(topicId: string) {
    const chosen = grammarC1Topics.find((item) => item.id === topicId);
    if (!chosen) return;
    const round = useGrammarProgressStore.getState().startRound(profileKey, topicId);
    const count = Math.min(roundSize, chosen.questions.length);
    const first = (round * count) % chosen.questions.length;
    setRoundIds(Array.from({ length: count }, (_, offset) => (first + offset) % chosen.questions.length));
    setActiveTopicId(topicId);
    setPosition(0);
    setSelected(null);
    setRoundCorrect(0);
    setFinished(false);
    answeredRef.current = false;
    try {
      if (!useErrorNotebookStore.persist.hasHydrated()) await useErrorNotebookStore.persist.rehydrate();
      useErrorNotebookStore.getState().markStudyDay(profile?.username ?? null, new Date());
    } catch (error) {
      console.error("No se pudo registrar el día de práctica de Grammar:", error);
    }
  }

  function answer(mark: Mark) {
    if (!topic || !question || answeredRef.current) return;
    answeredRef.current = true;
    const correct = mark === question.wrong;
    useGrammarProgressStore.getState().recordAnswer(profileKey, topic.id, `${topic.id}:${questionIndex}`, correct);
    setSelected(mark);
    if (correct) setRoundCorrect((value) => value + 1);
  }

  function next() {
    if (position === roundIds.length - 1) setFinished(true);
    else {
      setPosition((value) => value + 1);
      setSelected(null);
      answeredRef.current = false;
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:py-12">
      <Link href="/cuaderno-errores" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Volver al Cuaderno de Errores</Link>

      <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-[#e9e6ff] via-[#fff4f7] to-[#fff0c3] p-6 shadow-sm dark:from-[#37315b] dark:via-[#5f3046] dark:to-[#66502f] sm:p-9">
        <div className="absolute -right-8 -top-10 text-8xl opacity-35" aria-hidden="true">✦</div>
        <div className="relative grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary dark:bg-white/10"><Sparkles className="h-3.5 w-3.5" /> Tu laboratorio de Grammar C1</p>
            <h1 className="text-3xl font-black leading-tight sm:text-5xl">Detecta una palabra. Domina la regla. 🕵️‍♀️</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/80 sm:text-base">Practica identificar la palabra incorrecta en cada oración. Comienza por subject–verb agreement y avanza por los temas esenciales de gramática avanzada, con una explicación breve después de cada respuesta.</p>
          </div>
          <div className="rounded-3xl bg-white/80 p-5 text-center shadow-sm dark:bg-white/10" aria-label="Progreso de Grammar C1">
            <div className="text-4xl font-black text-primary">{hydrated ? completedQuestions : "…"}<span className="text-xl text-muted-foreground">/{totalQuestions}</span></div>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">preguntas acertadas al menos una vez</p>
          </div>
        </div>
      </section>

      {topic ? (
        <div className="space-y-5">
          <Button variant="outline" onClick={() => setActiveTopicId(null)}><ArrowLeft className="h-4 w-4" /> Ver todos los temas</Button>
          <section className="rounded-[2rem] border border-[#c6b7f1] bg-[#f5f0ff] p-5 dark:border-[#6b5b92] dark:bg-[#38304f] sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-xs font-extrabold uppercase tracking-widest text-[#7353ad] dark:text-[#d8c8ff]">Mini lección</p><h2 className="mt-1 text-2xl font-black">{topic.title}</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed">{topic.rule}</p></div>
              <div className="rounded-2xl bg-white/75 px-4 py-3 text-sm font-bold dark:bg-white/10">🎯 {topic.focus}</div>
            </div>
            <div className="mt-4 rounded-2xl border-l-4 border-[#a88ae5] bg-white/80 p-3 text-sm dark:bg-white/10"><span className="font-bold">Ejemplo:</span> <span lang="en">{topic.example}</span></div>
            <div className="mt-4 flex flex-wrap gap-2">{topic.subtopics.map((subtopic) => <span key={subtopic} className="rounded-full bg-white/75 px-3 py-1 text-xs font-semibold dark:bg-white/10">{subtopic}</span>)}</div>
          </section>

          {finished ? (
            <section className="rounded-[2rem] border border-primary/15 bg-white p-8 text-center shadow-sm dark:bg-card">
              <div className="text-6xl" aria-hidden="true">{roundCorrect === roundIds.length ? "🌟" : "🌱"}</div>
              <h3 className="mt-3 text-2xl font-black">{roundCorrect === roundIds.length ? "¡Ronda impecable!" : "¡Una ronda más, un poco más fuerte!"}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Acertaste {roundCorrect} de {roundIds.length}. Las respuestas correctas quedaron guardadas en este navegador.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3"><Button onClick={() => startTopic(topic.id)}><RotateCcw className="h-4 w-4" /> Siguiente ronda</Button><Button variant="outline" onClick={() => setActiveTopicId(null)}>Explorar otro tema</Button></div>
            </section>
          ) : question ? (
            <section className="rounded-[2rem] border border-primary/10 bg-white p-5 shadow-sm dark:bg-card sm:p-8" aria-label="Ejercicio de encontrar una palabra incorrecta">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-extrabold uppercase tracking-wider text-primary">Pregunta {position + 1} de {roundIds.length}</p><p className="text-xs font-semibold text-muted-foreground">Elige solo una palabra incorrecta</p></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[#a88ae5] transition-all" style={{ width: `${((position + 1) / roundIds.length) * 100}%` }} /></div>
              <p className="mt-6 text-sm font-semibold text-muted-foreground">Lee la oración. Las cuatro opciones están subrayadas:</p>
              <div className="mt-4 rounded-3xl bg-[#fff9e7] p-5 text-xl font-medium leading-[2.7] dark:bg-[#4b402b] sm:text-2xl" lang="en">
                {sentenceParts(question.sentence).map((part, index) => part.mark ? (
                  <button key={index} type="button" onClick={() => answer(part.mark!)} disabled={selected !== null} aria-label={`Opción ${part.mark}: ${part.text}`} className={cn(
                    "mx-0.5 inline-flex items-baseline gap-1 rounded-lg border-b-[3px] px-1.5 py-0.5 font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    selected === null && "border-[#ad7ac4] bg-white hover:bg-[#f1e3ff] dark:bg-white/10",
                    selected !== null && part.mark === question.wrong && "border-green-600 bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100",
                    selected === part.mark && part.mark !== question.wrong && "border-red-600 bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-100",
                    selected !== null && selected !== part.mark && part.mark !== question.wrong && "border-transparent bg-white/40 opacity-65 dark:bg-white/5"
                  )}><span className="text-xs font-black not-italic">{part.mark}</span>{part.text}</button>
                ) : <span key={index}>{part.text}</span>)}
              </div>
              <div className="mt-5 flex flex-wrap gap-2" aria-label="Opciones de respuesta">{labels.map((mark) => <Button key={mark} type="button" variant={selected === mark ? "default" : "outline"} disabled={selected !== null} onClick={() => answer(mark)} aria-label={`Seleccionar palabra ${mark}`}>Palabra {mark}</Button>)}</div>
              {selected && (
                <div role="status" className={cn("mt-6 rounded-2xl border p-4", selected === question.wrong ? "border-green-300 bg-green-50 dark:bg-green-950/40" : "border-amber-300 bg-amber-50 dark:bg-amber-950/40")}>
                  <p className="font-extrabold">{selected === question.wrong ? "¡Exacto! Encontraste la palabra 🥳" : `Casi. La palabra incorrecta era ${question.wrong}. 💡`}</p>
                  <p className="mt-2 text-sm leading-relaxed">{question.explanation}</p>
                  <p className="mt-2 rounded-xl bg-white/70 p-3 text-sm dark:bg-white/10"><span className="font-bold">Así queda:</span> <span lang="en">{correctedSentence(question)}</span></p>
                  <Button className="mt-4" onClick={next}>{position === roundIds.length - 1 ? "Ver mi resultado" : "Siguiente pregunta"}<ArrowRight className="h-4 w-4" /></Button>
                </div>
              )}
            </section>
          ) : null}
        </div>
      ) : (
        <>
          <section className="rounded-[2rem] border border-[#efbd7a] bg-gradient-to-r from-[#fff0cf] to-[#fff9e9] p-5 dark:border-[#766041] dark:from-[#574327] dark:to-[#493c2b] sm:p-7">
            <div className="flex items-start gap-4"><span className="text-5xl" aria-hidden="true">🔎</span><div><p className="text-xs font-extrabold uppercase tracking-widest text-[#96601b] dark:text-[#f8d39a]">Empieza aquí · tu punto de partida</p><h2 className="mt-1 text-2xl font-black">Subject–verb agreement</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed">El truco es encontrar el verdadero sujeto: <span lang="en" className="font-bold">The collection of maps <u>is</u>...</span> El verbo responde a <em>collection</em>, no a <em>maps</em>. Practica 20 casos originales, cinco a la vez.</p><Button className="mt-4" onClick={() => startTopic("subject-verb-agreement")}>Practicar concordancia <ArrowRight className="h-4 w-4" /></Button></div></div>
          </section>
          <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-2xl font-black">Tu mapa de temas C1</h2><p className="mt-1 text-sm text-muted-foreground">Cada tarjeta tiene una mini lección y ejercicios de una sola palabra.</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{grammarC1Topics.length} temas · {totalQuestions} preguntas</span></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{grammarC1Topics.map((item, index) => {
            const completed = topicProgress[item.id]?.completedIds.length ?? 0;
            return <article key={item.id} className="flex flex-col rounded-3xl border border-primary/10 bg-white p-5 shadow-sm dark:bg-card"><div className="flex items-start justify-between gap-2"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f3eafd] text-lg font-black text-[#7b57ae] dark:bg-[#46345f]">{index === 0 ? <Target className="h-5 w-5" /> : index + 1}</div><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold">{hydrated ? completed : "…"}/{item.questions.length}</span></div><h3 className="mt-4 text-lg font-extrabold">{item.title}</h3><p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{item.focus}</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[#b38ad1]" style={{ width: `${(completed / item.questions.length) * 100}%` }} /></div><Button className="mt-4 w-full" variant={index === 0 ? "default" : "outline"} onClick={() => startTopic(item.id)}>{completed > 0 ? "Continuar" : "Explorar tema"}<ArrowRight className="h-4 w-4" /></Button></article>;
          })}</div>
        </>
      )}

      <aside className="rounded-2xl border border-primary/10 bg-muted/35 p-4 text-xs leading-relaxed text-muted-foreground"><p className="flex items-center gap-2 font-bold"><CircleHelp className="h-4 w-4" /> Cómo se relaciona con el examen</p><p className="mt-1">La sección Grammar de iTEP Academic incluye completar espacios e identificar errores. El material aquí es original, inspirado en ese formato; para que entrenes el punto que te cuesta, cada ejercicio de esta sección marca exactamente cuatro palabras individuales y una sola es incorrecta. Acertar este banco es práctica, no certificación C1. <a className="underline" href="https://www.itepexam.com/wp-content/uploads/2022/05/iTEP-Academic-Brochure.pdf" target="_blank" rel="noopener noreferrer">Ver folleto oficial de iTEP</a>.</p></aside>
    </main>
  );
}
