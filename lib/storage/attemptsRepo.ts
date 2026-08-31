import { getDb } from "./db";
import type { AttemptRecord } from "@/lib/types/attempt";

export async function saveAttempt(attempt: AttemptRecord): Promise<void> {
  const db = await getDb();
  await db.put("attempts", attempt);
}

export async function getAttempt(id: string): Promise<AttemptRecord | undefined> {
  const db = await getDb();
  return db.get("attempts", id);
}

export async function listAttempts(): Promise<AttemptRecord[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("attempts", "by-startedAt");
  return all.reverse();
}

export async function deleteAttempt(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("attempts", id);
}

export async function saveSpeakingAudio(key: string, blob: Blob): Promise<void> {
  const db = await getDb();
  await db.put("speakingAudioBlobs", { key, blob });
}

export async function getSpeakingAudio(key: string): Promise<Blob | undefined> {
  const db = await getDb();
  const record = await db.get("speakingAudioBlobs", key);
  return record?.blob;
}

export async function exportAllAttempts(): Promise<AttemptRecord[]> {
  return listAttempts();
}

export async function clearAllData(): Promise<void> {
  const db = await getDb();
  await db.clear("attempts");
  await db.clear("speakingAudioBlobs");
}
