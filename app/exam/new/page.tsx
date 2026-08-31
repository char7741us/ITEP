"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EXAM_MODE_LABELS, type ExamMode } from "@/lib/types/mode";
import { pickContentPackKeyForMode, loadContentPack } from "@/lib/content/loader";
import { createAttemptRecord } from "@/lib/exam/attemptRecord";
import { saveAttempt } from "@/lib/storage/attemptsRepo";
import { saveSettings, getSettings } from "@/lib/storage/settingsRepo";

const MODE_OPTIONS: { value: ExamMode; description: string }[] = [
  {
    value: "practice",
    description:
      "Preguntas de un banco distinto al de Entrenamiento Intensivo, para que no memorices respuestas. El tutor de voz en vivo llegará en una próxima actualización.",
  },
  {
    value: "intensive",
    description:
      "Sin ayudas, sin pausas, sin repetir audio: condiciones idénticas al examen real. Ideal para medir tu nivel actual.",
  },
];

function noopSubscribe() {
  return () => {};
}

export default function NewExamPage() {
  const router = useRouter();
  // localStorage isn't available during SSR — useSyncExternalStore is the
  // hydration-safe way to read it: the server snapshot matches what SSR
  // renders, then React swaps in the real client value after hydration
  // without ever reporting a mismatch (unlike reading it in a useState
  // initializer or an effect-driven setState).
  const savedMode = useSyncExternalStore(
    noopSubscribe,
    () => getSettings().modeDefault,
    () => "intensive" as ExamMode
  );
  const [modeOverride, setModeOverride] = useState<ExamMode | null>(null);
  const [starting, setStarting] = useState(false);
  const mode = modeOverride ?? savedMode;

  async function handleStart() {
    setStarting(true);
    saveSettings({ modeDefault: mode });
    const contentPack = loadContentPack(pickContentPackKeyForMode(mode));
    const attempt = createAttemptRecord(mode, contentPack);
    await saveAttempt(attempt);
    router.push(`/exam/run/${attempt.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold">Nuevo simulacro</h1>
        <p className="text-sm text-muted-foreground">
          Elige el modo con el que quieres practicar hoy.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <RadioGroup value={mode} onValueChange={(v) => setModeOverride(v as ExamMode)} className="gap-4">
            {MODE_OPTIONS.map((option) => (
              <label
                key={option.value}
                htmlFor={option.value}
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <div>
                  <p className="font-medium">{EXAM_MODE_LABELS[option.value]}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>Versión actual del simulacro</AlertTitle>
        <AlertDescription>
          Las 5 secciones (Reading, Listening, Grammar, Writing y Speaking) ya están activas. Writing y Speaking se
          califican con IA (Gemini) — si tu resultado muestra &quot;no se pudo calificar&quot;, revisa que
          GEMINI_API_KEY esté configurada en el servidor. El tutor de voz en vivo de Modo Práctica llegará en una
          próxima actualización.
        </AlertDescription>
      </Alert>

      <Button size="lg" onClick={handleStart} disabled={starting}>
        {starting ? "Preparando..." : "Comenzar simulacro"}
      </Button>
    </div>
  );
}
