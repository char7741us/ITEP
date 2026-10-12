"use client";

import Link from "next/link";
import { useState } from "react";
import { c1Modules, productiveTasks } from "@/lib/content/c1-lab/bank";
import type { LabModule } from "@/lib/content/c1-lab/types";
import { labKey, structureReview } from "@/lib/content/c1-lab/review";
import { dateKey } from "@/lib/learning/model";
import { useDailyProgressStore } from "@/lib/content/daily/progress";
import { useActiveProfile } from "@/lib/storage/profileRepo";
import { useLearningContext } from "./LearningProvider";
import { StructureTrainer } from "./StructureTrainer";
import { AccentListeningPlayer } from "@/components/daily/AccentListeningPlayer";
import { QuestionBlock } from "@/components/daily/DailySessionPractice";
import { recordCompletedAttempt } from "@/lib/notebook/store";
import { comprehensionRule } from "@/lib/notebook/failedRules";
import { recordLearningActivity } from "@/lib/learning/store";
import { Button } from "@/components/ui/button";

export function C1Lab() {
  const profile = useActiveProfile();
  const { ready, now } = useLearningContext();
  const days = useDailyProgressStore((state) => state.days);
  const [filter, setFilter] = useState<"all" | "due" | "speaking" | "writing">("all");
  const due = c1Modules.filter((module) => structureReview(days, profile?.username ?? null, module.lesson, dateKey(now)).isDue);
  return <div className="mx-auto w-full max-w-6xl space-y-7 px-4 py-9">
    <section className="study-hero rounded-[2rem] border border-primary/10 p-6 sm:p-9"><p className="study-eyebrow">TU PUENTE ENTRE SABER Y HABLAR</p><h1 className="mt-3 text-4xl sm:text-5xl">Laboratorio <span className="font-signature italic">rumbo a C1</span></h1><p className="mt-4 max-w-2xl text-sm leading-relaxed">Si reconoces una regla pero se desarma al hablar, no necesitas otra lista interminable: necesitas recuperarla y usarla. Aquí vuelves a los tiempos, produces una respuesta y la mejoras con una segunda toma.</p><div className="mt-5 flex flex-wrap gap-2">{["12 talleres de estructuras", "12 lecturas originales", "12 diálogos · 5 acentos solicitables", "48 consignas orales", "24 consignas escritas"].map((label) => <span key={label} className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold">{label}</span>)}</div></section>
    <section className="grid gap-3 md:grid-cols-3" aria-label="Rutina sugerida"><div className="rounded-2xl border bg-[#e9f1e8] p-5"><p className="font-semibold">🧩 5 min · Recupera</p><p className="mt-2 text-sm">Un contraste de tiempos, una frase sin pistas y tres decisiones justificadas. Empieza con Present/Past, después Past perfect.</p></div><div className="rounded-2xl border bg-[#f6e8ef] p-5"><p className="font-semibold">🎙️ 7 min · Usa y corrige</p><p className="mt-2 text-sm">Primera toma → detecta un error → repara una frase → segunda toma. Conserva ambas; compara el mismo tema, no notas de tareas distintas.</p></div><div className="rounded-2xl border bg-[#fff1d1] p-5"><p className="font-semibold">🌍 5 min · Comprende</p><p className="mt-2 text-sm">Alterna lectura y Listening. Norteamérica es la sugerencia mayoritaria; otros acentos amplían tu práctica, no predicen el examen.</p></div></section>
    <aside className="rounded-2xl border p-4 text-sm leading-relaxed">Una nota más baja en una tarea diferente no demuestra un retroceso. C1 requiere precisión, fluidez y variedad sostenidas, no acumular XP ni terminar un plan. Aquí distingues repasos con/sin modelo y comparas dos respuestas a la misma consigna. Para comprobar retención, vuelve otro día y prueba una consigna nueva.</aside>
    <div className="flex flex-wrap gap-2" aria-label="Filtrar laboratorio">{([["all", "Todos los talleres"], ["due", `Para repasar (${ready ? due.length : "…"})`], ["speaking", "Banco Speaking · 48"], ["writing", "Banco Writing · 24"]] as const).map(([id, label]) => <Button key={id} variant={filter === id ? "default" : "outline"} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</Button>)}</div>
    {(filter === "all" || filter === "due") ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{(filter === "due" ? due : c1Modules).map((module, i) => {
      const review = structureReview(days, profile?.username ?? null, module.lesson, dateKey(now));
      return <article key={module.id} className="flex flex-col rounded-3xl border border-primary/10 bg-white p-5"><p className="study-eyebrow">TALLER {String(c1Modules.indexOf(module) + 1).padStart(2, "0")} · {i < 3 ? "⏳" : "🌱"}</p><h2 className="mt-3 text-lg">{module.lesson.title}</h2><p className="mt-2 flex-1 text-sm text-muted-foreground">{module.lesson.purpose}</p><p className="mt-3 text-xs">Lectura y diálogo: {module.title}</p><p className="mt-3 text-xs font-semibold">{!ready ? "Recuperando avances…" : review.todayDone ? `Hoy guardado · próximo ${review.due}` : review.isDue ? "Listo para recuperar" : `Repaso: ${review.due}`}</p><Link href={`/laboratorio-c1/${module.id}`} className="mt-4 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground">Entrar al taller →</Link></article>;
    })}{filter === "due" && due.length === 0 && <p role="status">Tus repasos están al día. Prueba una consigna oral nueva o vuelve mañana.</p>}</div> : <div className="grid gap-3 md:grid-cols-2">{productiveTasks.filter((task) => task.skill === filter).map((task, i) => <article key={task.id} className="rounded-2xl border bg-white p-5"><p className="study-eyebrow">{filter.toUpperCase()} {i + 1} · TAREA {task.taskNumber}</p><h2 className="mt-2 text-base">{task.title}</h2><p lang="en" className="mt-2 text-sm leading-relaxed">{task.prompt}</p><Link href={`/laboratorio-c1/practica/${task.id}`} className="mt-3 inline-block text-sm font-semibold underline">Practicar y mejorar mi respuesta →</Link></article>)}</div>}
    <footer className="space-y-2 text-xs leading-relaxed text-muted-foreground"><p>Material original independiente. Las tareas siguen los rangos y tiempos de práctica del formato iTEP Academic-Plus; no son preguntas oficiales ni una certificación de nivel.</p><p>El repaso espaciado y la recuperación activa se apoyan en la <a className="underline" href="https://ies.ed.gov/ncee/wwc/PracticeGuide/1" target="_blank" rel="noreferrer">guía de aprendizaje del IES</a>. La meta de precisión, fluidez y coherencia se orienta por los <a className="underline" href="https://www.coe.int/en/web/common-european-framework-reference-languages/table-3-cefr-3.3-common-reference-levels-qualitative-aspects-of-spoken-language-use" target="_blank" rel="noreferrer">descriptores del MCER</a>. El calendario es una decisión de diseño, no una fórmula garantizada.</p><Link href="/mis-datos" className="inline-block underline">Descargar copia de mis borradores, repasos y grabaciones</Link></footer>
  </div>;
}

export function C1ModulePractice({ module }: { module: LabModule }) {
  const profile = useActiveProfile();
  return <ModuleContent key={`${profile?.username ?? "guest"}:${module.id}`} module={module} />;
}
function ModuleContent({ module }: { module: LabModule }) {
  const profile = useActiveProfile();
  const { ready } = useLearningContext();
  const key = `${labKey(profile?.username ?? null, module.id)}:comprehension`;
  const progress = useDailyProgressStore((state) => state.days[key]);
  const [transcript, setTranscript] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function saveErrors() {
    if (busy || progress?.completedAt) return;
    setBusy(true); setError("");
    try {
      await recordCompletedAttempt(`lab:${key}`, profile?.username ?? null, (["Reading", "Listening"] as const).flatMap((section) => module[section === "Reading" ? "reading" : "listening"].questions.filter((item, i) => progress?.answers[`${section.toLowerCase()}-${i}`] !== item.correctIndex).map((item) => ({ section, failed_rule: comprehensionRule(section, item.prompt) }))));
      useDailyProgressStore.getState().complete(key);
    } catch { setError("No se pudieron registrar los errores. Intenta de nuevo."); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-9"><Link href="/laboratorio-c1" className="text-sm underline">← Todos los talleres</Link><h1 className="text-3xl">{module.title}</h1><StructureTrainer lesson={module.lesson} />
    <section className="space-y-4 rounded-3xl border bg-white p-5"><h2 className="text-2xl">📖 Reading · lee entre líneas</h2><article lang="en" className="whitespace-pre-line text-sm leading-[1.85]">{module.reading.passage}</article>{ready && module.reading.questions.map((item, i) => <QuestionBlock key={i} item={item} id={`reading-${i}`} selected={progress?.answers[`reading-${i}`]} referenceText={module.reading.passage} onAnswer={answer} />)}</section>
    <section className="space-y-4 rounded-3xl border bg-white p-5"><h2 className="text-2xl">🌍 Listening · misma idea, otro acento</h2><AccentListeningPlayer source="lab" id={module.id} day={c1Modules.findIndex((item) => item.id === module.id) + 1} />{ready && module.listening.questions.map((item, i) => <QuestionBlock key={i} item={item} id={`listening-${i}`} selected={progress?.answers[`listening-${i}`]} referenceText={module.listening.lines.map((line) => `${line.speaker}: ${line.text}`).join("\n")} onAnswer={answer} />)}<Button variant="outline" onClick={() => setTranscript(!transcript)}>{transcript ? "Ocultar" : "Comprobar"} transcripción</Button>{transcript && <div lang="en" className="space-y-2 text-sm leading-relaxed">{module.listening.lines.map((line, i) => <p key={i}><strong>{line.speaker}: </strong>{line.text}</p>)}</div>}</section>
    <Button disabled={!ready || busy || Object.keys(progress?.answers ?? {}).length !== 6 || Boolean(progress?.completedAt)} onClick={saveErrors}>{progress?.completedAt ? "Comprensión guardada en mi cuaderno" : busy ? "Guardando…" : "Guardar errores de comprensión"}</Button>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <section className="space-y-3 rounded-3xl border bg-[#f7edf4] p-5"><h2 className="text-2xl">Ahora conviértelo en tu inglés</h2><p className="text-sm">Haz una respuesta, repara un error concreto y vuelve a producirla. No memorices una respuesta modelo completa.</p>{productiveTasks.filter((task) => task.moduleId === module.id).map((task, i) => <Link key={task.id} href={`/laboratorio-c1/practica/${task.id}`} className="block rounded-xl border bg-white p-3 text-sm font-semibold">{task.skill === "speaking" ? "🎙️ Speaking" : "✍️ Writing"} · Tarea {task.taskNumber} · Opción {task.skill === "speaking" ? i + 1 : i - 3} →</Link>)}</section>
  </div>;
  function answer(id: string, index: number) {
    useDailyProgressStore.getState().answer(key, id, index);
    void recordLearningActivity(profile?.username ?? null, { id: `lab:${key}:${id}`, kind: "question", skill: id.startsWith("reading") ? "reading" : "listening", label: module.title });
  }
}
