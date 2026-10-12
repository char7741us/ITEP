import { describe, expect, it } from "vitest";
import { hasCompleteSkillGrade, isPartialAttempt } from "./grade-status";
import type { AttemptRecord, RubricResult } from "@/lib/types/attempt";

const grade: RubricResult = { score: 4.5, cefrBand: "C1", dimensionScores: {}, rationale: "Reason", strengths: [], improvements: [] };
const attempt: AttemptRecord = {
  id: "test", contentPackId: "test", contentPackVersion: "1", mode: "practice", status: "completed", startedAt: "2026-10-11T12:00:00.000Z", currentSection: "done", sectionTimings: {},
  scores: { reading: 4, listening: 4, grammar: 4, writing: 4.5, speaking: 4.5, overall: 4.2, overallBand: "B2" },
  responses: { reading: [], listening: [], grammar: [], writing: [{ taskNumber: 1, text: "Essay", wordCount: 1, grading: grade }, { taskNumber: 2, text: "Essay", wordCount: 1, grading: grade }], speaking: [{ taskNumber: 1, audioBlobKey: "a", grading: grade }, { taskNumber: 2, audioBlobKey: "b", grading: grade }] },
};
describe("notas parciales coherentes en todo el producto", () => {
  it("requires both distinct productive tasks to be graded", () => {
    expect(hasCompleteSkillGrade(attempt, "writing")).toBe(true);
    const incomplete = { ...attempt, responses: { ...attempt.responses, writing: [attempt.responses.writing[0]] } };
    expect(hasCompleteSkillGrade(incomplete, "writing")).toBe(false);
    expect(isPartialAttempt(incomplete)).toBe(true);
  });
  it("does not mistake duplicate task-one grades for a complete section", () => {
    const duplicate = { ...attempt, responses: { ...attempt.responses, writing: [attempt.responses.writing[0], attempt.responses.writing[0]] } };
    expect(hasCompleteSkillGrade(duplicate, "writing")).toBe(false);
  });
  it("recognizes full results and cannot classify an in-progress attempt as graded", () => {
    expect(isPartialAttempt(attempt)).toBe(false);
    expect(hasCompleteSkillGrade({ ...attempt, status: "in_progress" }, "grammar")).toBe(false);
  });
});
