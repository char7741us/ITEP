import { describe, expect, it } from "vitest";
import { itepAcademicPlusV1 } from "@/lib/content/packs/itep-academic-plus-v1";
import type { AttemptRecord, RubricResult } from "@/lib/types/attempt";
import { getC1PracticeReadiness } from "./readiness";

const grade: RubricResult = { score: 4.7, cefrBand: "C1", dimensionScores: {}, rationale: "", strengths: [], improvements: [] };

function completeAttempt(): AttemptRecord {
  const pack = itepAcademicPlusV1;
  return {
    responses: {
      reading: pack.reading.parts.flatMap((part) => part.items.map((item) => ({ itemId: item.id, selectedIndex: item.correctIndex, timeSpentMs: 0 }))),
      listening: pack.listening.parts.flatMap((part) => part.segments.flatMap((segment) => segment.items.map((item) => ({ itemId: item.id, selectedIndex: item.correctIndex, timeSpentMs: 0 })))),
      grammar: pack.grammar.parts.flatMap((part) => part.items.map((item) => ({ itemId: item.id, selectedIndex: item.correctIndex, timeSpentMs: 0 }))),
      writing: [1, 2].map((taskNumber) => ({ taskNumber: taskNumber as 1 | 2, text: "example", wordCount: 1, grading: grade })),
      speaking: [1, 2].map((taskNumber) => ({ taskNumber: taskNumber as 1 | 2, audioBlobKey: "test", grading: grade })),
    },
  } as AttemptRecord;
}

describe("meta interna C1", () => {
  it("requires each objective section and each productive task independently", () => {
    const attempt = completeAttempt();
    expect(getC1PracticeReadiness(attempt, itepAcademicPlusV1).ready).toBe(true);
    attempt.responses.reading[0].selectedIndex = null;
    attempt.responses.reading[1].selectedIndex = null;
    expect(getC1PracticeReadiness(attempt, itepAcademicPlusV1).checks[0].detail).toContain("8/10");
    expect(getC1PracticeReadiness(attempt, itepAcademicPlusV1).ready).toBe(false);
    attempt.responses.reading[0].selectedIndex = itepAcademicPlusV1.reading.parts[0].items[0].correctIndex;
    attempt.responses.reading[1].selectedIndex = itepAcademicPlusV1.reading.parts[0].items[1].correctIndex;
    attempt.responses.speaking[1].grading = undefined;
    expect(getC1PracticeReadiness(attempt, itepAcademicPlusV1).checks[4]).toMatchObject({ met: false, detail: "Falta evaluar una o ambas tareas con IA" });
  });
});
