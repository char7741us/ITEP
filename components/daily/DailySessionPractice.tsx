"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { DailySession } from "@/lib/content/daily/schema";
import { dailyProgressKey, useDailyProgressStore } from "@/lib/content/daily/progress";
import { useActiveProfile } from "@/lib/storage/profileRepo";
import { getSpeakingAudio, saveSpeakingAudio } from "@/lib/storage/attemptsRepo";
import { startRecording, type RecordingHandle } from "@/lib/audio/recorder";
import { comprehensionRule, type FailedTopic } from "@/lib/notebook/failedRules";
import { recordCompletedAttempt } from "@/lib/notebook/store";
import type { RubricResult } from "@/lib/types/attempt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Question = DailySession["grammar"][number];

function words(text: string): number { return text.trim() ? text.trim().split(/\s+/).length : 0; }

async function grade(url: string, body: unknown): Promise<RubricResult> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? "No se pudo evaluar la respuesta.");
  return payload as RubricResult;
}

function QuestionBlock({ item, id, selected, onAnswer }: { item: Question; id: string; selected?: number; onAnswer: (id: string, index: number) => void }) {
  const answered = selected !== undefined;
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <p className="font-medium">{item.prompt}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {item.choices.map((choice, index) => (
          <button key={`${id}-${index}`} type="button" disabled={answered} onClick={() => onAnswer(id, index)}
            className={`rounded-md border p-2 text-left text-sm transition-colors ${answered && index === item.correctIndex ? "border-green-600 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100" : answered && index === selected ? "border-red-600 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100" : "hover:bg-muted"}`}>
            <span className="mr-2 font-semibold">{String.fromCharCode(65 + index)}.</span>{choice}
          </button>
        ))}
      </div>
      {answered && <p className="text-sm" role="status">{selected === item.correctIndex ? "Correcto. " : "Incorrecto. "}{item.explanation}</p>}
    </div>
  );
}

function GradeResult({ grade: result }: { grade?: RubricResult }) {
  if (!result) return null;
  return <div className="rounded-lg border bg-muted/40 p-3 text-sm"><p className="font-medium">Evaluación orientativa: {result.score.toFixed(1)}/6 · {result.cefrBand}</p><p>{result.rationale}</p>{result.improvements?.length > 0 && <p className="mt-1">Para mejorar: {result.improvements.join("; ")}</p>}</div>;
}

