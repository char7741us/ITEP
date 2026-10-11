import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AttemptRecord } from "@/lib/types/attempt";
import type { ExamContentPack } from "@/lib/types/content";

vi.mock("@/lib/storage/attemptsRepo", () => ({
  getSpeakingAudio: vi.fn(async () => new Blob(["audio"], { type: "audio/webm" })),
}));

import { retryMissingGrades } from "./grading";

const pack = {
  writing: { tasks: [{ taskNumber: 1, title: "Essay", prompt: "Explain the issue", minWords: 100, maxWords: 200 }] },
  speaking: { tasks: [{ taskNumber: 1, title: "Opinion", prompt: "Explain your view" }] },
} as unknown as ExamContentPack;

const attempt = {
  id: "attempt-1",
  responses: {
    reading: [], listening: [], grammar: [],
    writing: [{ taskNumber: 1, text: "A thoughtful answer", wordCount: 3 }],
    speaking: [{ taskNumber: 1, audioBlobKey: "audio-1" }],
  },
  scores: { reading: 4, listening: 4, grammar: 4, writing: 0, speaking: 0, overall: 4, overallBand: "B2" },
  gradingErrors: ["Writing Tarea 1: La clave no funciona", "Speaking Tarea 1: La clave no funciona"],
} as unknown as AttemptRecord;

describe("retryMissingGrades", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => new Response(JSON.stringify({
      score: url.includes("writing") ? 5 : 6,
      cefrBand: "C1",
      dimensionScores: {}, rationale: "Reason", strengths: [], improvements: [],
    }), { status: 200, headers: { "Content-Type": "application/json" } })));
  });

  it("regrades saved writing and speaking and replaces the partial score", async () => {
    const updated = await retryMissingGrades(attempt, pack);
    expect(updated.responses.writing[0].grading?.score).toBe(5);
    expect(updated.responses.speaking[0].grading?.score).toBe(6);
    expect(updated.gradingErrors).toEqual([]);
    expect(updated.scores?.overall).toBe(4.6);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(attempt.responses.writing[0].grading).toBeUndefined();
  });
});
