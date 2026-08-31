"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listAttempts } from "@/lib/storage/attemptsRepo";
import { useActiveProfile } from "@/lib/storage/profileRepo";
import type { AttemptRecord } from "@/lib/types/attempt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AttemptHistoryTable } from "@/components/dashboard/AttemptHistoryTable";
import { SkillTrendChart } from "@/components/dashboard/SkillTrendChart";
import { WeakestSkillCallout } from "@/components/dashboard/WeakestSkillCallout";

export default function DashboardPage() {
  const profile = useActiveProfile();
  const [allAttempts, setAllAttempts] = useState<AttemptRecord[] | null>(null);

  useEffect(() => {
    listAttempts().then(setAllAttempts);
  }, []);

  // Attempts made before this browser had a named profile (profileUsername is
  // unset) still show up so nobody's history silently disappears — only
  // attempts explicitly tagged to a *different* profile are filtered out.
  const attempts = allAttempts?.filter((a) => !profile || !a.profileUsername || a.profileUsername === profile.username) ?? null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{profile ? `Progreso de ${profile.name}` : "Tu progreso"}</h1>
        <Button nativeButton={false} render={<Link href="/exam/new">Nuevo simulacro</Link>} />
      </div>

      {!profile && (
        <Alert>
          <AlertTitle>Aún no tienes un nombre guardado</AlertTitle>
          <AlertDescription>
            Agrega tu nombre desde el botón de perfil (arriba a la derecha) para que tu progreso quede identificado si
            comparten esta computadora.
          </AlertDescription>
        </Alert>
      )}

      {attempts === null ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <>
          <WeakestSkillCallout attempts={attempts} />

          <Card>
            <CardHeader>
              <CardTitle>Tendencia por habilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillTrendChart attempts={attempts} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de simulacros</CardTitle>
            </CardHeader>
            <CardContent>
              <AttemptHistoryTable attempts={attempts} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
