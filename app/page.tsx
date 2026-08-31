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
          Simulacro de práctica del examen iTEP Academic-Plus: Reading, Listening, Grammar, Writing y Speaking,
          con temporizador real, análisis de resultados y seguimiento de tu progreso. Todo el contenido es
          original, diseñado para igualar la estructura y dificultad del examen real.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Modo Práctica</CardTitle>
            <CardDescription>
              Con ayudas y un tutor de voz para explicarte respuestas y practicar conversación en Speaking.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Modo Entrenamiento Intensivo</CardTitle>
            <CardDescription>
              Cero ayudas: condiciones estrictas de examen real, igual que el día del iTEP.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" nativeButton={false} render={<Link href="/exam/new">Comenzar un simulacro</Link>} />
        <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/dashboard">Ver mi progreso</Link>} />
      </div>
    </div>
  );
}
