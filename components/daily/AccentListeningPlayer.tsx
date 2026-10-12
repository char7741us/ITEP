"use client";

import { useEffect, useRef, useState } from "react";
import { accents, suggestedAccent, type AccentId } from "@/lib/content/c1-lab/accents";
import { Button } from "@/components/ui/button";

// Session cache only; never stores student speech. Static assets can replace generation later.
const audioCache = new Map<string, Blob>();
export function AccentListeningPlayer({ source, id, day = 1, original }: { source: "daily" | "lab"; id: string; day?: number; original?: string }) {
  const [accent, setAccent] = useState<AccentId>(suggestedAccent(day));
  const [loadedAccent, setLoadedAccent] = useState<AccentId | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [slow, setSlow] = useState(false);
  const [useOriginal, setUseOriginal] = useState(Boolean(original));
  const audio = useRef<HTMLAudioElement>(null);
  const controller = useRef<AbortController | null>(null);
  const currentUrl = useRef<string | null>(null);
  useEffect(() => () => { controller.current?.abort(); if (currentUrl.current) URL.revokeObjectURL(currentUrl.current); }, []);
  useEffect(() => { if (audio.current) audio.current.playbackRate = slow ? 0.85 : 1; }, [slow, url, useOriginal]);
  async function load() {
    if (busy) return;
    setBusy(true); setError(""); setUseOriginal(false);
    audio.current?.pause();
    const abort = new AbortController(); controller.current = abort;
    const timeout = setTimeout(() => abort.abort(), 55_000);
    try {
      const key = `${source}:${id}:${accent}`;
      let blob = audioCache.get(key);
      if (!blob) {
        const response = await fetch("/api/listening-audio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source, id, accent }), signal: abort.signal });
        if (!response.ok) { const result = await response.json().catch(() => null); throw new Error(result?.error ?? "No se pudo generar este audio."); }
        if (!response.headers.get("Content-Type")?.startsWith("audio/")) throw new Error("La respuesta no contenía un audio válido.");
        blob = await response.blob();
        if (audioCache.size >= 12) audioCache.delete(audioCache.keys().next().value!);
        audioCache.set(key, blob);
      }
      if (abort.signal.aborted) return;
      if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
      currentUrl.current = URL.createObjectURL(blob);
      setUrl(currentUrl.current); setLoadedAccent(accent);
    } catch (cause) { if (!abort.signal.aborted) setError(cause instanceof Error ? cause.message : "No se pudo cargar el audio."); else setError("La generación tardó demasiado. Puedes reintentar; tu progreso sigue guardado."); }
    finally { clearTimeout(timeout); if (controller.current === abort) { controller.current = null; setBusy(false); } }
  }
  return <div className="space-y-3 rounded-2xl border bg-primary/5 p-4">
    <p className="text-sm font-semibold">🌍 Un diálogo, distintas formas de escucharlo</p>
    <label className="block text-xs font-medium">Acento solicitado<select aria-label="Acento de Listening" className="mt-1 block w-full rounded-lg border bg-background p-2 text-sm" value={accent} disabled={busy} onChange={(event) => setAccent(event.target.value as AccentId)}>{accents.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.locale}</option>)}</select></label>
    <div className="flex flex-wrap gap-2"><Button onClick={load} disabled={busy}>{busy ? "Preparando audio…" : "Cargar este acento"}</Button>{original && <Button variant="outline" disabled={busy} onClick={() => { audio.current?.pause(); setUseOriginal(true); setError(""); }}>Usar audio original</Button>}</div>
    <p className="text-xs text-muted-foreground">Voces sintéticas generadas con Gemini; aproximan variedades regionales, no representan a todos sus hablantes. Crear una variante usa la API y puede tardar hasta 50 segundos. Repetirla en esta visita no vuelve a generarla.</p>
    {(useOriginal || url) && <><p className="text-xs font-semibold">Reproduciendo: {useOriginal ? "audio original · voces de EE. UU. y Reino Unido" : accents.find((item) => item.id === loadedAccent)?.label}{!useOriginal && loadedAccent !== accent ? " (carga la nueva selección para cambiarlo)" : ""}</p><audio ref={audio} controls preload="metadata" src={useOriginal ? original : url!} className="w-full" aria-label="Diálogo Listening" onError={() => setError("No se pudo reproducir el audio. Intenta cargarlo de nuevo.")} /><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={slow} onChange={(event) => setSlow(event.target.checked)} /> Escucha de apoyo a 0.85×; después vuelve a velocidad normal</label></>}
    <p className="text-xs">1. Escucha sin texto y resume la idea. 2. Repite para localizar evidencia. 3. Comprueba la transcripción. 4. Vuelve sin texto y a 1×.</p>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </div>;
}
