"use client";

import { rubricResultSchema } from "@/lib/gemini/validation";
import type { RubricResult } from "@/lib/types/attempt";

export async function requestGrade(url: string, body: unknown): Promise<RubricResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: controller.signal });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "La evaluación no está disponible ahora. Vuelve a intentar.");
    const parsed = rubricResultSchema.safeParse(payload);
    if (!parsed.success) throw new Error("La evaluación recibida no es válida. No se guardó ninguna nota; vuelve a intentar.");
    return parsed.data;
  } catch (error) {
    if (controller.signal.aborted) throw new Error("La evaluación tardó demasiado. Tu respuesta guardada no se perdió; puedes volver a intentar.");
    throw error;
  } finally { clearTimeout(timeout); }
}
