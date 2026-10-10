import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Greeting } from "@/components/profile/Greeting";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-10 px-4 py-16">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">iTEP Simulator</h1>
        <p className="font-signature text-xl italic text-primary/70">
          by Michh <span aria-hidden="true">💕</span>
        </p>
        <div className="flex justify-center">
          <Greeting />
        </div>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Simulacro de práctica inspirado en iTEP Academic-Plus: Grammar, Listening, Reading, Writing y Speaking,
          con tiempos y tipos de tareas basados en su estructura oficial. Las preguntas son originales; los
          resultados no sustituyen una calificación oficial.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Modo Práctica</CardTitle>
            <CardDescription>
              Rota por seis simulacros completos con textos, audios y preguntas diferentes; revisa tus errores al terminar.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Modo Entrenamiento Intensivo</CardTitle>
            <CardDescription>
              Sin pausas ni repetición de audio, con temporizador para medir tu preparación.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" nativeButton={false} render={<Link href="/exam/new">Comenzar un simulacro</Link>} />
        <Button size="lg" variant="secondary" nativeButton={false} render={<Link href="/practica-diaria">60 días de práctica</Link>} />
        <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/dashboard">Ver mi progreso</Link>} />
      </div>
    </div>
  );
}
