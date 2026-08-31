"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listAttempts } from "@/lib/storage/attemptsRepo";
import type { AttemptRecord } from "@/lib/types/attempt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AttemptHistoryTable } from "@/components/dashboard/AttemptHistoryTable";
import { SkillTrendChart } from "@/components/dashboard/SkillTrendChart";
import { WeakestSkillCallout } from "@/components/dashboard/WeakestSkillCallout";

export default function DashboardPage() {
  const [attempts, setAttempts] = useState<AttemptRecord[] | null>(null);

  useEffect(() => {
    listAttempts().then(setAttempts);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tu progreso</h1>
        <Button nativeButton={false} render={<Link href="/exam/new">Nuevo simulacro</Link>} />
      </div>

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
