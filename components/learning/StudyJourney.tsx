"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, Compass, SlidersHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { dateKey, type StudyPlan } from "@/lib/learning/model";
import { DEFAULT_PLAN, daysUntilExam, weeklyJourney } from "@/lib/learning/journey";
import { skillNames, useStudyOverview } from "@/lib/learning/useStudyOverview";
import { useLearningStore } from "@/lib/learning/store";

export function StudyJourney() {
  const { learning, profileKey, ready, now, nextDaily, nextGrammar, entries, weakest } = useStudyOverview();
  const plan = learning.studyPlan ?? DEFAULT_PLAN;
  const week = weeklyJourney(learning, now);
  const remaining = daysUntilExam(plan.targetDate, now);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<StudyPlan>(plan);
  const [error, setError] = useState("");
  const priority = plan.focus === "balanced" ? weakest : plan.focus;
  const route = priority === "grammar" ? "/cuaderno-errores/grammar" : `/practica-diaria/${nextDaily}`;
  return (
    <section aria-labelledby="journey-title" className="overflow-hidden rounded-[2rem] border border-primary/15 bg-[#f5f1e8]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 px-5 py-4 sm:px-7">
        <div>
          <p className="study-eyebrow flex items-center gap-2"><Compass size={14} /> TU RUTA, NO UNA LISTA INFINITA</p>
          <h2 id="journey-title" className="mt-1 text-xl">{learning.studyPlan ? "Esta semana tiene un rumbo." : "Diseña una rutina que sí quepa en tu vida."}</h2>
        </div>
        <button disabled={!ready} onClick={() => { setDraft(plan); setError(""); setOpen(true); }} className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2 text-xs font-semibold disabled:opacity-40">
          <SlidersHorizontal size={14} />{learning.studyPlan ? "Ajustar mi ruta" : "Diseñar mi ruta"}
        </button>
      </div>
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold">Mi compromiso flexible</h3>
            <span className="font-mono text-xs">{week.practicedDays.size}/{plan.weeklyDays} días</span>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2" aria-label="Práctica de esta semana">
            {week.days.map((day, index) => (
              <div key={day} className="text-center">
                <span className="text-[10px] text-muted-foreground">{["L", "M", "X", "J", "V", "S", "D"][index]}</span>
                <div aria-label={`${day}: ${week.practicedDays.has(day) ? "practicado" : day > dateKey(now) ? "próximo" : "sin práctica"}`} className={`mx-auto mt-2 flex aspect-square max-w-10 items-center justify-center rounded-full border text-xs ${week.practicedDays.has(day) ? "border-[#709778] bg-[#dcebdd] text-[#35563c]" : "border-primary/10 bg-white/70"} ${day === dateKey(now) ? "ring-2 ring-primary/25 ring-offset-2 ring-offset-[#f5f1e8]" : ""}`}>
                  {week.practicedDays.has(day) ? <Check size={15} /> : Number(day.slice(-2))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {week.practicedDays.size >= plan.weeklyDays ? "Cumpliste tu compromiso. Puedes repasar una duda o descansar: no necesitas hacer más para que cuente." : "Tú eliges qué días. Una respuesta o una práctica escrita/oral deja huella; abrir la página no cuenta."}
          </p>
          <p className="mt-3 text-[11px] font-medium">Semana anterior: {week.previousDays} {week.previousDays === 1 ? "día" : "días"} de práctica. Compites contigo, no con otros.</p>
          {remaining !== null && <p className="mt-3 rounded-xl bg-white/70 p-3 text-xs">{remaining > 0 ? `Tu examen está a ${remaining} días. Prioriza comprensión y práctica sostenible.` : remaining === 0 ? "Hoy es tu fecha de examen. Repasa con calma y cuida tu descanso." : "Tu fecha de examen ya pasó. Puedes actualizarla o seguir a tu ritmo."} La fecha organiza tu rutina; no garantiza un nivel.</p>}
        </div>
        <div className="rounded-2xl border border-white bg-white/70 p-4">
          <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Tu brújula de habilidades</h3><span className="text-xs">{week.practicedSkills}/5 activadas</span></div>
          <div className="mt-3 flex flex-wrap gap-2">
            {week.skills.map(({ skill, count }) => <span key={skill} className={`rounded-full border px-2.5 py-1.5 text-[11px] ${count ? "border-[#709778]/30 bg-[#edf3ea]" : "border-dashed text-muted-foreground"}`}>{count ? "✓ " : "○ "}{skillNames[skill]} · {count}</span>)}
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground">Actividades de esta semana, no una medición de tu nivel. Un área sin actividad no significa que sea tu debilidad.</p>
          <div className="mt-4 border-t pt-3">
            <p className="text-xs font-semibold">{priority ? `Tu prioridad: ${skillNames[priority]}` : "Tu prioridad: una base equilibrada"}</p>
            <p className="mt-1 text-xs text-muted-foreground">{plan.focus !== "balanced" ? "La elegiste tú. Combínala con otra habilidad para variar." : weakest ? "Basada en tu último simulacro evaluado o tus errores pendientes, no en tus puntos." : "Aún no hay un diagnóstico. Empieza con una sesión guiada de las cinco áreas."}</p>
            <Link href={route} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4">{priority === "grammar" ? `Continuar Grammar · día ${nextGrammar}` : `Sesión guiada · día ${nextDaily}`}<ArrowUpRight size={13} /></Link>
            {entries.length > 0 && <Link href="/cuaderno-errores" className="mt-3 block text-xs font-semibold underline underline-offset-4">{entries.length === 1 ? "Repasar mi tema pendiente" : `Repasar uno de mis ${entries.length} temas pendientes`} →</Link>}
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Una ruta hecha para ti</DialogTitle><DialogDescription>Pequeños compromisos, sin promesas de nivel ni penalizaciones por descansar. Se guarda en tu perfil de este navegador.</DialogDescription></DialogHeader>
          <form onSubmit={(event) => { event.preventDefault(); const distance = daysUntilExam(draft.targetDate, now); if (draft.targetDate && (distance === null || distance < 0)) { setError("Elige una fecha de hoy en adelante, o deja el campo vacío."); return; } useLearningStore.getState().customize(profileKey, { studyPlan: draft }); setOpen(false); }} className="space-y-5">
            <fieldset><legend className="mb-2 text-sm font-semibold">¿Cuántos días por semana?</legend><div className="flex gap-2">{([2, 3, 5] as const).map((days) => <button key={days} type="button" aria-pressed={draft.weeklyDays === days} onClick={() => setDraft({ ...draft, weeklyDays: days })} className={`flex-1 rounded-xl border px-3 py-3 text-sm ${draft.weeklyDays === days ? "bg-primary text-primary-foreground" : "bg-muted/40"}`}>{days} días</button>)}</div></fieldset>
            <label className="block text-sm font-semibold" htmlFor="plan-focus">¿Qué quieres priorizar?</label>
            <select id="plan-focus" value={draft.focus} onChange={(event) => setDraft({ ...draft, focus: event.target.value as StudyPlan["focus"] })} className="w-full rounded-xl border bg-background p-3 text-sm"><option value="balanced">Las cinco habilidades</option>{Object.entries(skillNames).map(([skill, name]) => <option key={skill} value={skill}>{name}</option>)}</select>
            <div><label htmlFor="plan-date" className="text-sm font-semibold">Fecha del examen (opcional)</label><input id="plan-date" type="date" min={dateKey(now)} max="2100-12-31" value={draft.targetDate ?? ""} onChange={(event) => setDraft({ ...draft, targetDate: event.target.value || undefined })} className="mt-2 block w-full min-w-0 rounded-xl border bg-background p-3 text-sm" /></div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <button type="submit" className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Guardar mi ruta</button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
