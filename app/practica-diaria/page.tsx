"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dailySessions } from "@/lib/content/daily/build";
import { dailyProgressKey, useDailyProgressStore } from "@/lib/content/daily/progress";
import { useActiveProfile } from "@/lib/storage/profileRepo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DailyPracticePage() {
  const profile = useActiveProfile();
  const days = useDailyProgressStore((state) => state.days);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    Promise.resolve(useDailyProgressStore.persist.rehydrate()).finally(() => setHydrated(true));
  }, []);
  const completeCount = dailySessions.filter((session) => days[dailyProgressKey(profile?.username ?? null, session.day)]?.completedAt).length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">60 días de práctica iTEP</h1>
        <p className="text-muted-foreground">Una sesión corta por día: Grammar, Reading, Listening, Writing y Speaking. Puedes hacerlas a tu ritmo; no se desbloquean por calendario.</p>
        <p className="text-sm text-muted-foreground">Material original inspirado en el formato iTEP Academic, no preguntas oficiales. Tus respuestas se guardan en este navegador{profile ? ` para ${profile.name}` : " como invitado"}.</p>
        <p className="font-medium" aria-live="polite">{hydrated ? `${completeCount} de 60 sesiones completadas` : "Cargando avance guardado…"}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {dailySessions.map((session) => {
          const progress = days[dailyProgressKey(profile?.username ?? null, session.day)];
          const completed = Boolean(progress?.completedAt);
          const started = !completed && Boolean(progress && (Object.keys(progress.answers).length || progress.writingText || progress.speakingPracticed));
          return (
            <Link key={session.day} href={`/practica-diaria/${session.day}`} className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
              <Card className="h-full transition-colors hover:border-primary/60 hover:bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between gap-2 text-base"><span>Día {session.day}</span><span className="text-xs font-normal text-muted-foreground">{completed ? "Completado ✓" : started ? "En curso" : "Pendiente"}</span></CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{session.theme}<br />{session.writing.taskNumber === 1 ? "Nota breve" : "Ensayo de opinión"} · Audio y conversación</CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
