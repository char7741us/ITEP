import type { ExamContentPack } from "@/lib/types/content";
import type { ExamMode } from "@/lib/types/mode";
import { validateContentPack } from "./schema";
import { itepAcademicPlusV1 } from "./packs/itep-academic-plus-v1";
import { itepAcademicPlusV2 } from "./packs/itep-academic-plus-v2";

const REGISTRY: Record<string, ExamContentPack> = {
  "itep-academic-plus@1.0.0": itepAcademicPlusV1,
  "itep-academic-plus-alt@1.0.0": itepAcademicPlusV2,
};

export const DEFAULT_CONTENT_PACK_KEY = "itep-academic-plus@1.0.0";

/**
 * Practice and Intensive draw from separate content pools so the two modes
 * never show the exact same questions back to back. Each pool currently has
 * one pack; adding more packs to a pool automatically gets picked up by the
 * random choice below without touching call sites.
 */
const PACKS_BY_MODE: Record<ExamMode, string[]> = {
  intensive: ["itep-academic-plus@1.0.0"],
  practice: ["itep-academic-plus-alt@1.0.0"],
};

export function pickContentPackKeyForMode(mode: ExamMode): string {
  const pool = PACKS_BY_MODE[mode];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function listContentPacks(): { key: string; title: string }[] {
  return Object.entries(REGISTRY).map(([key, pack]) => ({ key, title: pack.manifest.title }));
}

export function loadContentPack(key: string = DEFAULT_CONTENT_PACK_KEY): ExamContentPack {
  const pack = REGISTRY[key];
  if (!pack) {
    throw new Error(`Banco de contenido no encontrado: ${key}`);
  }
  return validateContentPack(pack) as ExamContentPack;
}
