import { getDb } from "./db";
import type { AttemptRecord } from "@/lib/types/attempt";
import { recordLearningActivity } from "@/lib/learning/store";

export async function saveAttempt(attempt: AttemptRecord): Promise<void> {
  const db = await getDb();
  const previous = await db.get("attempts", attempt.id);
  await db.put("attempts", attempt);
  const username = attempt.profileUsername ?? null;
  for (const skill of ["grammar", "reading", "listening"] as const) {
    const earlier = new Map(previous?.responses[skill].map((response) => [response.itemId, response.selectedIndex]) ?? []);
    for (const response of attempt.responses[skill]) {
      if (response.selectedIndex !== null && earlier.get(response.itemId) == null) {
        void recordLearningActivity(username, { id: `exam:${attempt.id}:${skill}:${response.itemId}`, kind: "question", skill, label: `Pregunta de ${skill}` });
      }
    }
  }
  if (attempt.sectionTimings.writing?.submittedAt && !previous?.sectionTimings.writing?.submittedAt) {
    for (const response of attempt.responses.writing.filter((item) => item.text.trim())) {
      void recordLearningActivity(username, { id: `exam:${attempt.id}:writing:${response.taskNumber}`, kind: "writing", skill: "writing", label: `Writing · tarea ${response.taskNumber}` });
    }
  }
  for (const response of attempt.responses.speaking) {
    if (response.audioBlobKey && !previous?.responses.speaking.find((item) => item.taskNumber === response.taskNumber)?.audioBlobKey) {
      void recordLearningActivity(username, { id: `exam:${attempt.id}:speaking:${response.taskNumber}`, kind: "speaking", skill: "speaking", label: `Speaking · tarea ${response.taskNumber}` });
    }
  }
  if (attempt.status === "completed") {
    if (previous?.status !== "completed") void recordLearningActivity(username, { id: `exam:${attempt.id}:complete`, kind: "exam", label: "Simulacro completado", at: attempt.completedAt });
    if (typeof window !== "undefined") window.dispatchEvent(new Event("itep-attempt-saved"));
  }
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
