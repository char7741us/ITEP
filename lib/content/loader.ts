import type { ExamContentPack } from "@/lib/types/content";
import type { ExamMode } from "@/lib/types/mode";
import { validateContentPack } from "./schema";
import { itepAcademicPlusV1 } from "./packs/itep-academic-plus-v1";
import { itepAcademicPlusV2 } from "./packs/itep-academic-plus-v2";

const ORIGINAL_PACKS: Record<string, ExamContentPack> = {
  "itep-academic-plus@1.0.0": itepAcademicPlusV1,
  "itep-academic-plus-alt@1.0.0": itepAcademicPlusV2,
};

const mixedPacks = Array.from({ length: 30 }, (_, index) => index + 1).map((mask) => {
  const packId = `itep-academic-plus-mix-${mask.toString(2).padStart(5, "0")}`;
  const pack: ExamContentPack = {
    manifest: {
      ...itepAcademicPlusV1.manifest,
      packId,
      title: `iTEP Academic-Plus — Variante ${mask + 1}`,
    },
    reading: mask & 1 ? itepAcademicPlusV2.reading : itepAcademicPlusV1.reading,
    listening: mask & 2 ? itepAcademicPlusV2.listening : itepAcademicPlusV1.listening,
    grammar: mask & 4 ? itepAcademicPlusV2.grammar : itepAcademicPlusV1.grammar,
    writing: mask & 8 ? itepAcademicPlusV2.writing : itepAcademicPlusV1.writing,
    speaking: mask & 16 ? itepAcademicPlusV2.speaking : itepAcademicPlusV1.speaking,
  };
  return [`${packId}@1.0.0`, pack] as const;
});

const REGISTRY: Record<string, ExamContentPack> = {
  ...ORIGINAL_PACKS,
  ...Object.fromEntries(mixedPacks),
};

export const DEFAULT_CONTENT_PACK_KEY = "itep-academic-plus@1.0.0";

// Each variant draws whole, validated sections from the two original banks.
// Parity keeps the two mode pools disjoint while allowing 16 variants per mode.
const PACKS_BY_MODE: Record<ExamMode, string[]> = {
  intensive: Object.keys(REGISTRY).filter((key) => sectionMask(key) % 2 === 0),
  practice: Object.keys(REGISTRY).filter((key) => sectionMask(key) % 2 === 1),
};

function sectionMask(key: string): number {
  if (key === "itep-academic-plus@1.0.0") return 0;
  if (key === "itep-academic-plus-alt@1.0.0") return 31;
  return Number.parseInt(key.match(/mix-([01]{5})@/)?.[1] ?? "0", 2);
}

export function pickContentPackKeyForMode(mode: ExamMode, previousKey?: string): string {
  const pool = PACKS_BY_MODE[mode].filter((key) => key !== previousKey);
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
