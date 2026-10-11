"use client";

import { Pause, Play, RotateCcw, Timer, Leaf } from "lucide-react";
import { useActiveProfile } from "@/lib/storage/profileRepo";
import { useFocusStore } from "@/lib/learning/focus";

export function FocusTimer() {
  const student = useActiveProfile();
  const { minutes, remaining, running, message, choose, toggle, reset } =
    useFocusStore();
  return (
    <section
      className="study-card flex flex-col bg-[#eef1e8]"
      aria-labelledby="focus-title"
    >
      <p className="study-eyebrow flex items-center gap-1.5">
        <Timer size={13} /> UNA ISLA DE ENFOQUE
      </p>
      <h2 id="focus-title" className="mt-1 text-xl">
        Haz espacio para aprender.
      </h2>
      <div className="my-5 flex justify-center gap-2">
        {[5, 10, 15].map((value) => (
          <button
            key={value}
            disabled={running}
            aria-pressed={minutes === value}
            onClick={() => choose(value)}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${minutes === value ? "bg-primary text-primary-foreground" : "bg-white/70"}`}
          >
            {value} min
          </button>
        ))}
      </div>
      <p
        className="text-center font-mono text-5xl tracking-tight tabular-nums"
        aria-label={`${Math.floor(remaining / 60)} minutos y ${remaining % 60} segundos restantes`}
      >
        {String(Math.floor(remaining / 60)).padStart(2, "0")}
        <span className="opacity-40">:</span>
        {String(remaining % 60).padStart(2, "0")}
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <button
          onClick={() => toggle(student?.username ?? null)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          {running ? <Pause size={15} /> : <Play size={15} />}
          {running
            ? "Pausar"
            : remaining === minutes * 60 || !remaining
              ? "Empezar"
              : "Continuar"}
        </button>
        <button
          aria-label="Reiniciar enfoque"
          onClick={reset}
          className="rounded-full border bg-white/60 p-3"
        >
          <RotateCcw size={15} />
        </button>
      </div>
      <p
        role="status"
        className="mt-5 text-center text-sm leading-relaxed text-muted-foreground"
      >
        {message}
      </p>
      <p className="mt-auto flex items-start gap-1.5 pt-5 text-[11px] text-muted-foreground">
        <Leaf size={14} className="shrink-0" />
        El reloj no suma puntos ni racha. Tu práctica sí. Puedes detenerlo
        cuando necesites.
      </p>
    </section>
  );
}
