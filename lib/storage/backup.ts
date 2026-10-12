"use client";

import { getDb } from "./db";
import { getProfiles, getActiveUsername } from "./profileRepo";
import { useDailyProgressStore } from "@/lib/content/daily/progress";
import { useGrammarProgressStore } from "@/lib/grammar-c1/progress";
import { useErrorNotebookStore } from "@/lib/notebook/store";
import { hydrateLearning, useLearningStore } from "@/lib/learning/store";
import { studyBackupSchema, mergeStudyBackups, MAX_BACKUP_BYTES, type StudyBackup } from "./backup-schema";
import { reportStorageProblem } from "./health";

const storageEntries = (backup: StudyBackup): [string, string][] => [
  ["itep-simulator:profiles", JSON.stringify(backup.profiles)],
  ["itep-simulator:active-profile", backup.activeUsername ?? ""],
  ["itep-simulator:daily-progress", JSON.stringify({ state: backup.daily, version: 1 })],
  ["itep-simulator:grammar-c1-progress", JSON.stringify({ state: backup.grammar, version: 2 })],
  ["itep-simulator:error-notebook", JSON.stringify({ state: backup.notebook, version: 3 })],
  ["itep-simulator:learning-companion", JSON.stringify({ state: backup.learning, version: 1 })],
];

export async function createStudyBackup(includeAudio = true): Promise<StudyBackup> {
  await Promise.all([hydrateLearning(), ...[useDailyProgressStore, useGrammarProgressStore, useErrorNotebookStore].map((store) => store.persist.hasHydrated() ? undefined : store.persist.rehydrate())]);
  const db = await getDb();
  const attempts = (await db.getAll("attempts")).filter((attempt) => attempt.status === "completed");
  const notebook = useErrorNotebookStore.getState();
  const grammar = useGrammarProgressStore.getState();
  const audio: StudyBackup["audio"] = [];
  if (includeAudio) {
    const keys = new Set([...attempts.flatMap((attempt) => attempt.responses.speaking.map((item) => item.audioBlobKey)), ...Object.values(useDailyProgressStore.getState().days).map((day) => day.speakingAudioKey)].filter((key): key is string => !!key));
    let bytes = 0;
    for (const key of keys) {
      const record = await db.get("speakingAudioBlobs", key);
      if (!record) continue;
      bytes += record.blob.size;
      if (record.blob.size > 3_000_000 || bytes > 60 * 1024 * 1024) throw new Error("Hay demasiados audios para una sola copia. Desmarca ‘Incluir grabaciones’ para guardar el resto del progreso.");
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = () => reject(new Error("No se pudo leer una grabación."));
        reader.readAsDataURL(record.blob);
      });
      audio.push({ key, mimeType: record.blob.type || "audio/webm", base64 });
    }
  }
  return studyBackupSchema.parse({ format: "itep-study-backup", version: 1, exportedAt: new Date().toISOString(), profiles: getProfiles(), activeUsername: getActiveUsername(), daily: { days: useDailyProgressStore.getState().days }, grammar: { byProfile: grammar.byProfile, daysByProfile: grammar.daysByProfile }, notebook: { entries: notebook.entries, processedAttemptIds: notebook.processedAttemptIds, studyDaysByProfile: notebook.studyDaysByProfile, masteredByProfile: notebook.masteredByProfile, masteredTopics: notebook.masteredTopics, productiveFeedback: notebook.productiveFeedback }, learning: { profiles: useLearningStore.getState().profiles }, attempts, includedAudio: includeAudio, audio });
}

export function downloadStudyBackup(backup: StudyBackup) {
  const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
  if (blob.size > MAX_BACKUP_BYTES) throw new Error("La copia supera 100 MB. Prueba sin incluir grabaciones.");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `itep-progreso-${backup.exportedAt.slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function restoreStudyBackup(incoming: StudyBackup): Promise<void> {
  // Existing recordings stay in IndexedDB; only missing incoming records are added.
  const current = await createStudyBackup(false);
  const merged = studyBackupSchema.parse(mergeStudyBackups(current, studyBackupSchema.parse(incoming)));
  const pairs = storageEntries(merged);
  const previous = pairs.map(([key]) => [key, localStorage.getItem(key)] as const);
  const db = await getDb();
  const attemptIds = new Set(await db.getAllKeys("attempts"));
  const audioIds = new Set(await db.getAllKeys("speakingAudioBlobs"));
  const tx = db.transaction(["attempts", "speakingAudioBlobs"], "readwrite");
  // Observe rejection immediately, including quota errors/explicit aborts.
  const done = tx.done;
  void done.catch(() => {});
  const writes: Promise<unknown>[] = [];
  try {
    for (const attempt of merged.attempts) if (!attemptIds.has(attempt.id)) writes.push(tx.objectStore("attempts").put(attempt));
    for (const record of merged.audio) if (!audioIds.has(record.key)) {
      const bytes = Uint8Array.from(atob(record.base64), (character) => character.charCodeAt(0));
      writes.push(tx.objectStore("speakingAudioBlobs").put({ key: record.key, blob: new Blob([bytes], { type: record.mimeType }) }));
    }
    // A synchronous localStorage failure must not leave queued requests unobserved.
    for (const write of writes) void write.catch(() => {});
    // Synchronous local writes keep this IndexedDB transaction alive. Roll back on failure.
    for (const [key, value] of pairs) localStorage.setItem(key, value);
    await Promise.all([...writes, done]);
  } catch {
    try { tx.abort(); } catch { /* Transaction may already have failed. */ }
    for (const [key, value] of previous) {
      try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); }
      catch { reportStorageProblem(); }
    }
    throw new Error("No se pudo restaurar la copia. Puede faltar espacio en este navegador. Conserva el archivo; no se eliminaron tus registros existentes.");
  }
}
