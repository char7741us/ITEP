"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Flame, CalendarDays } from "lucide-react";
import { dateFromKey, dateKey, practiceActions } from "@/lib/learning/model";
import { useStudyOverview } from "@/lib/learning/useStudyOverview";

export function StudyCalendar() {
  const { now, ready, stats, learning } = useStudyOverview();
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const today = dateKey(now);
  const month = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const start = (month.getDay() + 6) % 7;
  const total = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const selectedDay = selected ?? today;
  const events = learning.activities.filter(
    (activity) => activity.day === selectedDay,
  );
  const grouped = Object.entries(
    events.reduce<Record<string, number>>(
      (counts, activity) => ({
        ...counts,
        [activity.label]: (counts[activity.label] ?? 0) + 1,
      }),
      {},
    ),
  );
  return (
    <section className="study-card" aria-labelledby="calendar-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="study-eyebrow">UN DÍA A LA VEZ</p>
          <h2 id="calendar-title" className="mt-1 text-xl">
            Tu jardín de constancia
          </h2>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-[#fff0d2] px-3 py-1.5 text-sm font-bold text-[#875022]">
          <Flame size={16} /> {stats.streak}{" "}
          {stats.streak === 1 ? "día" : "días"}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Cada día de práctica deja una semilla. Si haces una pausa, lo aprendido
        sigue contigo.
      </p>
      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => {
            setOffset(offset - 1);
            setSelected(null);
          }}
          aria-label="Mes anterior"
          className="rounded-full p-2 hover:bg-muted"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="capitalize text-sm">
          {ready
            ? month.toLocaleDateString("es-CO", {
                month: "long",
                year: "numeric",
              })
            : "Cargando tu calendario…"}
        </h3>
        <button
          onClick={() => {
            setOffset(offset + 1);
            setSelected(null);
          }}
          aria-label="Mes siguiente"
          className="rounded-full p-2 hover:bg-muted"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1.5 text-center">
        <div className="contents" aria-hidden="true">
          {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
            <span
              key={index}
              className="pb-2 text-[11px] font-semibold text-muted-foreground"
            >
              {day}
            </span>
          ))}
        </div>
        {Array.from({ length: start }, (_, index) => (
          <span key={`empty-${index}`} />
        ))}
        {Array.from({ length: total }, (_, index) => {
          const day = dateKey(
            new Date(month.getFullYear(), month.getMonth(), index + 1),
          );
          const activities = learning.activities.filter(
            (activity) => activity.day === day,
          );
          const practiced = activities.some(
            (activity) => activity.kind !== "focus",
          );
          const goalMet = practiceActions(activities) >= learning.dailyGoal;
          return (
            <button
              key={day}
              disabled={!ready}
              onClick={() => setSelected(day)}
              aria-pressed={selectedDay === day}
              aria-label={`${dateFromKey(day).toLocaleDateString("es-CO", { day: "numeric", month: "long" })}${practiced ? ", con práctica" : ", sin práctica registrada"}${day === today ? ", hoy" : ""}`}
              className={`relative flex aspect-square max-h-12 items-center justify-center rounded-xl text-xs font-semibold transition hover:scale-105 ${goalMet ? "bg-primary text-primary-foreground" : practiced ? "bg-[#dceadf] text-[#395d45]" : "bg-muted/60"} ${selectedDay === day ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""} ${day === today ? "underline underline-offset-4" : ""}`}
            >
              {index + 1}
              {practiced && (
                <span
                  className="absolute bottom-1 text-[7px]"
                  aria-hidden="true"
                >
                  ✦
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <i className="h-2 w-2 rounded-full bg-[#b5d1ba]" />
          Práctica
        </span>
        <span className="flex items-center gap-1">
          <i className="h-2 w-2 rounded-full bg-primary" />
          Meta cumplida
        </span>
        <span>
          Mejor racha: {stats.bestStreak}{" "}
          {stats.bestStreak === 1 ? "día" : "días"}
        </span>
      </div>
      <div
        className="mt-4 min-h-24 rounded-2xl bg-background p-4"
        aria-live="polite"
      >
        <p className="flex items-center gap-2 text-xs font-semibold">
          <CalendarDays size={14} />
          {ready
            ? dateFromKey(selectedDay).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "long",
              })
            : "Tu actividad"}
        </p>
        {grouped.length ? (
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {grouped.slice(0, 4).map(([label, count]) => (
              <li key={label}>
                {count > 1 ? `${count} × ` : "✓ "}
                {label}
              </li>
            ))}
            {grouped.length > 4 && (
              <li>Y {grouped.length - 4} actividades más.</li>
            )}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            No hay práctica registrada en esta fecha. Hoy puedes empezar con un
            paso pequeño.
          </p>
        )}
      </div>
    </section>
  );
}
