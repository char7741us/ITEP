"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Download, Upload, ShieldCheck, LoaderCircle } from "lucide-react";
import { createStudyBackup, downloadStudyBackup, restoreStudyBackup } from "@/lib/storage/backup";
import { MAX_BACKUP_BYTES, parseStudyBackup, type StudyBackup } from "@/lib/storage/backup-schema";
import { useLearningContext } from "@/components/learning/LearningProvider";

export default function MyDataPage() {
  const { ready } = useLearningContext();
  const [includeAudio, setIncludeAudio] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [incoming, setIncoming] = useState<StudyBackup | null>(null);
  const [restored, setRestored] = useState(false);
  const lock = useRef(false);
  async function download() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(""); setMessage("");
    try { downloadStudyBackup(await createStudyBackup(includeAudio)); setMessage("Copia preparada para descargar. Comprueba que el archivo esté en Descargas y guárdalo en un lugar privado."); }
    catch (cause) { setError(cause instanceof Error && cause.name !== "ZodError" ? cause.message : "No se pudo preparar una copia válida. Conserva esta pestaña y revisa el almacenamiento del navegador."); }
    finally { lock.current = false; setBusy(false); }
  }
  async function readFile(file: File | undefined) {
    if (!file || lock.current) return;
    lock.current = true; setBusy(true); setError(""); setMessage(""); setIncoming(null);
    try { if (file.size > MAX_BACKUP_BYTES) throw new Error("El archivo supera 100 MB."); setIncoming(parseStudyBackup(await file.text())); }
    catch { setError("No es una copia válida de iTEP Simulator, está dañada o supera el límite de 100 MB. No se cambió tu progreso."); }
    finally { lock.current = false; setBusy(false); }
  }
  async function restore() {
    if (!incoming || lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try { await restoreStudyBackup(incoming); setIncoming(null); setRestored(true); setMessage("Copia restaurada. Los registros existentes se conservaron. Recarga para empezar a usar el progreso recuperado."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo restaurar la copia."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="mx-auto w-full max-w-4xl space-y-7 px-4 py-10">
    <Link href="/" className="text-sm font-semibold underline underline-offset-4">← Volver a mi espacio</Link>
    <header><p className="study-eyebrow">TU ESFUERZO MERECE UNA COPIA</p><h1 className="mt-2 text-3xl sm:text-4xl">Tus datos, sin sorpresas.</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">El progreso vive en este navegador, no en una cuenta en la nube. Una copia te permite conservarlo o llevarlo manualmente a otro navegador.</p></header>
    <div className="rounded-2xl border border-primary/15 bg-secondary/20 p-4 text-sm leading-relaxed"><strong>Antes de cambiar de dispositivo:</strong> termina tu práctica, descarga una copia y cierra otras pestañas del simulador. Borrar datos del sitio o usar modo privado puede eliminar el progreso. Los perfiles locales no tienen contraseña y no son cuentas privadas.</div>
    <div className="grid gap-5 sm:grid-cols-2">
      <section className="study-card"><Download size={22} /><h2 className="mt-3 text-xl">Llévate tu progreso</h2><p className="mt-2 text-sm text-muted-foreground">Incluye todos los perfiles de este navegador, Cuaderno, temas superados, plan personal, mascota, práctica diaria, Grammar y simulacros terminados.</p><label className="mt-5 flex items-start gap-2 text-sm"><input type="checkbox" checked={includeAudio} onChange={(event) => setIncludeAudio(event.target.checked)} disabled={busy || restored} className="mt-1" /><span>Incluir grabaciones de Speaking<span className="mt-1 block text-xs text-muted-foreground">El archivo será más grande y contendrá tu voz. Sin ellas, conservarás notas y feedback, pero no podrás reproducir o recalificar esos audios en otro navegador.</span></span></label><button disabled={!ready || busy || restored} onClick={() => void download()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"><Download size={16} />Descargar mi copia</button><p className="mt-3 text-[11px] text-muted-foreground">No incluye simulacros en curso ni conversaciones del coach. No contiene claves de API. Máximo 100 MB; si hay demasiados audios, descarga sin grabaciones.</p></section>
      <section className="study-card"><Upload size={22} /><h2 className="mt-3 text-xl">Recupera una copia</h2><p className="mt-2 text-sm text-muted-foreground">Usa solo un archivo creado por el simulador. Se valida antes de restaurar y no se sobrescriben registros que ya existan en este navegador.</p><label htmlFor="study-backup-file" className="mt-5 block text-sm font-semibold">Seleccionar copia .json</label><input id="study-backup-file" type="file" accept=".json,application/json" disabled={!ready || busy || restored} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; void readFile(file); }} className="mt-2 block w-full min-w-0 text-xs file:mr-2 file:rounded-full file:border file:bg-background file:px-3 file:py-2" />
        {incoming && <div className="mt-4 rounded-xl border bg-muted/50 p-4 text-xs"><p className="font-semibold">Copia del {new Date(incoming.exportedAt).toLocaleDateString("es-CO")}</p><p className="mt-2">{incoming.profiles.length} perfiles · {incoming.attempts.length} simulacros · {incoming.notebook.entries.length} temas pendientes · {incoming.audio.length} grabaciones</p><p className="mt-2">Si una sesión, tema, intento o día de Grammar ya existe, se conserva la versión actual. El archivo no se envía a ningún servidor.</p><button disabled={busy} onClick={() => void restore()} className="mt-3 w-full rounded-full bg-primary px-3 py-2 font-semibold text-primary-foreground">Restaurar sin sobrescribir</button><button onClick={() => setIncoming(null)} disabled={busy} className="mt-2 w-full py-2 underline">Cancelar</button></div>}
        <p className="mt-4 text-[11px] text-muted-foreground">El archivo no está cifrado. No lo compartas públicamente: puede contener nombres, textos, errores y grabaciones de todos los perfiles locales.</p>
      </section>
    </div>
    {busy && <p role="status" className="flex items-center gap-2 text-sm"><LoaderCircle size={16} className="animate-spin" />Preparando los datos… Mantén esta pestaña abierta.</p>}
    {error && <p role="alert" className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">{error}</p>}
    {message && <p role="status" className="rounded-xl border border-[#709778]/30 bg-[#edf3ea] p-4 text-sm">{message}</p>}
    {restored && <button onClick={() => window.location.reload()} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Recargar y usar mi progreso</button>}
    <section className="study-card"><p className="study-eyebrow flex items-center gap-2"><ShieldCheck size={14} /> CÓMO FUNCIONA ESTA HERRAMIENTA</p><div className="mt-4 grid gap-5 text-sm leading-relaxed sm:grid-cols-2"><div><h2 className="font-semibold">Práctica, no certificación</h2><p className="mt-2 text-muted-foreground">Es un simulador independiente inspirado en el formato de iTEP Academic-Plus, sin afiliación oficial. Los bancos son originales; las puntuaciones y bandas son estimaciones internas. Los destellos reflejan participación, no dominio del idioma. No se garantiza C1 en 20 días.</p></div><div><h2 className="font-semibold">Cuándo se utiliza IA</h2><p className="mt-2 text-muted-foreground">Al pedir evaluación, tu texto o audio y la consigna se procesan con Gemini de Google. Para ejercicios gemelos se envía la regla fallada; para el coach, tu consulta, el ejercicio y un resumen de progreso. No incluyas datos sensibles en las respuestas.</p><p className="mt-2 text-muted-foreground">La IA puede equivocarse y su disponibilidad depende del proveedor. Revisa sus <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer" className="underline">condiciones de uso y tratamiento de datos</a>. El uso de Gemini en este aplicativo está previsto para mayores de 18 años.</p></div></div></section>
  </div>;
}
