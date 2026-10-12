"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight, Brain, Check, Lightbulb } from "lucide-react";
import { useStudyOverview } from "@/lib/learning/useStudyOverview";
import { dateKey, type RecallRecord } from "@/lib/learning/model";
import { recallForDay } from "@/lib/learning/recall";
import { recordLearningActivity, useLearningStore } from "@/lib/learning/store";
import { useErrorNotebookStore } from "@/lib/notebook/store";
import { CoachHelpButton } from "./CoachHelpButton";

export function RecallPractice() {
  const overview = useStudyOverview();
  if (!overview.ready) return <p role="status" className="mx-auto px-4 py-10">Preparando tu reto…</p>;
  return <RecallSession key={`${overview.profileKey}:${dateKey(overview.now)}`} />;
}

function RecallSession() {
  const { learning, now, profileKey, student, nextDaily } = useStudyOverview();
  const day = dateKey(now);
  const challenge = recallForDay(day);
  const saved = learning.recalls?.[day];
  const [showOptions, setShowOptions] = useState(Boolean(saved));
  const [prediction, setPrediction] = useState(saved?.prediction ?? "");
  const [confidence, setConfidence] = useState<RecallRecord["confidence"]>(saved?.confidence ?? "between");
  const lock = useRef(false);
  const correct = saved?.selectedIndex === challenge.correctIndex;
  function answer(index: number) {
    if (saved || lock.current) return;
    lock.current = true;
    useLearningStore.getState().saveRecall(profileKey, day, { questionId: challenge.id, prediction: prediction.trim(), confidence, selectedIndex: index, reflection: "", answeredAt: new Date().toISOString() });
    void recordLearningActivity(student?.username ?? null, { id: `${challenge.id}:${day}`, kind: "question", skill: "grammar", label: `Reto de recuperación · ${challenge.topic.title}` });
    if (index !== challenge.correctIndex) useErrorNotebookStore.getState().recordAttempt(`${profileKey}:${day}:${challenge.id}`, student?.username ?? null, [{ section: "Grammar", failed_rule: `${challenge.topic.title}: ${challenge.question.explanation}` }]);
  }
  return <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10">
    <Link href="/" className="text-sm font-semibold underline underline-offset-4">← Mi espacio</Link>
    <header><p className="study-eyebrow flex items-center gap-2"><Brain size={15} /> RETO DE 3 MINUTOS · GRAMMAR</p><h1 className="mt-3 text-3xl sm:text-4xl">Primero recuerda. Después descubre.</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Un tema distinto cada día entre los 13 de tu ruta. Intenta recuperar la regla antes de ver alternativas; luego contrasta tu razonamiento. Práctica original, no una pregunta oficial ni una prueba de nivel.</p></header>
    <section className="rounded-[2rem] border border-primary/15 bg-gradient-to-br from-[#eee8f5] via-[#fff8ed] to-[#edf3ea] p-5 sm:p-8">
      <p className="study-eyebrow">{challenge.topic.title} · {new Date(now).toLocaleDateString("es-CO", { day: "numeric", month: "long" })}</p>
      <p className="mt-5 text-sm font-semibold">{challenge.question.kind === "error-word" ? "Hay una palabra incorrecta entre las cuatro marcadas. ¿Cuál y cómo la corregirías?" : "Completa el espacio con la forma que encaja en esta oración."}</p>
      <p className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-5 text-lg leading-loose" lang="en">{challenge.parts.map((part, index) => part.mark ? <span key={index} className="mx-0.5 rounded border-b-2 border-primary/40 bg-primary/5 px-1">{part.text}<sup className="ml-1 text-[10px] font-bold">{part.mark}</sup></span> : <span key={index}>{part.text}</span>)}</p>
      {!showOptions && <div className="mt-5 space-y-4">
        <div><label htmlFor="recall-prediction" className="text-sm font-semibold">Mi hipótesis (opcional)</label><input id="recall-prediction" maxLength={500} value={prediction} onChange={(event) => setPrediction(event.target.value)} placeholder="Creo que la forma correcta es… porque…" className="mt-2 block w-full rounded-xl border bg-white/80 p-3 text-sm" /><p className="mt-2 text-xs text-muted-foreground">No se califica automáticamente ni se envía a la IA. Es una pista para observar cómo piensas.</p></div>
        <fieldset><legend className="mb-2 text-sm font-semibold">¿Cómo te sientes con tu respuesta?</legend><div className="flex flex-wrap gap-2">{([["sure", "Lo tengo claro"], ["between", "Dudo entre opciones"], ["guess", "Estoy explorando"]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={confidence === value} onClick={() => setConfidence(value)} className={`rounded-full border px-3 py-2 text-xs ${confidence === value ? "bg-primary text-primary-foreground" : "bg-white/70"}`}>{label}</button>)}</div></fieldset>
        <button onClick={() => setShowOptions(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Contrastar con las opciones<ArrowRight size={15} /></button>
      </div>}
      {showOptions && <div className="mt-5 grid gap-2 sm:grid-cols-2">{challenge.options.map((option, index) => <button key={index} disabled={Boolean(saved)} onClick={() => answer(index)} className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm ${saved && index === challenge.correctIndex ? "border-[#709778] bg-[#e0eddd] text-[#35563c]" : saved?.selectedIndex === index ? "border-primary/50 bg-accent/40" : "bg-white/75 hover:bg-white"}`}><span className="font-mono font-semibold">{"ABCD"[index]}.</span><span lang="en">{option}</span>{saved && index === challenge.correctIndex && <Check size={16} className="ml-auto" />}</button>)}</div>}
    </section>
    {saved && <section aria-label="Descubrimiento del reto" className="study-card">
      <p className="study-eyebrow flex items-center gap-2"><Lightbulb size={14} /> {correct ? "ENCONTRASTE LA PISTA" : "TU ERROR YA ES UNA PISTA"}</p>
      <h2 className="mt-2 text-xl">{correct ? saved.confidence === "guess" ? "Acertaste. Ahora comprueba la razón." : "Ahora explica por qué funciona." : saved.confidence === "sure" ? "Esta era una trampa convincente. Vamos a desarmarla." : "Aquí está lo que faltaba conectar."}</h2>
      <p className="mt-3 text-sm leading-relaxed">{challenge.question.explanation}</p>
      <p lang="en" className="mt-4 rounded-xl border-l-2 border-[#709778] bg-[#edf3ea] p-4 text-sm">{challenge.solution}</p>
      {saved.prediction && <p className="mt-4 text-xs text-muted-foreground">Tu hipótesis: «{saved.prediction}». Compárala con la regla, no solo con la letra de la respuesta.</p>}
      <label htmlFor="recall-reflection" className="mt-5 block text-sm font-semibold">La próxima vez buscaré…</label>
      <textarea id="recall-reflection" value={saved.reflection} onChange={(event) => useLearningStore.getState().reflectRecall(profileKey, day, event.target.value)} maxLength={600} rows={2} placeholder="Escribe una pista que quieras recordar." className="mt-2 w-full rounded-xl border bg-background p-3 text-sm" />
      <p className="mt-2 text-xs text-muted-foreground">Reflexión guardada en tu perfil local. Puedes volver a leerla hoy. Solo la primera respuesta del reto suma actividad.</p>
      <CoachHelpButton skill="Grammar" question={challenge.parts.map((part) => part.text).join("")} explanation={challenge.question.explanation} />
      {!correct && <p className="mt-4 text-sm">Esta regla se añadió a tu <Link href="/cuaderno-errores" className="font-semibold underline">Cuaderno de Errores</Link> para entrenarla.</p>}
      <div className="mt-6 flex flex-wrap gap-4"><Link href={`/practica-diaria/${nextDaily}`} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Seguir con las cinco habilidades</Link><Link href="/" className="self-center text-sm font-semibold underline">Por hoy, esto fue suficiente</Link></div>
    </section>}
    {Object.keys(learning.recalls ?? {}).some((savedDay) => savedDay !== day) && <details className="study-card"><summary className="cursor-pointer text-sm font-semibold">Mis descubrimientos anteriores</summary><p className="mt-3 text-xs text-muted-foreground">Tus últimas siete pistas personales. Intenta recordar la regla antes de leer tu nota.</p><ul className="mt-4 space-y-3">{Object.entries(learning.recalls ?? {}).filter(([savedDay]) => savedDay !== day).sort(([a], [b]) => b.localeCompare(a)).slice(0, 7).map(([savedDay, record]) => <li key={savedDay} className="rounded-xl bg-muted/50 p-3 text-sm"><p className="text-xs font-semibold">{savedDay} · {recallForDay(savedDay).topic.title}</p><p className="mt-2">{record.reflection || "Aún no escribiste una pista para este reto."}</p></li>)}</ul></details>}
  </div>;
}
