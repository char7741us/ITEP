"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Check,
  Flame,
  Flower2,
  Headphones,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { learningBadges } from "@/lib/learning/model";
import { suggestedStep } from "@/lib/learning/coach";
import { useStudyOverview } from "@/lib/learning/useStudyOverview";
import { useLearningStore } from "@/lib/learning/store";
import { PetCorner } from "./PetCorner";
import { StudyCalendar } from "./StudyCalendar";
import { CoachPanel } from "./CoachPanel";
import { FocusTimer } from "./FocusTimer";
import { StudyJourney } from "./StudyJourney";

export function StudyHub() {
  const {
    student,
    learning,
    stats,
    ready,
    now,
    profileKey,
    coachSummary,
    dailyCompleted,
    grammarCompleted,
    masteredTotal,
    entries,
  } = useStudyOverview();
  const next = suggestedStep(coachSummary);
  const badges = learningBadges(learning, now, masteredTotal);
  const earned = badges.filter((badge) => badge.earned).length;
  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 px-4 pt-8 pb-16 sm:space-y-9 sm:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="study-eyebrow">TU ESPACIO PARA CRECER · iTEP</p>
          <h1 className="mt-1 text-2xl sm:text-3xl">
            Hola, {student?.name?.split(" ")[0] || "mente curiosa"}
            <span className="ml-2 text-xl" aria-hidden="true">
              ✦
            </span>
          </h1>
        </div>
        <span className="rounded-full border border-primary/10 bg-white/60 px-3 py-1.5 text-[11px] text-muted-foreground">
          A tu ritmo. Con intención.
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <section className="study-hero relative flex flex-col overflow-hidden rounded-[2rem] border border-primary/10 p-6 sm:p-9">
          <div
            className="pointer-events-none absolute -right-8 -top-9 text-[180px] leading-none text-primary/[.05]"
            aria-hidden="true"
          >
            ✳
          </div>
          <p className="study-eyebrow relative flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#7da991]" />
            HOY NO EMPIEZAS DE CERO
          </p>
          <h2 className="relative mt-5 max-w-lg text-4xl leading-[1.08] tracking-tight sm:text-5xl">
            Tu inglés crece
            <br />
            <span className="font-signature font-normal italic">
              un pequeño paso
            </span>
            <br />a la vez.
          </h2>
          <p className="relative mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            No buscamos una racha perfecta. Buscamos que entiendas más, confíes
            en ti y tengas ganas de volver.
          </p>
          <div className="relative mt-7 rounded-2xl border border-white/80 bg-white/70 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="study-eyebrow">TU SIGUIENTE MISIÓN</p>
                <h3 className="mt-2 text-lg">{next.title}</h3>
              </div>
              <span className="shrink-0 rounded-full bg-background px-2 py-1 font-mono text-[10px]">
                {next.minutes}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {ready ? next.detail : "Recuperando tus avances…"}
            </p>
            <Link
              href={next.href}
              className="mt-4 inline-flex items-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:gap-5"
            >
              {next.action}
              <ArrowRight size={16} />
            </Link>
            <Link href="/reto-diario" className="mt-3 block text-xs font-semibold underline underline-offset-4">Solo tengo 3 minutos: mi reto Grammar →</Link>
          </div>
          <div className="relative mt-6 flex items-start gap-3">
            <span
              className={`mt-0.5 rounded-full p-2 ${stats.goalMet ? "bg-[#dceadf]" : "bg-white/80"}`}
            >
              {stats.goalMet ? <Check size={17} /> : <Target size={17} />}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                <span>
                  {stats.goalMet
                    ? "Meta de hoy: ¡floreció!"
                    : "Mi pequeña meta de hoy"}
                </span>
                <span>
                  {ready ? stats.actionCount : "…"}/{learning.dailyGoal} pasos
                </span>
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-white/80"
                role="progressbar"
                aria-label="Meta diaria de práctica"
                aria-valuenow={Math.min(stats.actionCount, learning.dailyGoal)}
                aria-valuemin={0}
                aria-valuemax={learning.dailyGoal}
              >
                <div
                  className="h-full rounded-full bg-[#7da991] transition-[width] duration-500"
                  style={{
                    width: `${Math.min(100, (stats.actionCount / learning.dailyGoal) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Una respuesta, una práctica escrita o una práctica oral = un paso.
                Tu compañero permite cambiar la meta.
              </p>
            </div>
          </div>
        </section>
        <PetCorner />
      </div>

      <section
        aria-label="Tus avances"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          {
            icon: Flame,
            value: `${stats.streak} ${stats.streak === 1 ? "día" : "días"}`,
            label: "Racha de práctica",
            note: "Solo actividad real",
          },
          {
            icon: Sparkles,
            value: `${stats.xp}`,
            label: "Destellos ganados",
            note: "Por participar y completar",
          },
          {
            icon: Flower2,
            value: `${masteredTotal}`,
            label: "Temas superados",
            note: "Errores que se vuelven pistas",
          },
          {
            icon: Trophy,
            value: `${earned}/${badges.length}`,
            label: "Recuerdos de avance",
            note: "Logros que se quedan",
          },
        ].map(({ icon: Icon, value, label, note }) => (
          <div key={label} className="rounded-2xl border bg-white/65 p-4">
            <Icon size={17} className="mb-3 text-primary/70" />
            <p className="text-2xl font-bold">{ready ? value : "…"}</p>
            <p className="mt-1 text-xs font-semibold">{label}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{note}</p>
          </div>
        ))}
      </section>

      <StudyJourney key={profileKey} />

      <div className="grid items-start gap-5 lg:grid-cols-[.95fr_1.2fr]">
        <StudyCalendar />
        <CoachPanel key={profileKey} />
      </div>

      <section aria-labelledby="routes-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="study-eyebrow">ELIGE LO QUE NECESITAS HOY</p>
            <h2 id="routes-title" className="mt-1 text-2xl">
              Hay más de una forma de avanzar.
            </h2>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs font-semibold hover:underline"
          >
            Ver mi progreso
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              href: "/practica-diaria",
              title: "Un poco de todo",
              subtitle: "60 sesiones · cinco habilidades",
              detail: `${dailyCompleted} de 60 sesiones completadas`,
              icon: Headphones,
              color: "bg-[#edf0e3]",
            },
            {
              href: "/cuaderno-errores/grammar",
              title: "Laboratorio Grammar C1",
              subtitle: "20 días · reglas y matices",
              detail: `${grammarCompleted} de 20 días aprobados`,
              icon: BookOpen,
              color: "bg-[#eee8f5]",
            },
            {
              href: "/cuaderno-errores",
              title: "Mi jardín de errores",
              subtitle: "Entender · entrenar · superar",
              detail: entries.length
                ? `${entries.length} ${entries.length === 1 ? "tema esperando" : "temas esperando"} una nueva oportunidad`
                : "Tus errores tienen un lugar para transformarse",
              icon: Flower2,
              color: "bg-[#f9e6eb]",
            },
          ].map(({ href, title, subtitle, detail, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className={`group rounded-3xl border border-primary/10 p-5 transition hover:-translate-y-1 hover:shadow-md ${color}`}
            >
              <div className="flex items-center justify-between">
                <Icon size={22} />
                <ArrowUpRight
                  size={18}
                  className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </div>
              <h3 className="mt-5 text-lg">{title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
              <p className="mt-4 text-[11px] font-semibold">{detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <section className="study-card">
          <p className="study-eyebrow">TU COLECCIÓN DE PEQUEÑAS VICTORIAS</p>
          <h2 className="mt-1 text-xl">Mira lo que estás construyendo.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No compites con nadie. Cada recuerdo representa algo que hiciste por
            ti.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-2xl border p-3 text-center ${badge.earned ? "border-primary/15 bg-secondary/20" : "border-dashed bg-background/50"}`}
              >
                <span
                  className={`block text-3xl ${badge.earned ? "" : "grayscale opacity-40"}`}
                  aria-hidden="true"
                >
                  {badge.emoji}
                </span>
                <h3 className="mt-2 text-[11px]">{badge.title}</h3>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  {badge.detail}
                </p>
                <span className="mt-2 block text-[9px] font-bold uppercase tracking-wider">
                  {badge.earned ? "✓ Es tuyo" : "Por descubrir"}
                </span>
              </div>
            ))}
          </div>
        </section>
        <FocusTimer />
      </div>

      <section className="flex flex-col gap-4 rounded-3xl border border-primary/15 bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-widest opacity-70">
            CUANDO QUIERAS MEDIRTE
          </p>
          <h2 className="mt-2 text-xl">Pon tus avances a prueba.</h2>
          <p className="mt-1 max-w-lg text-xs leading-relaxed opacity-80">
            Simulacros de práctica o intensivos con tiempos de examen. Durante
            el examen, tu coach espera afuera para no darte pistas.
          </p>
        </div>
        <Link
          href="/exam/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground"
        >
          Elegir simulacro
          <ArrowRight size={15} />
        </Link>
      </section>
      <footer className="text-center text-[11px] leading-relaxed text-muted-foreground">
        <p>
          Tu progreso se guarda en este navegador y perfil. Usa el mismo para
          volver a tu jardín; no borres sus datos. <Link href="/mis-datos" className="font-semibold underline">Descarga una copia de tu progreso →</Link>
        </p>
        <p className="mt-2">
          Práctica independiente inspirada en iTEP Academic-Plus. Contenido
          original; ni los niveles ni los resultados sustituyen una
          certificación oficial.
        </p>
        <p className="font-signature mt-3 text-lg italic">by Michh 💕</p>
        <button
          onClick={() => useLearningStore.getState().openCoach()}
          className="mt-3 underline underline-offset-4"
        >
          ¿Necesitas una mano? Habla con tu coach.
        </button>
      </footer>
    </div>
  );
}
