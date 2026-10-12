"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ProductiveTask } from "@/lib/content/c1-lab/bank";
import { productiveTasks } from "@/lib/content/c1-lab/bank";
import { labKey } from "@/lib/content/c1-lab/review";
import { useActiveProfile } from "@/lib/storage/profileRepo";
import { useDailyProgressStore } from "@/lib/content/daily/progress";
import { getSpeakingAudio, saveSpeakingAudio } from "@/lib/storage/attemptsRepo";
import { startTimedRecording, type RecordingHandle } from "@/lib/audio/recorder";
import { requestGrade } from "@/lib/exam/grade-request";
import { saveProductiveFeedback } from "@/lib/notebook/store";
import { recordLearningActivity } from "@/lib/learning/store";
import { useLearningContext } from "./LearningProvider";
import { GradeResult } from "@/components/daily/DailySessionPractice";
import { Button } from "@/components/ui/button";

function SavedAudio({ audioKey, label }: { audioKey?: string; label: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true; let objectUrl: string | null = null;
    if (audioKey) getSpeakingAudio(audioKey).then((blob) => {
      if (!active) return;
      if (!blob) { setError("Esta grabación no está en el navegador. Si importaste una copia sin audios, vuelve a grabar."); return; }
      objectUrl = URL.createObjectURL(blob); setUrl(objectUrl);
    }).catch(() => { if (active) setError("No se pudo recuperar la grabación."); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [audioKey]);
  return url ? <audio controls src={url} className="w-full" aria-label={label} /> : error ? <p role="alert" className="text-xs text-red-700">{error}</p> : null;
}

export function ProductiveTrainer({ task }: { task: ProductiveTask }) {
  const profile = useActiveProfile();
  return <TrainerContent key={`${profile?.username ?? "guest"}:${task.id}`} task={task} />;
}
function TrainerContent({ task }: { task: ProductiveTask }) {
  const profile = useActiveProfile();
  const { ready } = useLearningContext();
  const base = labKey(profile?.username ?? null, task.id);
  const days = useDailyProgressStore((state) => state.days);
  const store = useDailyProgressStore;
  const [activeTake, setActiveTake] = useState<1 | 2 | null>(null);
  const [starting, setStarting] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [frame, setFrame] = useState(false);
  const [prepEnds, setPrepEnds] = useState<number | null>(null);
  const [prepSeconds, setPrepSeconds] = useState(0);
  const owner = useRef(base);
  const recorder = useRef<RecordingHandle | null>(null);
  const lock = useRef(false);
  const grading = useRef(false);
  const minWords = task.taskNumber === 1 ? 50 : 175;
  const maxWords = task.taskNumber === 1 ? 75 : 225;
  const responseSeconds = task.taskNumber === 1 ? 45 : 60;
  const first = days[`${base}:take:1`];
  const second = days[`${base}:take:2`];
  const firstGrade = task.skill === "speaking" ? first?.speakingGrade : first?.writingGrade;
  const secondGrade = task.skill === "speaking" ? second?.speakingGrade : second?.writingGrade;
  const next = productiveTasks.find((item) => item.moduleId === task.moduleId && item.skill === task.skill && item.id !== task.id && item.taskNumber === task.taskNumber)
    ?? productiveTasks.find((item) => item.moduleId !== task.moduleId && item.skill === task.skill && item.taskNumber === task.taskNumber);
  useEffect(() => {
    owner.current = base;
    return () => { owner.current = ""; recorder.current?.cancel(); };
  }, [base]);
  useEffect(() => {
    if (!prepEnds) return;
    const update = () => setPrepSeconds(Math.max(0, Math.ceil((prepEnds - Date.now()) / 1000)));
    update(); const timer = setInterval(update, 250); return () => clearInterval(timer);
  }, [prepEnds]);
  async function record(take: 1 | 2) {
    if (lock.current || grading.current) return;
    lock.current = true; setStarting(true); setError("");
    try {
      const handle = await startTimedRecording(responseSeconds, setSeconds, () => { void stop(take); });
      if (owner.current !== base) { handle.cancel(); return; }
      recorder.current = handle; setActiveTake(take); setSeconds(0);
    } catch { if (owner.current === base) { lock.current = false; setError("No se pudo activar el micrófono. Revisa el permiso y vuelve a intentar; los borradores siguen guardados."); } }
    finally { if (owner.current === base) setStarting(false); }
  }
  async function stop(take: 1 | 2) {
    const handle = recorder.current;
    if (!handle) return;
    recorder.current = null;
    setActiveTake(null); setStarting(true);
    try {
      const blob = await handle.stop();
      if (blob.size < 1000) throw new Error("La grabación está vacía. Intenta de nuevo.");
      if (blob.size > 2_200_000) throw new Error("La grabación supera el límite de evaluación. Graba una respuesta más corta.");
      if (owner.current !== base) return;
      const audioKey = `lab:${base}:take:${take}:${crypto.randomUUID()}`;
      await saveSpeakingAudio(audioKey, blob);
      if (owner.current !== base) return;
      store.getState().setSpeakingAudio(`${base}:take:${take}`, audioKey);
      await recordLearningActivity(profile?.username ?? null, { id: `lab:${base}:take:${take}`, kind: "speaking", skill: "speaking", label: `${task.title} · toma ${take}` });
    } catch (cause) { if (owner.current === base) setError(cause instanceof Error ? cause.message : "No se pudo guardar la toma."); }
    finally { lock.current = false; if (owner.current === base) setStarting(false); }
  }
  async function evaluate(take: 1 | 2) {
    if (grading.current || lock.current) return;
    grading.current = true; setBusy(take); setError("");
    const key = `${base}:take:${take}`;
    const snapshot = store.getState().days[key];
    try {
      let result;
      if (task.skill === "writing") {
        result = await requestGrade("/api/grade/writing", { taskTitle: `Laboratorio · ${task.title} · Writing ${task.taskNumber}`, prompt: task.prompt, minWords, maxWords, studentText: snapshot?.writingText ?? "" });
        if (owner.current !== base) return;
        if (store.getState().days[key]?.writingText !== snapshot?.writingText) throw new Error("El texto cambió. Evalúa de nuevo la versión actual.");
        store.getState().setWritingGrade(key, result);
        await recordLearningActivity(profile?.username ?? null, { id: `lab:${base}:take:${take}`, kind: "writing", skill: "writing", label: `${task.title} · versión ${take}` });
      } else {
        if (!snapshot?.speakingAudioKey) throw new Error("Primero graba una respuesta.");
        const blob = await getSpeakingAudio(snapshot.speakingAudioKey);
        if (!blob) throw new Error("No se encontró el audio guardado. Graba una nueva respuesta.");
        const bytes = new Uint8Array(await blob.arrayBuffer());
        if (bytes.length > 2_200_000) throw new Error("El audio es demasiado grande. Vuelve a grabar una respuesta breve.");
        let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte);
        result = await requestGrade("/api/grade/speaking", { taskTitle: `Laboratorio · ${task.title} · Speaking ${task.taskNumber}`, prompt: task.prompt, mimeType: blob.type || "audio/webm", audioBase64: btoa(binary) });
        if (owner.current !== base) return;
        if (store.getState().days[key]?.speakingAudioKey !== snapshot.speakingAudioKey) throw new Error("La grabación cambió. Evalúa la toma actual.");
        store.getState().setSpeakingGrade(key, result);
      }
      await saveProductiveFeedback(`lab:${base}:take:${take}`, profile?.username ?? null, task.skill === "writing" ? "Writing" : "Speaking", task.taskNumber, result);
    } catch (cause) { if (owner.current === base) setError(cause instanceof Error ? cause.message : "No se pudo evaluar. Puedes reintentar sin perder la respuesta."); }
    finally { grading.current = false; if (owner.current === base) setBusy(null); }
  }
  if (!ready) return <p className="p-8">Recuperando tus respuestas…</p>;
  return <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-9">
    <Link href={`/laboratorio-c1/${task.moduleId}`} className="text-sm underline">← Volver al taller</Link>
    <section className="study-hero space-y-3 rounded-[2rem] border p-6"><p className="study-eyebrow">{task.skill.toUpperCase()} · TAREA {task.taskNumber} · PRÁCTICA CON REVISIÓN</p><h1 className="text-3xl">De entenderlo a <span className="font-signature italic">usarlo</span></h1><p className="text-sm font-semibold">Foco: {task.title}</p><p lang="en" className="text-base leading-relaxed">{task.prompt}</p><p className="text-xs">{task.skill === "speaking" ? `${task.taskNumber === 1 ? 30 : 45} s de preparación · ${responseSeconds} s por toma · parada automática` : `${minWords}–${maxWords} palabras · dos versiones conservadas`}</p></section>
    <section className="space-y-3 rounded-2xl border bg-[#fff1d1] p-5"><h2 className="text-lg">🎯 Una reparación, no diez preocupaciones</h2><p className="text-sm">Primera respuesta: intenta sin guion. Después elige un solo error de tiempo, concordancia o estructura. Reescribe la frase y úsala con naturalidad en la segunda respuesta. Si ya es correcta, mejora precisión o desarrollo.</p><Button variant="outline" onClick={() => setFrame(!frame)}>{frame ? "Ocultar" : "Necesito apoyo: ver andamio"}</Button>{frame && <p lang="en" className="rounded-xl bg-white/80 p-3 text-sm">{task.frame}</p>}<p className="text-xs text-muted-foreground">El andamio es una ayuda opcional, no un texto que debas insertar a la fuerza. Usarlo hace la práctica asistida; no equivale a desempeño espontáneo.</p>{task.skill === "speaking" && <><Button variant="outline" disabled={activeTake !== null || starting || busy !== null} onClick={() => { const length = task.taskNumber === 1 ? 30 : 45; setPrepSeconds(length); setPrepEnds(Date.now() + length * 1000); }}>Preparar {task.taskNumber === 1 ? 30 : 45} segundos</Button>{prepEnds && <p role="timer" className="text-sm">{prepSeconds > 0 ? `Preparación: ${prepSeconds} s` : "Preparación terminada: graba cuando estés lista."}</p>}</>}</section>
    <div className="grid gap-4 md:grid-cols-2">{([1, 2] as const).map((take) => {
      const key = `${base}:take:${take}`; const item = days[key];
      const count = item?.writingText.trim() ? item.writingText.trim().split(/\s+/).length : 0;
      return <section key={take} className="min-w-0 space-y-3 rounded-3xl border bg-white p-5" aria-label={`Respuesta ${take}`}><h2 className="text-xl">{take === 1 ? "🌱 Primera respuesta" : "🌸 Mi respuesta revisada"}</h2>
        {task.skill === "writing" ? <><textarea aria-label={`Writing versión ${take}`} maxLength={20000} className="min-h-60 w-full rounded-xl border bg-background p-3 text-sm" value={item?.writingText ?? ""} disabled={busy !== null} onChange={(event) => store.getState().setWriting(key, event.target.value)} /><p className="text-xs">{count}/{minWords}–{maxWords} palabras · borrador guardado automáticamente</p></> : <><div className="flex flex-wrap gap-2">{activeTake === take ? <Button onClick={() => stop(take)}>Detener y guardar toma {take}</Button> : <Button disabled={activeTake !== null || starting || busy !== null} onClick={() => record(take)}>{starting ? "Guardando / abriendo micrófono…" : item?.speakingAudioKey ? `Regrabar toma ${take}` : `Grabar toma ${take}`}</Button>}</div>{activeTake === take && <p role="timer" className="text-sm text-red-700">Grabando: {seconds}/{responseSeconds} s</p>}<SavedAudio key={item?.speakingAudioKey ?? `empty:${take}`} audioKey={item?.speakingAudioKey} label={`Mi toma ${take}`} /></>}
        <Button variant="outline" disabled={busy !== null || activeTake !== null || starting || (task.skill === "writing" ? count < minWords || count > maxWords : !item?.speakingAudioKey)} onClick={() => evaluate(take)}>{busy === take ? "Evaluando…" : `Evaluar ${task.skill === "writing" ? "versión" : "toma"} ${take}`}</Button>
        <GradeResult grade={task.skill === "writing" ? item?.writingGrade : item?.speakingGrade} skill={task.skill} question={task.prompt} />
      </section>;
    })}</div>
    <section className="space-y-3 rounded-2xl border bg-[#e9f1e8] p-5"><label className="block text-sm font-semibold" htmlFor="repair-plan">Mi frase original → mi reparación → por qué</label><textarea id="repair-plan" aria-label="Mi plan de reparación" className="min-h-24 w-full rounded-xl border bg-background p-3 text-sm" maxLength={2000} value={days[`${base}:plan`]?.writingText ?? ""} onChange={(event) => store.getState().setWriting(`${base}:plan`, event.target.value)} placeholder="Ej.: Yesterday I have studied → Yesterday I studied → yesterday es un periodo terminado." /><p className="text-xs">Guardado con este perfil. Compáralo con el feedback; una autocorrección no es una nota automática.</p></section>
    {firstGrade && secondGrade && <section className="space-y-3 rounded-2xl border p-5"><h2 className="text-xl">Dos respuestas, la misma consigna</h2><p className="text-sm">Primera: {firstGrade.score.toFixed(1)}/6 · Revisada: {secondGrade.score.toFixed(1)}/6. Diferencia: {(secondGrade.score - firstGrade.score).toFixed(1)}.</p><div className="flex flex-wrap gap-2">{Object.keys(firstGrade.dimensionScores).map((dimension) => <span key={dimension} className="rounded-xl bg-muted p-2 text-xs">{dimension}: {firstGrade.dimensionScores[dimension]} → {secondGrade.dimensionScores[dimension] ?? "—"}</span>)}</div><p className="text-xs text-muted-foreground">Esta comparación describe dos muestras de práctica. La IA puede variar; una subida tras feedback no demuestra retención ni certifica C1. Busca si la reparación aparece correctamente y vuelve otro día sin guion.</p></section>}
    {error && <p role="alert" className="rounded-xl border border-red-300 p-3 text-sm text-red-700">{error}</p>}
    <p className="text-xs leading-relaxed text-muted-foreground">Las grabaciones y borradores se guardan en este navegador. Solo al pulsar Evaluar se envían la consigna y tu respuesta a Gemini de Google. No incluyas datos sensibles. La evaluación es orientativa y requiere conexión. Regrabar sustituye la toma correspondiente y borra su nota anterior, no la otra toma.</p>
    {next && <Link href={`/laboratorio-c1/practica/${next.id}`} className="block rounded-2xl border bg-primary/5 p-4 text-sm font-semibold">🦋 Transferencia: probar otra consigna del mismo formato →</Link>}
    <Link href="/mis-datos" className="block text-xs underline">Guardar una copia con mis dos respuestas y audios</Link>
  </div>;
}
