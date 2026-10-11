"use client";

import { useEffect, useState } from "react";
import { Settings2, LockKeyhole, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ACCESSORIES, type PetColor } from "@/lib/learning/model";
import { useLearningStore } from "@/lib/learning/store";
import { useStudyOverview } from "@/lib/learning/useStudyOverview";
import { StudyPet } from "./StudyPet";

export function PetCorner() {
  const { learning, stats, profileKey, ready } = useStudyOverview();
  const [open, setOpen] = useState(false);
  const [happy, setHappy] = useState(false);
  const [petName, setPetName] = useState(learning.petName);
  const [color, setColor] = useState<PetColor>(learning.petColor);
  const [goal, setGoal] = useState<5 | 10 | 15>(learning.dailyGoal);
  useEffect(() => {
    if (!happy) return;
    const timer = setTimeout(() => setHappy(false), 4500);
    return () => clearTimeout(timer);
  }, [happy]);
  const phrase = happy
    ? "¡Equipo tú y yo! Un error es una pista, no un límite."
    : stats.goalMet
      ? "Tu meta de hoy ya floreció. ¿Una pausa para celebrar?"
      : stats.actionCount > 0
        ? "Mira todo lo que ya hiciste. Vamos paso a paso."
        : "Me alegra verte. ¿Descubrimos algo juntos hoy?";
  return (
    <section
      className="pet-habitat relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-primary/10 p-5 sm:p-6"
      aria-label="Tu compañero de estudio"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="study-eyebrow">TU COMPAÑERO</span>
        <button
          aria-label="Personalizar mi compañero y mi meta"
          onClick={() => {
            setPetName(learning.petName);
            setColor(learning.petColor);
            setGoal(learning.dailyGoal);
            setOpen(true);
          }}
          className="rounded-full bg-white/70 p-2 transition hover:bg-white"
        >
          <Settings2 size={17} />
        </button>
      </div>
      <div
        className="relative mt-3 rounded-2xl rounded-bl-sm bg-white/80 px-4 py-3 text-center text-sm font-medium"
        aria-live="polite"
      >
        {phrase}
      </div>
      <button
        onClick={() => setHappy(true)}
        className="group mx-auto w-full max-w-[270px] rounded-[40%] outline-offset-4"
        aria-label={`Saludar a ${learning.petName}`}
      >
        <StudyPet
          color={learning.petColor}
          accessory={learning.accessory}
          happy={happy || stats.goalMet}
          className="w-full transition-transform group-hover:scale-[1.04]"
        />
      </button>
      <div className="mt-auto text-center">
        <h2 className="text-2xl">
          {learning.petName}{" "}
          <span className="text-sm font-normal">
            · nivel {stats.levelIndex + 1}
          </span>
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {stats.level.name} · toca a tu compañero para saludarlo
        </p>
        <div className="mt-4 flex items-center justify-between text-xs font-semibold">
          <span className="inline-flex items-center gap-1">
            <Sparkles size={14} /> {ready ? stats.xp : "…"} destellos
          </span>
          <span>
            {stats.nextLevel
              ? `${stats.nextLevel.min - stats.xp} para crecer`
              : "¡En plena flor!"}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Avance al siguiente nivel"
          aria-valuenow={Math.round(stats.levelProgress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-2 h-2 overflow-hidden rounded-full bg-white/80"
        >
          <div
            className="h-full rounded-full bg-primary/70 transition-[width] duration-700"
            style={{ width: `${stats.levelProgress * 100}%` }}
          />
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-3xl p-6 sm:max-w-lg">
          <DialogTitle>Tu compañero, a tu manera</DialogTitle>
          <DialogDescription>
            Crece con tu práctica. Nunca pierde niveles porque descanses.
          </DialogDescription>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              useLearningStore
                .getState()
                .customize(profileKey, {
                  petName,
                  petColor: color,
                  dailyGoal: goal,
                });
              setOpen(false);
            }}
            className="space-y-5"
          >
            <label className="block text-sm font-semibold">
              Su nombre
              <input
                value={petName}
                onChange={(event) => setPetName(event.target.value)}
                maxLength={24}
                className="mt-2 w-full rounded-xl border bg-background px-3 py-2"
              />
            </label>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Su color</legend>
              <div className="flex gap-2">
                {(["mint", "rose", "lavender"] as const).map((item, index) => (
                  <button
                    type="button"
                    key={item}
                    aria-pressed={color === item}
                    onClick={() => setColor(item)}
                    className={`rounded-xl border-2 px-3 py-2 text-sm ${color === item ? "border-primary" : "border-transparent"}`}
                    style={{
                      background: ["#dcecdf", "#f7dbe3", "#e7e0f5"][index],
                    }}
                  >
                    {["Menta", "Rosa", "Lavanda"][index]}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-1 text-sm font-semibold">
                Mi meta diaria
              </legend>
              <p className="mb-2 text-xs text-muted-foreground">
                Preguntas respondidas, un texto evaluado o una práctica oral.
                Elige algo sostenible.
              </p>
              <div className="flex gap-2">
                {([5, 10, 15] as const).map((number) => (
                  <button
                    type="button"
                    key={number}
                    aria-pressed={goal === number}
                    onClick={() => setGoal(number)}
                    className={`rounded-xl border px-4 py-2 text-sm ${goal === number ? "bg-primary text-primary-foreground" : "bg-background"}`}
                  >
                    {number} pasos
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">
                Pequeños tesoros
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {ACCESSORIES.map((item) => {
                  const locked = stats.xp < item.xp;
                  return (
                    <button
                      type="button"
                      disabled={locked}
                      aria-pressed={learning.accessory === item.id}
                      key={item.id}
                      onClick={() =>
                        useLearningStore.getState().wear(profileKey, item.id)
                      }
                      className={`rounded-xl border p-3 text-left text-xs disabled:opacity-50 ${learning.accessory === item.id ? "border-primary bg-secondary/30" : "bg-white/60"}`}
                    >
                      <span className="mb-1 block text-xl">{item.emoji}</span>
                      <span className="font-semibold">{item.label}</span>
                      <span className="mt-1 flex items-center gap-1 text-muted-foreground">
                        {locked && <LockKeyhole size={11} />}
                        {item.xp
                          ? `${item.xp} destellos`
                          : "Siempre disponible"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground"
            >
              Guardar mi estilo
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
