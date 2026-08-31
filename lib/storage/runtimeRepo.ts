const PREFIX = "itep-simulator:runtime:";

/**
 * Persists the exam machine's XState snapshot (not the durable AttemptRecord —
 * that lives in IndexedDB and is only written once grading completes). This is
 * what lets a mid-exam page refresh resume with the correct remaining time
 * instead of restarting the clock or the section from scratch. localStorage is
 * fine here: the context excludes the static content pack (see machine.types.ts),
 * so the payload stays a few KB even mid-Listening.
 */
export function saveRuntimeSnapshot(attemptId: string, snapshot: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + attemptId, JSON.stringify(snapshot));
  } catch {
    // Best-effort — if storage is unavailable/full, resuming just won't work.
  }
}

export function loadRuntimeSnapshot(attemptId: string): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + attemptId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearRuntimeSnapshot(attemptId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PREFIX + attemptId);
}
