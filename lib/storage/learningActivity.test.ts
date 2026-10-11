import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AttemptRecord } from "@/lib/types/attempt";

const mocks = vi.hoisted(() => ({
  records: new Map<string, AttemptRecord>(),
  track: vi.fn<(username: string | null, input: { id: string; kind: string }) => Promise<void>>().mockResolvedValue(undefined),
}));
vi.mock("./db", () => ({
  getDb: async () => ({
    get: async (_store: string, id: string) => mocks.records.get(id),
    put: async (_store: string, record: AttemptRecord) => {
      mocks.records.set(record.id, JSON.parse(JSON.stringify(record)));
    },
  }),
}));
vi.mock("@/lib/learning/store", () => ({
  recordLearningActivity: mocks.track,
}));
import { saveAttempt } from "./attemptsRepo";

describe("registro de práctica en simulacros", () => {
  beforeEach(() => {
    mocks.records.clear();
    mocks.track.mockClear();
  });
  it("does not reward opening an exam and does not reward autosaves or grade retries twice", async () => {
    const attempt = {
      id: "exam-one",
      profileUsername: "michi",
      status: "in_progress",
      sectionTimings: {},
      responses: {
        grammar: [{ itemId: "g1", selectedIndex: null, timeSpentMs: 0 }],
        reading: [],
        listening: [],
        writing: [],
        speaking: [],
      },
    } as unknown as AttemptRecord;
    await saveAttempt(attempt);
    expect(mocks.track).not.toHaveBeenCalled();
    const answered = {
      ...attempt,
      responses: {
        ...attempt.responses,
        grammar: [{ itemId: "g1", selectedIndex: 2, timeSpentMs: 5000 }],
      },
    };
    await saveAttempt(answered);
    await saveAttempt(answered);
    expect(mocks.track).toHaveBeenCalledTimes(1);
    expect(mocks.track).toHaveBeenCalledWith(
      "michi",
      expect.objectContaining({
        id: "exam:exam-one:grammar:g1",
        kind: "question",
        skill: "grammar",
      }),
    );
    const completed = {
      ...answered,
      status: "completed",
      completedAt: new Date().toISOString(),
      responses: {
        ...answered.responses,
        writing: [{ taskNumber: 1, text: "My answer", wordCount: 2 }],
        speaking: [{ taskNumber: 1, audioBlobKey: "audio-one" }],
      },
      sectionTimings: { writing: { submittedAt: new Date().toISOString() } },
    } as AttemptRecord;
    await saveAttempt(completed);
    await saveAttempt(completed);
    expect(mocks.track).toHaveBeenCalledTimes(4);
    expect(mocks.track.mock.calls.map((args) => args[1].kind)).toEqual([
      "question",
      "writing",
      "speaking",
      "exam",
    ]);
  });
});
