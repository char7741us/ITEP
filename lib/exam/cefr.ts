import type { CEFRBand } from "@/lib/types/attempt";

export interface CEFRBandInfo {
  band: CEFRBand;
  minScore: number;
  maxScore: number;
  label: string;
  description: string;
}

export const CEFR_BANDS: CEFRBandInfo[] = [
  {
    band: "Below B2",
    minScore: 0,
    maxScore: 3.4,
    label: "Por debajo de B2",
    description:
      "Aún tiene dificultad para sostener una conversación o comprender textos de nivel intermedio-alto sin apoyo. Se recomienda reforzar vocabulario y estructuras gramaticales básicas a intermedias antes de intentar un simulacro completo cronometrado.",
  },
  {
    band: "B2",
    minScore: 3.5,
    maxScore: 4.4,
    label: "B2 — Intermedio Alto",
    description:
      "Puede comprender las ideas principales de textos complejos y comunicarse con cierta fluidez, pero aún duda al buscar vocabulario preciso y comete errores al expresar ideas abstractas.",
  },
  {
    band: "C1",
    minScore: 4.5,
    maxScore: 5.4,
    label: "C1 — Dominio Operativo Eficaz",
    description:
      "Se expresa con fluidez y espontaneidad, con errores gramaticales esporádicos que no impiden la comprensión. Comprende textos extensos y exigentes, reconociendo significados implícitos y matices.",
  },
  {
    band: "C2",
    minScore: 5.5,
    maxScore: 6.0,
    label: "C2 — Maestría",
    description:
      "Domina el idioma con precisión casi nativa, incluyendo detalles de conversaciones profesionales y académicas complejas, con un control estructural y léxico prácticamente sin errores.",
  },
];

export function scoreToBand(score: number): CEFRBandInfo {
  const band = CEFR_BANDS.find((b) => score >= b.minScore && score <= b.maxScore);
  return band ?? CEFR_BANDS[0];
}

export const CEFR_RUBRIC_ANCHOR_TEXT = CEFR_BANDS.map(
  (b) => `${b.label} (${b.minScore.toFixed(1)}-${b.maxScore.toFixed(1)}): ${b.description}`
).join("\n");
