"use client";

import { useState } from "react";
import Link from "next/link";
import type { StructureLesson } from "@/lib/content/c1-lab/types";
import { labKey, structureReview } from "@/lib/content/c1-lab/review";
import { dateKey } from "@/lib/learning/model";
import { useDailyProgressStore } from "@/lib/content/daily/progress";
import { useActiveProfile } from "@/lib/storage/profileRepo";
import { useLearningContext } from "./LearningProvider";
import { recordLearningActivity } from "@/lib/learning/store";
import { recordCompletedAttempt } from "@/lib/notebook/store";
import { QuestionBlock } from "@/components/daily/DailySessionPractice";
import { Button } from "@/components/ui/button";

export function StructureTrainer({ lesson }: { lesson: StructureLesson }) {
  const profile = useActiveProfile();
  const { now } = useLearningContext();
  return <StructureContent key={`${profile?.username ?? "guest"}:${lesson.id}:${dateKey(now)}`} lesson={lesson} />;
}
function StructureContent({ lesson }: { lesson: StructureLesson }) {
  const profile = useActiveProfile();
  const { ready, now } = useLearningContext();
  const days = useDailyProgressStore((state) => state.days);
  const today = dateKey(now);
  const review = structureReview(days, profile?.username ?? null, lesson, today);
  const key = `${labKey(profile?.username ?? null, lesson.id)}:structure:${today}`;
  const progress = days[key];
  const form = progress?.structureRound?.form ?? review.nextForm;
  const items = lesson.questions.slice(form * 3, form * 3 + 3);
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const store = useDailyProgressStore;
  const answered = items.filter((_, i) => progress?.answers[`grammar-${i}`] !== undefined).length;
  const correct = items.filter((item, i) => progress?.answers[`grammar-${i}`] === item.correctIndex).length;
  function start() { store.getState().prepareStructure(key, form); setOpen(true); }
  async function finish() {
    if (answered !== 3 || progress?.completedAt || busy) return;
    setBusy(true); setError("");
    try {
      await recordCompletedAttempt(`lab:${key}`, profile?.username ?? null, items.filter((item, i) => progress?.answers[`grammar-${i}`] !== item.correctIndex).map((item) => ({ section: "Grammar" as const, failed_rule: `${lesson.title}: ${item.explanation}` })));
      store.getState().complete(key);
      await recordLearningActivity(profile?.username ?? null, { id: `lab:${key}`, kind: "round", skill: "grammar", label: `Estructuras: ${lesson.title}` });
    } catch { setError("No se pudo guardar el repaso. Intenta de nuevo antes de salir."); }
    finally { setBusy(false); }
  }
  if (!ready) return <p role="status">Recuperando tus repasos…</p>;
  return <section className="space-y-5 rounded-[2rem] border border-primary/20 bg-gradient-to-br from-[#fff0cf] to-[#f7edf4] p-5 sm:p-7" aria-label="Taller de estructuras">
    <div><p className="study-eyebrow">🧩 ENTENDER → RECORDAR → USAR</p><h2 className="mt-2 text-2xl">{lesson.title}</h2><p className="mt-2 text-sm">{lesson.purpose}</p></div>
    <div className="grid gap-2 sm:grid-cols-3">{lesson.timeline.map((step, i) => <div key={step} className="rounded-2xl border border-primary/10 bg-white/75 p-3"><span className="text-xs font-bold text-primary">0{i + 1}</span><p className="mt-1 text-sm" lang="en">{step}</p></div>)}</div>
    <p className="text-sm leading-relaxed">{lesson.rule}</p>
    <div className="grid gap-3 sm:grid-cols-2">{lesson.contrast.map((text) => <p key={text} lang="en" className="rounded-2xl bg-white/75 p-4 text-sm leading-relaxed">{text}</p>)}</div>
    <p className="text-xs">Repaso espaciado: 1, 3, 7 y 14 días tras aciertos sin modelo; un fallo o usar el modelo devuelve el próximo repaso a mañana. Repetimos dos formularios: esto mide práctica de estas estructuras, no certifica C1.</p>
    <div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold">{review.todayDone ? `Hoy: ${review.rounds.at(-1)?.correct}/3${review.rounds.at(-1)?.assisted ? " · con modelo" : " · sin modelo"}` : review.isDue ? "🌱 Tu repaso está listo" : `Próximo repaso: ${review.due}`}</span><span className="text-xs">{review.stage}/4 pasos de recuperación sin modelo</span></div>
    {!open && <Button onClick={start} disabled={!review.isDue && !review.todayDone}>{review.todayDone ? "Ver mi repaso guardado" : "Empezar recuperación activa"}</Button>}
    {open && <div className="space-y-4 rounded-2xl border bg-background/85 p-4">
      <h3 className="font-semibold">Primero produce, después comprueba</h3><p className="text-sm">{lesson.retrieval}</p>
      <textarea aria-label="Mi recuperación de la estructura" className="min-h-24 w-full rounded-xl border bg-background p-3 text-sm" maxLength={2000} value={progress?.writingText ?? ""} disabled={Boolean(progress?.completedAt)} onChange={(event) => store.getState().setWriting(key, event.target.value)} />
      <p className="text-xs text-muted-foreground">Este borrador se guarda, pero no se autocorrige ni se puntúa: puede haber varias formulaciones válidas. La prueba objetiva son las tres preguntas siguientes.</p>
      <Button variant="outline" onClick={() => { setModel(!model); if (!progress?.completedAt) store.getState().revealStructure(key); }}>{model ? "Ocultar modelo" : "Ver modelo (repaso con apoyo)"}</Button>
      {model && <p lang="en" className="rounded-xl bg-primary/5 p-3 text-sm">{lesson.model}</p>}
      {items.map((item, i) => <QuestionBlock key={`${form}:${i}`} item={item} id={`grammar-${i}`} selected={progress?.answers[`grammar-${i}`]} onAnswer={(id, index) => { store.getState().answer(key, id, index); void recordLearningActivity(profile?.username ?? null, { id: `lab:${key}:${id}`, kind: "question", skill: "grammar", label: lesson.title }); }} />)}
      {progress?.completedAt ? <p role="status" className="text-sm">Guardado: {correct}/3. {correct < 3 ? "La estructura necesita otra oportunidad, no más presión." : progress.structureRound?.assisted ? "Buen repaso con apoyo. Mañana intentamos sin modelo." : "¡Recuperaste la estructura sin modelo! Ahora úsala al hablar."}</p> : <Button disabled={answered !== 3 || busy} onClick={finish}>{busy ? "Guardando…" : "Guardar mi repaso"}</Button>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <Link href={`/laboratorio-c1/practica/${lesson.id}-speaking-1`} className="block text-sm font-semibold underline">🎙️ Llevar esta estructura a una respuesta oral →</Link>
    </div>}
  </section>;
}
