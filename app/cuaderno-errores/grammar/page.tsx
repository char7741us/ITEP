"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Check, CircleHelp, RotateCcw, Sparkles, Target } from "lucide-react";
import { completedSentence, correctedSentence, grammarC1Topics, sentenceParts } from "@/lib/grammar-c1/bank";
import type { Mark } from "@/lib/grammar-c1/bank";
import { grammarC1Days } from "@/lib/grammar-c1/plan";
import type { QuestionRef } from "@/lib/grammar-c1/plan";
import { useGrammarProgressStore } from "@/lib/grammar-c1/progress";
import { notebookProfileKey, useErrorNotebookStore } from "@/lib/notebook/store";
import { useActiveProfile } from "@/lib/storage/profileRepo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { dateKey } from "@/lib/learning/model";
import { recordLearningActivity } from "@/lib/learning/store";
import { CoachHelpButton } from "@/components/learning/CoachHelpButton";
import { StudyStatus } from "@/components/learning/StudyStatus";
import { PracticeMoment } from "@/components/learning/PracticeMoment";

const labels: Mark[] = ["A", "B", "C", "D"];
const roundSize = 5;

export default function GrammarC1Page() {
  const profile = useActiveProfile();
  const profileKey = notebookProfileKey(profile?.username ?? null);
  const progressByProfile = useGrammarProgressStore((state) => state.byProfile);
  const daysByProfile = useGrammarProgressStore((state) => state.daysByProfile);
  const [hydrated, setHydrated] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [roundRefs, setRoundRefs] = useState<QuestionRef[]>([]);
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

  const day = grammarC1Days.find((item) => item.day === activeDay);
  const selectedTopic = grammarC1Topics.find((item) => item.id === activeTopicId);
  const questionRef = roundRefs[position];
  const topic = grammarC1Topics.find((item) => item.id === questionRef?.topicId) ?? selectedTopic ?? grammarC1Topics[0];
  const question = questionRef ? topic.questions[questionRef.index] : null;
  const answerKey = question?.kind === "error-word" ? question.wrong : question?.correct;
  const wordOptions = question?.kind === "error-word" ? sentenceParts(question.sentence).filter((part) => part.mark) : [];
  const topicProgress = progressByProfile[profileKey] ?? {};
  const dayProgress = daysByProfile[profileKey] ?? {};
  const completedDays = grammarC1Days.filter((item) => dayProgress[item.day]?.completedAt).length;
  const totalQuestions = grammarC1Topics.reduce((total, item) => total + item.questions.length, 0);
  const completedQuestions = grammarC1Topics.reduce((total, item) => total + (topicProgress[item.id]?.completedIds.length ?? 0), 0);

  async function startTopic(topicId: string) {
    const chosen = grammarC1Topics.find((item) => item.id === topicId);
    if (!chosen) return;
    if (!useGrammarProgressStore.persist.hasHydrated()) await useGrammarProgressStore.persist.rehydrate();
    const round = useGrammarProgressStore.getState().startRound(profileKey, topicId);
    const errorIndexes = chosen.questions.flatMap((item, index) => item.kind === "error-word" ? [index] : []);
    const completionIndexes = chosen.questions.flatMap((item, index) => item.kind === "complete-sentence" ? [index] : []);
    const errors = Array.from({ length: Math.min(3, errorIndexes.length) }, (_, offset) => errorIndexes[(round * 3 + offset) % errorIndexes.length]);
    const completions = Array.from({ length: Math.min(2, completionIndexes.length) }, (_, offset) => completionIndexes[(round * 2 + offset) % completionIndexes.length]);
    const indexes = [errors[0], completions[0], errors[1], completions[1], errors[2]].filter((index): index is number => index !== undefined);
    setRoundRefs(indexes.slice(0, roundSize).map((index) => ({ topicId, index })));
    setActiveTopicId(topicId);
    setActiveDay(null);
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

  async function startDay(dayNumber: number) {
    const chosen = grammarC1Days.find((item) => item.day === dayNumber);
    if (!chosen) return;
    if (!useGrammarProgressStore.persist.hasHydrated()) await useGrammarProgressStore.persist.rehydrate();
    setRoundRefs(chosen.refs);
    setActiveTopicId(null);
    setActiveDay(dayNumber);
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
    const correct = mark === answerKey;
    useGrammarProgressStore.getState().recordAnswer(profileKey, topic.id, `${topic.id}:${questionRef.index}`, correct);
    void recordLearningActivity(profile?.username ?? null, { id: `grammar:${dateKey(new Date())}:${topic.id}:${questionRef.index}`, kind: "question", skill: "grammar", label: topic.title });
    setSelected(mark);
    if (correct) setRoundCorrect((value) => value + 1);
  }

  function next() {
    if (position === roundRefs.length - 1) {
      if (day) useGrammarProgressStore.getState().recordDayResult(profileKey, day.day, roundCorrect, roundRefs.length);
      const passedDay = day && roundCorrect >= Math.ceil(roundRefs.length * 0.85);
      void recordLearningActivity(profile?.username ?? null, { id: passedDay ? `grammar-history:${day.day}` : `grammar-round:${dateKey(new Date())}:${day ? `day-${day.day}` : topic.id}`, kind: "round", skill: "grammar", label: day ? `Día ${day.day} de Grammar ${passedDay ? "aprobado" : "practicado"}` : `Ronda de ${topic.title} completada` });
      setFinished(true);
    }
    else {
      setPosition((value) => value + 1);
      setSelected(null);
      answeredRef.current = false;
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:py-12">
      <StudyStatus />
      <Link href="/cuaderno-errores" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Volver al Cuaderno de Errores</Link>

      <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-[#e9e6ff] via-[#fff4f7] to-[#fff0c3] p-6 shadow-sm dark:from-[#37315b] dark:via-[#5f3046] dark:to-[#66502f] sm:p-9">
        <div className="absolute -right-8 -top-10 text-8xl opacity-35" aria-hidden="true">✦</div>
        <div className="relative grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary dark:bg-white/10"><Sparkles className="h-3.5 w-3.5" /> Tu laboratorio de Grammar C1</p>
            <h1 className="text-3xl font-black leading-tight sm:text-5xl">Ruta Grammar C1 · 20 días 🕵️‍♀️</h1>
            <Link href="/laboratorio-c1" className="mt-3 inline-block text-sm font-semibold underline">Refuerzo de tiempos, producción oral y repasos espaciados →</Link>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/80 sm:text-base">Un día, una meta: recorre los 13 temas esenciales con los dos formatos de Grammar de iTEP. Completa oraciones, detecta errores y entiende cada corrección.</p>
          </div>
          <div className="rounded-3xl bg-white/80 p-5 text-center shadow-sm dark:bg-white/10" aria-label="Progreso de Grammar C1">
            <div className="text-4xl font-black text-primary">{hydrated ? completedQuestions : "…"}<span className="text-xl text-muted-foreground">/{totalQuestions}</span></div>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">preguntas acertadas · {completedDays}/20 días aprobados</p>
          </div>
        </div>
      </section>

      {(selectedTopic || day) ? (
        <div className="space-y-5">
          <Button variant="outline" onClick={() => { setActiveTopicId(null); setActiveDay(null); }}><ArrowLeft className="h-4 w-4" /> Volver al plan</Button>
          <section className="rounded-[2rem] border border-[#c6b7f1] bg-[#f5f0ff] p-5 dark:border-[#6b5b92] dark:bg-[#38304f] sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-xs font-extrabold uppercase tracking-widest text-[#7353ad] dark:text-[#d8c8ff]">{day ? `Día ${day.day} de 20 · ${day.kind === "lesson" ? "Lección" : day.kind === "review" ? "Repaso" : "Reto final"}` : "Práctica libre"}</p><h2 className="mt-1 text-2xl font-black">{day?.title ?? topic.title}</h2>{day && <p className="mt-1 text-sm font-semibold">{day.focus}</p>}<p className="mt-2 max-w-2xl text-sm leading-relaxed"><span className="font-bold">{topic.title}:</span> {topic.rule}</p></div>
              <div className="rounded-2xl bg-white/75 px-4 py-3 text-sm font-bold dark:bg-white/10">🎯 {topic.focus}</div>
            </div>
            <div className="mt-4 rounded-2xl border-l-4 border-[#a88ae5] bg-white/80 p-3 text-sm dark:bg-white/10"><span className="font-bold">Ejemplo:</span> <span lang="en">{topic.example}</span></div>
            <div className="mt-4 flex flex-wrap gap-2">{topic.subtopics.map((subtopic) => <span key={subtopic} className="rounded-full bg-white/75 px-3 py-1 text-xs font-semibold dark:bg-white/10">{subtopic}</span>)}</div>
          </section>

          {finished ? (
            <section className="rounded-[2rem] border border-primary/15 bg-white p-8 text-center shadow-sm dark:bg-card">
              <div className="text-6xl" aria-hidden="true">{roundCorrect >= Math.ceil(roundRefs.length * 0.85) ? "🌟" : "🌱"}</div>
              <h3 className="mt-3 text-2xl font-black">{roundCorrect >= Math.ceil(roundRefs.length * 0.85) ? day ? "¡Día aprobado!" : "¡Ronda completada!" : "¡Practiquemos otra vez!"}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Acertaste {roundCorrect} de {roundRefs.length}. {day ? `Para aprobar este día necesitas ${Math.ceil(roundRefs.length * 0.85)} aciertos. ` : ""}Tu progreso queda guardado en este navegador.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3"><Button onClick={() => day ? startDay(day.day) : startTopic(topic.id)}><RotateCcw className="h-4 w-4" /> Repetir {day ? "día" : "tema"}</Button>{day && day.day < 20 && <Button onClick={() => startDay(day.day + 1)}>Ir al día {day.day + 1} <ArrowRight className="h-4 w-4" /></Button>}<Button variant="outline" onClick={() => { setActiveTopicId(null); setActiveDay(null); }}>Ver el plan</Button></div>
            </section>
          ) : question ? (
            <section className="rounded-[2rem] border border-primary/10 bg-white p-5 shadow-sm dark:bg-card sm:p-8" aria-label="Ejercicio de Grammar C1">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-extrabold uppercase tracking-wider text-primary">Pregunta {position + 1} de {roundRefs.length}</p><p className="text-xs font-semibold text-muted-foreground">{question.kind === "error-word" ? "Tipo 2 · Detecta el error" : "Tipo 1 · Completa la oración"}</p></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[#a88ae5] transition-all" style={{ width: `${((position + 1) / roundRefs.length) * 100}%` }} /></div>
              <p className="mt-6 text-sm font-semibold text-muted-foreground">{question.kind === "error-word" ? "¿Cuál de las cuatro palabras subrayadas está mal?" : "¿Qué opción completa correctamente la oración?"}</p>
              <div className="mt-4 rounded-3xl bg-[#fff9e7] p-5 text-xl font-medium leading-[2] dark:bg-[#4b402b] sm:text-2xl" lang="en">
                {question.kind === "error-word" ? sentenceParts(question.sentence).map((part, index) => part.mark ? (
                  <span key={index} className={cn("mx-0.5 rounded-md border-b-[3px] border-[#ad7ac4] px-0.5 font-bold", selected !== null && part.mark === answerKey && "border-green-600 bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100", selected === part.mark && part.mark !== answerKey && "border-red-600 bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-100")}><span className="mr-1 align-top text-[10px] font-black text-[#7353ad] dark:text-[#e5d4ff]">{part.mark}</span>{part.text}</span>
                ) : <span key={index}>{part.text}</span>) : <>{question.sentence.split("_____")[0]}<span className="mx-1 inline-block min-w-20 border-b-[3px] border-[#ad7ac4] text-center font-bold text-[#7353ad] dark:text-[#e5d4ff]">{selected ? question.choices[labels.indexOf(answerKey!)] : "?"}</span>{question.sentence.split("_____")[1]}</>}
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2" aria-label="Opciones de respuesta">{labels.map((mark, index) => {
                const option = question.kind === "error-word" ? wordOptions[index]?.text : question.choices[index];
                return <Button key={mark} type="button" variant={selected === mark ? "default" : "outline"} disabled={selected !== null} onClick={() => answer(mark)} aria-label={`Opción ${mark}: ${option}`} className={cn("h-auto min-h-12 justify-start whitespace-normal px-4 py-3 text-left", selected !== null && mark === answerKey && "border-green-600 bg-green-100 text-green-900 opacity-100 dark:bg-green-900/50 dark:text-green-100") }><span className="mr-3 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-xs font-black">{mark}</span><span lang="en">{option}</span></Button>;
              })}</div>
              {selected && (
                <div role="status" className={cn("mt-6 rounded-2xl border p-4", selected === answerKey ? "border-green-300 bg-green-50 dark:bg-green-950/40" : "border-amber-300 bg-amber-50 dark:bg-amber-950/40")}>
                  <p className="font-extrabold">{selected === answerKey ? "¡Exacto! 🥳" : question.kind === "error-word" ? `Casi. La palabra incorrecta es ${answerKey}: «${wordOptions[labels.indexOf(answerKey!)]?.text}». 💡` : `Casi. La opción correcta es ${answerKey}: «${question.choices[labels.indexOf(answerKey!)]}». 💡`}</p>
                  <p className="mt-2 text-sm leading-relaxed">{question.explanation}</p>
                  <CoachHelpButton skill="Grammar" question={question.sentence} explanation={question.explanation} />
                  {position === 2 && <div className="mt-4"><PracticeMoment question={question.sentence} explanation={question.explanation} /></div>}
                  <p className="mt-2 rounded-xl bg-white/70 p-3 text-sm dark:bg-white/10"><span className="font-bold">Oración correcta:</span> <span lang="en">{question.kind === "error-word" ? correctedSentence(question) : completedSentence(question)}</span></p>
                  <Button className="mt-4" onClick={next}>{position === roundRefs.length - 1 ? "Ver mi resultado" : "Siguiente pregunta"}<ArrowRight className="h-4 w-4" /></Button>
                </div>
              )}
            </section>
          ) : null}
        </div>
      ) : (
        <>
          <section className="rounded-[2rem] border border-[#efbd7a] bg-gradient-to-r from-[#fff0cf] to-[#fff9e9] p-5 dark:border-[#766041] dark:from-[#574327] dark:to-[#493c2b] sm:p-7">
            <div className="flex items-start gap-4"><span className="text-5xl" aria-hidden="true">🗓️</span><div><p className="text-xs font-extrabold uppercase tracking-widest text-[#96601b] dark:text-[#f8d39a]">Tu ruta intensiva</p><h2 className="mt-1 text-2xl font-black">20 días para fortalecer todo tu Grammar</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed">Los días 1–4 atacan subject–verb agreement, tu dificultad principal; del 5 al 16 cubres los otros 12 temas; del 17 al 20 mezclas y compruebas lo aprendido. Puedes repetir cualquier día: desde ahora se aprueba con al menos 85 % de aciertos. Los días que ya aprobaste se conservan.</p><Button className="mt-4" onClick={() => startDay(grammarC1Days.find((item) => !dayProgress[item.day]?.completedAt)?.day ?? 20)}>{completedDays === 0 ? "Empezar día 1" : `Continuar día ${grammarC1Days.find((item) => !dayProgress[item.day]?.completedAt)?.day ?? 20}`} <ArrowRight className="h-4 w-4" /></Button></div></div>
          </section>
          <section id="plan-20-dias" className="space-y-4" aria-label="Plan de Grammar C1 de 20 días">
            <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="flex items-center gap-2 text-2xl font-black"><CalendarDays className="h-6 w-6 text-[#8052aa]" /> Tu plan día por día</h2><p className="mt-1 text-sm text-muted-foreground">Lección, práctica y corrección inmediata. Repite los días difíciles sin perder el avance.</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{completedDays}/20 días aprobados</span></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{grammarC1Days.map((item) => {
              const result = dayProgress[item.day];
              const passed = Boolean(result?.completedAt);
              return <article key={item.day} className={cn("flex flex-col rounded-3xl border p-4 shadow-sm", passed ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30" : "border-primary/10 bg-white dark:bg-card")}>
                <div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#efe5ff] text-sm font-black text-[#7353ad] dark:bg-[#44345f] dark:text-[#e5d4ff]">{item.day}</span><span className={cn("rounded-full px-2 py-1 text-[11px] font-bold", passed ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-muted text-muted-foreground")}>{passed ? <span className="inline-flex items-center gap-1"><Check className="h-3 w-3" /> Aprobado</span> : item.kind === "lesson" ? "Lección" : item.kind === "review" ? "Repaso" : "Reto final"}</span></div>
                <h3 className="mt-3 text-sm font-extrabold">Día {item.day}: {item.title}</h3><p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{item.focus}</p><p className="mt-3 text-[11px] font-semibold text-muted-foreground">{item.refs.length} preguntas{result ? ` · mejor ${result.bestCorrect}/${result.total}` : ""}</p><Button className="mt-2 w-full" variant={passed ? "outline" : "default"} onClick={() => startDay(item.day)}>{passed ? "Repasar" : result ? "Reintentar" : "Empezar"}<ArrowRight className="h-4 w-4" /></Button>
              </article>;
            })}</div>
          </section>
          <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-2xl font-black">Tu mapa de temas C1</h2><p className="mt-1 text-sm text-muted-foreground">Cada tarjeta tiene una mini lección y práctica mixta: completar y detectar errores.</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{grammarC1Topics.length} temas · {totalQuestions} preguntas</span></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{grammarC1Topics.map((item, index) => {
            const completed = topicProgress[item.id]?.completedIds.length ?? 0;
            return <article key={item.id} className="flex flex-col rounded-3xl border border-primary/10 bg-white p-5 shadow-sm dark:bg-card"><div className="flex items-start justify-between gap-2"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f3eafd] text-lg font-black text-[#7b57ae] dark:bg-[#46345f]">{index === 0 ? <Target className="h-5 w-5" /> : index + 1}</div><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold">{hydrated ? completed : "…"}/{item.questions.length}</span></div><h3 className="mt-4 text-lg font-extrabold">{item.title}</h3><p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{item.focus}</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[#b38ad1]" style={{ width: `${(completed / item.questions.length) * 100}%` }} /></div><Button className="mt-4 w-full" variant={index === 0 ? "default" : "outline"} onClick={() => startTopic(item.id)}>{completed > 0 ? "Continuar" : "Explorar tema"}<ArrowRight className="h-4 w-4" /></Button></article>;
          })}</div>
        </>
      )}

      <aside className="rounded-2xl border border-primary/10 bg-muted/35 p-4 text-xs leading-relaxed text-muted-foreground"><p className="flex items-center gap-2 font-bold"><CircleHelp className="h-4 w-4" /> Cómo se relaciona con el examen</p><p className="mt-1">La sección Grammar de iTEP Academic incluye 13 preguntas para completar oraciones y 12 para identificar errores. Aquí entrenas ambos formatos con material original y explicaciones; no es una certificación C1. <a className="underline" href="https://www.itepexam.com/wp-content/uploads/2023/07/web_Academic-brochure.pdf" target="_blank" rel="noopener noreferrer">Ver folleto oficial de iTEP</a>.</p></aside>
    </main>
  );
}
