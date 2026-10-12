"use client";

import { useSyncExternalStore } from "react";
import type { StateStorage } from "zustand/middleware";

let problem: string | null = null;
const listeners = new Set<() => void>();
export function reportStorageProblem() {
  if (problem) return;
  problem = "El navegador no pudo guardar o recuperar parte del progreso. No cierres esta pestaña: descarga una copia desde ‘Mis datos’ antes de continuar. Revisa el espacio disponible y evita el modo privado.";
  listeners.forEach((listener) => listener());
}
export function useStorageProblem() {
  return useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener); }, () => problem, () => null);
}
/** Keep practice usable in memory, but make a failed durable write visible. */
export const trackedStorage: StateStorage = {
  getItem: (name) => { try { return localStorage.getItem(name); } catch { reportStorageProblem(); return null; } },
  setItem: (name, value) => { try { localStorage.setItem(name, value); } catch { reportStorageProblem(); } },
  removeItem: (name) => { try { localStorage.removeItem(name); } catch { reportStorageProblem(); } },
};
