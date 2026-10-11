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
      "Seis retos completos C1 con preguntas más analíticas, Grammar de dos formatos y revisión detallada.",
  },
  {
    value: "intensive",
    description:
      "Mismos retos C1 con tiempo estricto, sin pausas ni repetición de audio.",
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
  const [startError, setStartError] = useState<string | null>(null);
  const mode = modeOverride ?? savedMode;

  async function handleStart() {
    setStarting(true);
    setStartError(null);
    try {
      const previousKey = getSettings().activePackId;
      const nextKey = pickContentPackKeyForMode(mode, previousKey);
      const contentPack = loadContentPack(nextKey);
      const attempt = createAttemptRecord(mode, contentPack);
      await saveAttempt(attempt);
      saveSettings({ modeDefault: mode, activePackId: nextKey });
      router.push(`/exam/run/${attempt.id}`);
    } catch (error) {
      setStartError(error instanceof Error ? error.message : "No se pudo crear el simulacro. Inténtalo otra vez.");
      setStarting(false);
    }
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
          Las 5 secciones están activas. Los contenidos son originales, inspirados en la estructura oficial de iTEP;
          no son preguntas oficiales. Writing y Speaking reciben una evaluación orientativa con Gemini, sujeta a
          disponibilidad del servicio.
        </AlertDescription>
      </Alert>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <p className="font-bold">🎯 Tu misión en este simulacro</p>
        <p className="mt-1 text-sm text-muted-foreground">Lee y escucha buscando implicaciones, no solo datos; en Grammar identifica una sola palabra incorrecta; en Writing y Speaking sustenta tus ideas y reconoce sus límites.</p>
        <p className="mt-2 text-xs text-muted-foreground">Al terminar verás una meta exigente por cada una de las cinco áreas y tus errores pasarán al Cuaderno para entrenarlos.</p>
      </div>

      {startError && <p role="alert" className="text-sm text-destructive">{startError}</p>}

      <Button size="lg" onClick={handleStart} disabled={starting}>
        {starting ? "Preparando..." : "Comenzar simulacro"}
      </Button>
    </div>
  );
}