export function DailySessionPractice({ session }: { session: DailySession }) {
  const profile = useActiveProfile();
  const key = dailyProgressKey(profile?.username ?? null, session.day);
  const progress = useDailyProgressStore((state) => state.days[key]);
  const store = useDailyProgressStore;
  const [hydrated, setHydrated] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<"writing" | "speaking" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const recorderRef = useRef<RecordingHandle | null>(null);

  useEffect(() => {
    Promise.resolve(useDailyProgressStore.persist.rehydrate()).finally(() => setHydrated(true));
    fetch("/api/ai-status").then((response) => response.json()).then((data) => setAiAvailable(Boolean(data.available))).catch(() => setAiAvailable(false));
    return () => { recorderRef.current?.cancel(); };
  }, []);

  useEffect(() => {
    let url: string | null = null;
    let active = true;
    if (progress?.speakingAudioKey) {
      getSpeakingAudio(progress.speakingAudioKey).then((blob) => {
        if (blob && active) { url = URL.createObjectURL(blob); setAudioUrl(url); }
      }).catch(() => { if (active) setError("No se pudo cargar la grabación guardada."); });
    }
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [progress?.speakingAudioKey]);

  const answers = progress?.answers ?? {};
  const answeredCount = Object.keys(answers).length;
  const writingText = progress?.writingText ?? "";
  const writingWords = words(writingText);
  const canComplete = answeredCount === 9 && writingWords >= session.writing.minWords && writingWords <= session.writing.maxWords && Boolean(progress?.speakingPracticed);
  const score = ["grammar", "reading", "listening"].reduce((total, section) => {
    const questions = section === "grammar" ? session.grammar : section === "reading" ? session.reading.questions : session.listening.questions;
    return total + questions.reduce((count, item, index) => count + Number(answers[`${section}-${index}`] === item.correctIndex), 0);
  }, 0);

  function answer(id: string, choice: number) { store.getState().answer(key, id, choice); }

  async function startAudio() {
    setError(null);
    try { recorderRef.current = await startRecording(); setRecording(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo activar el micrófono."); }
  }

  async function stopAudio() {
    const recorder = recorderRef.current;
    if (!recorder) return;
    recorderRef.current = null;
    setRecording(false);
    try {
      const blob = await recorder.stop();
      if (blob.size < 1000) throw new Error("La grabación está vacía. Inténtalo otra vez.");
      const audioKey = `daily:${key}:speaking`;
      await saveSpeakingAudio(audioKey, blob);
      setAudioUrl((previous) => { if (previous) URL.revokeObjectURL(previous); return URL.createObjectURL(blob); });
      store.getState().setSpeakingAudio(key, audioKey);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar la grabación."); }
  }

  async function evaluateWriting() {
    setBusy("writing"); setError(null);
    try {
      const result = await grade("/api/grade/writing", { taskTitle: `Día ${session.day}: Writing ${session.writing.taskNumber}`, prompt: session.writing.prompt, minWords: session.writing.minWords, maxWords: session.writing.maxWords, studentText: writingText });
      store.getState().setWritingGrade(key, result);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo evaluar Writing."); }
    finally { setBusy(null); }
  }

  async function evaluateSpeaking() {
    if (!progress?.speakingAudioKey) return;
    setBusy("speaking"); setError(null);
    try {
      const blob = await getSpeakingAudio(progress.speakingAudioKey);
      if (!blob) throw new Error("No se encontró la grabación en este navegador.");
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      const result = await grade("/api/grade/speaking", { taskTitle: `Día ${session.day}: Speaking ${session.speaking.taskNumber}`, prompt: session.speaking.prompt, audioBase64: btoa(binary), mimeType: blob.type || "audio/webm" });
      store.getState().setSpeakingGrade(key, result);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo evaluar Speaking."); }
    finally { setBusy(null); }
  }

  async function complete() {
    if (!canComplete || progress?.completedAt) return;
    setError(null);
    try {
      const failed: FailedTopic[] = [];
      for (const [section, questions] of [
        ["Grammar", session.grammar], ["Reading", session.reading.questions], ["Listening", session.listening.questions],
      ] as const) {
        questions.forEach((item, index) => {
          if (answers[`${section.toLowerCase()}-${index}`] !== item.correctIndex) {
            failed.push({ section, failed_rule: section === "Grammar" ? item.explanation : comprehensionRule(section, item.prompt) });
          }
        });
      }
      await recordCompletedAttempt(`daily:${key}`, profile?.username ?? null, failed);
      store.getState().complete(key);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo finalizar la sesión."); }
  }

  if (!hydrated) return <div className="mx-auto w-full max-w-3xl px-4 py-10">Cargando sesión guardada…</div>;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="space-y-2"><Link href="/practica-diaria" className="text-sm text-primary underline">← Volver a los 60 días</Link><h1 className="text-3xl font-semibold">Día {session.day}: {session.theme}</h1><p className="text-muted-foreground">Sesión corta de las cinco áreas · {answeredCount}/9 preguntas respondidas {progress?.completedAt && "· Completada"}</p></div>
      <Card><CardHeader><CardTitle>Grammar</CardTitle><CardDescription>Responde tres preguntas de gramática. Cada respuesta se guarda automáticamente.</CardDescription></CardHeader><CardContent className="space-y-3">{session.grammar.map((item, i) => <QuestionBlock key={i} item={item} id={`grammar-${i}`} selected={answers[`grammar-${i}`]} onAnswer={answer} />)}</CardContent></Card>
      <Card><CardHeader><CardTitle>Reading</CardTitle><CardDescription>Lee el texto y responde las tres preguntas.</CardDescription></CardHeader><CardContent className="space-y-4"><article className="whitespace-pre-line rounded-lg bg-muted/40 p-4 leading-relaxed"><h3 className="mb-2 font-semibold">{session.reading.title}</h3>{session.reading.passage}</article>{session.reading.questions.map((item, i) => <QuestionBlock key={i} item={item} id={`reading-${i}`} selected={answers[`reading-${i}`]} onAnswer={answer} />)}</CardContent></Card>
      <Card><CardHeader><CardTitle>Listening</CardTitle><CardDescription>Escucha el diálogo antes de responder. Puedes repetirlo para estudiar.</CardDescription></CardHeader><CardContent className="space-y-4"><audio controls preload="none" src={session.listening.audioAssetPath} className="w-full" aria-label={`Diálogo del día ${session.day}`}><a href={session.listening.audioAssetPath}>Descargar audio</a></audio>{session.listening.questions.map((item, i) => <QuestionBlock key={i} item={item} id={`listening-${i}`} selected={answers[`listening-${i}`]} onAnswer={answer} />)}<Button variant="outline" onClick={() => setShowTranscript((value) => !value)}>{showTranscript ? "Ocultar" : "Ver"} transcripción</Button>{showTranscript && <div className="space-y-2 rounded-lg bg-muted/40 p-4 text-sm">{session.listening.lines.map((line, i) => <p key={i}><strong>{line.speaker}:</strong> {line.text}</p>)}</div>}</CardContent></Card>
      <Card><CardHeader><CardTitle>Writing · Tarea {session.writing.taskNumber}</CardTitle><CardDescription>{session.writing.minWords}–{session.writing.maxWords} palabras. Tu borrador se guarda en este navegador.</CardDescription></CardHeader><CardContent className="space-y-3"><p>{session.writing.prompt}</p><textarea aria-label="Tu respuesta escrita" className="min-h-52 w-full rounded-lg border bg-background p-3" value={writingText} disabled={Boolean(progress?.completedAt)} onChange={(event) => store.getState().setWriting(key, event.target.value)} /><p className={`text-sm ${writingWords >= session.writing.minWords && writingWords <= session.writing.maxWords ? "text-green-700" : "text-muted-foreground"}`}>{writingWords} palabras</p><Button variant="outline" disabled={!writingText.trim() || busy !== null || aiAvailable !== true} onClick={evaluateWriting}>{busy === "writing" ? "Evaluando…" : "Evaluación orientativa con IA"}</Button><GradeResult grade={progress?.writingGrade} /></CardContent></Card>
      <Card><CardHeader><CardTitle>Speaking · Tarea {session.speaking.taskNumber}</CardTitle><CardDescription>{session.speaking.prepSeconds} segundos para preparar y {session.speaking.responseSeconds} segundos recomendados para responder.</CardDescription></CardHeader><CardContent className="space-y-3"><p>{session.speaking.prompt}</p><div className="flex flex-wrap gap-2">{recording ? <Button onClick={stopAudio}>Detener y guardar</Button> : <Button onClick={startAudio}>{progress?.speakingAudioKey ? "Volver a grabar" : "Grabar respuesta"}</Button>}<Button variant="outline" disabled={!progress?.speakingAudioKey || busy !== null || aiAvailable !== true} onClick={evaluateSpeaking}>{busy === "speaking" ? "Evaluando…" : "Evaluación orientativa con IA"}</Button></div>{recording && <p role="status" className="text-sm text-red-700">Grabando… Pulsa «Detener y guardar» al terminar.</p>}{audioUrl && <audio controls src={audioUrl} className="w-full" aria-label="Tu respuesta oral grabada" />}{progress?.speakingAudioKey && !audioUrl && <p className="text-sm text-muted-foreground">Grabación guardada en este navegador.</p>}{!progress?.speakingPracticed && <Button variant="ghost" onClick={() => store.getState().markSpeakingPracticed(key)}>Hice la práctica oral sin grabación</Button>}{progress?.speakingPracticed && !progress.speakingAudioKey && <p className="text-sm text-muted-foreground">Práctica oral marcada como realizada, sin grabación.</p>}<GradeResult grade={progress?.speakingGrade} /></CardContent></Card>
      {aiAvailable === false && <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">La clave de Gemini del sitio no está configurada correctamente. Puedes completar y guardar toda la práctica; la evaluación automática de Writing y Speaking estará disponible cuando se actualice la clave.</p>}
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
      <Card><CardHeader><CardTitle>{progress?.completedAt ? "Sesión completada" : "Terminar el día"}</CardTitle><CardDescription>Necesitas responder las 9 preguntas, escribir dentro del rango de palabras y practicar oralmente. La grabación y la evaluación con IA son opcionales.</CardDescription></CardHeader><CardContent className="space-y-3"><p className="text-sm">Resultado objetivo: {score}/9 aciertos.</p>{progress?.completedAt ? <p className="text-sm">Tus errores ya se añadieron al Cuaderno de Errores. Puedes volver a repasar esta sesión mañana.</p> : <Button disabled={!canComplete || recording} onClick={complete}>Completar día {session.day}</Button>}<div className="flex gap-4 text-sm"><Link href="/practica-diaria" className="text-primary underline">Ver calendario</Link><Link href="/cuaderno-errores" className="text-primary underline">Cuaderno de Errores</Link></div></CardContent></Card>
    </div>
  );
}
