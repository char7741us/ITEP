"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useStudyOverview } from "@/lib/learning/useStudyOverview";
import { useLearningStore } from "@/lib/learning/store";
import { StudyPet } from "./StudyPet";

const moments = [
  {
    emoji: "✨",
    title: "Quiero un reto",
    headline: "Antes de seguir: enseña lo que aprendiste.",
    text: "Sin mirar la explicación, di en voz alta la regla o la pista de tu última respuesta. Inventa un ejemplo distinto. Si puedes explicarlo, estás construyendo comprensión, no solo memoria.",
    action: "Pedir un microreto al coach",
  },
  {
    emoji: "💭",
    title: "Tengo dudas",
    headline: "Una duda es un buen punto de partida.",
    text: "Elige la opción que más te confundió. ¿Qué parecía correcto? ¿Qué palabra, tiempo verbal o detalle del texto permite descartarla? Tu coach puede ayudarte a comparar esas dos alternativas.",
    action: "Desarmar mi duda con el coach",
  },
  {
    emoji: "🌿",
    title: "Necesito aire",
    headline: "No tienes que ganarte un descanso.",
    text: "Aparta la vista de la pantalla, suelta los hombros y respira con calma. Tus respuestas ya están guardadas. Puedes volver luego: tu compañero y lo que aprendiste seguirán aquí.",
    action: null,
  },
];

export function PracticeMoment({
  skill = "Grammar",
  question,
  explanation,
}: {
  skill?: string;
  question?: string;
  explanation?: string;
}) {
  const { learning } = useStudyOverview();
  const [chosen, setChosen] = useState<number | null>(null);
  const moment = chosen === null ? null : moments[chosen];
  return (
    <aside
      className="rounded-3xl border border-primary/10 bg-gradient-to-br from-[#f3e8ee] to-[#f5f0dd] p-4 sm:p-5"
      aria-label="Un momento contigo"
    >
      <div className="flex items-center gap-3">
        <StudyPet
          color={learning.petColor}
          accessory={learning.accessory}
          className="h-20 w-20 shrink-0"
        />
        <div>
          <p className="study-eyebrow">UN MOMENTO CONTIGO</p>
          <h3 className="mt-1 text-lg">¿Cómo quieres seguir?</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {learning.petName} también está para acompañar las dudas y las
            pausas.
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {moments.map((item, index) => (
          <button
            key={item.title}
            aria-pressed={chosen === index}
            onClick={() => setChosen(index)}
            className={`rounded-full border px-3 py-2 text-xs font-semibold ${chosen === index ? "bg-primary text-primary-foreground" : "bg-white/80 hover:bg-white"}`}
          >
            {item.emoji} {item.title}
          </button>
        ))}
      </div>
      {moment && (
        <div className="mt-4 rounded-2xl bg-white/65 p-4" aria-live="polite">
          <p className="text-sm font-bold">{moment.headline}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {moment.text}
          </p>
          {moment.action && (
            <button
              onClick={() =>
                useLearningStore
                  .getState()
                  .openCoach(
                    question ? { skill, question, explanation } : undefined,
                  )
              }
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold underline underline-offset-4"
            >
              {moment.action}
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
