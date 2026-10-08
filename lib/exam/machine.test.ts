import { describe, expect, it } from "vitest";
import { createActor, waitFor } from "xstate";
import { examMachine, getGrammarItems, getReadingItems, getListeningItems, getListeningSegments } from "./machine";
import { itepAcademicPlusV1 } from "@/lib/content/packs/itep-academic-plus-v1";
import { DEFAULT_CONTENT_PACK_KEY } from "@/lib/content/loader";

function freshActor() {
  const actor = createActor(examMachine, {
    input: { attemptId: "test-attempt", mode: "intensive", contentPackKey: DEFAULT_CONTENT_PACK_KEY },
  });
  actor.start();
  return actor;
}

function advanceToListening(actor: ReturnType<typeof freshActor>) {
  actor.send({ type: "SUBMIT_GRAMMAR" });
}

function advanceToReading(actor: ReturnType<typeof freshActor>) {
  advanceToListening(actor);
  const segmentCount = getListeningSegments(itepAcademicPlusV1).length;
  for (let i = 0; i < segmentCount - 1; i++) {
    actor.send({ type: "NEXT_LISTENING_SEGMENT" });
  }
  actor.send({ type: "SUBMIT_LISTENING" });
}

function advanceToWriting(actor: ReturnType<typeof freshActor>) {
  advanceToReading(actor);
  actor.send({ type: "NEXT_READING_PART" });
  actor.send({ type: "SUBMIT_READING" });
}

function advanceToSpeaking(actor: ReturnType<typeof freshActor>) {
  advanceToWriting(actor);
  actor.send({ type: "SUBMIT_WRITING_TASK" });
  actor.send({ type: "SUBMIT_WRITING_TASK" });
}

/** Drives every speaking phase to completion via TICK events (no manual submit exists). */
function advanceThroughSpeaking(actor: ReturnType<typeof freshActor>) {
  const now = () => Date.now();
  actor.send({ type: "TICK", now: (actor.getSnapshot().context.speaking.warmupEndsAt ?? now()) + 1 });
  actor.send({ type: "TICK", now: (actor.getSnapshot().context.speaking.prepEndsAtByTask[1] ?? now()) + 1 });
  actor.send({ type: "TICK", now: (actor.getSnapshot().context.speaking.recordEndsAtByTask[1] ?? now()) + 1 });
  actor.send({ type: "SAVE_SPEAKING_RECORDING", taskNumber: 1, blobKey: "" });
  actor.send({ type: "TICK", now: (actor.getSnapshot().context.speaking.prepEndsAtByTask[2] ?? now()) + 1 });
  actor.send({ type: "TICK", now: (actor.getSnapshot().context.speaking.recordEndsAtByTask[2] ?? now()) + 1 });
  actor.send({ type: "SAVE_SPEAKING_RECORDING", taskNumber: 2, blobKey: "" });
}

describe("examMachine", () => {
  it("permite reanudar intentos anteriores sin saltar secciones", () => {
    const previous = freshActor();
    const snapshot = previous.getPersistedSnapshot();
    delete (snapshot as unknown as { context: { examOrderVersion?: 2 } }).context.examOrderVersion;
    previous.stop();
    const actor = createActor(examMachine, {
      input: { attemptId: "legacy", mode: "intensive", contentPackKey: DEFAULT_CONTENT_PACK_KEY },
      snapshot,
    });
    actor.start();
    actor.send({ type: "START" });
    expect(actor.getSnapshot().matches({ reading: "part1" })).toBe(true);
    actor.send({ type: "NEXT_READING_PART" });
    actor.send({ type: "SUBMIT_READING" });
    expect(actor.getSnapshot().matches("listening")).toBe(true);
    for (let index = 0; index < getListeningSegments(itepAcademicPlusV1).length - 1; index++) {
      actor.send({ type: "NEXT_LISTENING_SEGMENT" });
    }
    actor.send({ type: "SUBMIT_LISTENING" });
    expect(actor.getSnapshot().matches("grammar")).toBe(true);
    actor.send({ type: "SUBMIT_GRAMMAR" });
    expect(actor.getSnapshot().matches({ writing: "task1" })).toBe(true);
  });

  it("starts in setup and moves to grammar on START", () => {
    const actor = freshActor();
    expect(actor.getSnapshot().matches("setup")).toBe(true);
    actor.send({ type: "START" });
    expect(actor.getSnapshot().matches("grammar")).toBe(true);
    expect(actor.getSnapshot().context.grammar.endsAt).not.toBeNull();
  });

  it("does not allow moving backward from part2 to part1", () => {
    const actor = freshActor();
    actor.send({ type: "START" });
    advanceToReading(actor);
    actor.send({ type: "NEXT_READING_PART" });
    expect(actor.getSnapshot().matches({ reading: "part2" })).toBe(true);
    expect(actor.getSnapshot().context.reading.partIndex).toBe(1);
    // There is deliberately no event that can move partIndex back to 0.
  });

  it("auto-submits reading and starts writing when time runs out", () => {
    const actor = freshActor();
    actor.send({ type: "START" });
    advanceToReading(actor);
    const endsAt = actor.getSnapshot().context.reading.endsAt!;
    actor.send({ type: "TICK", now: endsAt - 1000 });
    expect(actor.getSnapshot().matches({ reading: "part1" })).toBe(true);
    actor.send({ type: "TICK", now: endsAt + 1 });
    expect(actor.getSnapshot().matches({ writing: "task1" })).toBe(true);
    expect(actor.getSnapshot().context.reading.autoSubmitted).toBe(true);
    expect(actor.getSnapshot().context.writing.endsAtByTask[1]).not.toBeNull();
  });

  it("only allows forward movement between listening segments", () => {
    const actor = freshActor();
    actor.send({ type: "START" });
    advanceToListening(actor);
    expect(actor.getSnapshot().context.listening.currentSegmentIndex).toBe(0);
    actor.send({ type: "NEXT_LISTENING_SEGMENT" });
    expect(actor.getSnapshot().context.listening.currentSegmentIndex).toBe(1);
    // There is deliberately no event that can decrease currentSegmentIndex.
  });

  it("tracks which listening segments have already played (single playback)", () => {
    const actor = freshActor();
    actor.send({ type: "START" });
    advanceToListening(actor);
    actor.send({ type: "MARK_SEGMENT_PLAYED", index: 0 });
    actor.send({ type: "MARK_SEGMENT_PLAYED", index: 0 });
    expect(actor.getSnapshot().context.listening.playedSegmentIndices).toEqual([0]);
  });

  it("auto-submits listening and starts the reading timer when time runs out", () => {
    const actor = freshActor();
    actor.send({ type: "START" });
    advanceToListening(actor);
    const endsAt = actor.getSnapshot().context.listening.endsAt!;
    actor.send({ type: "TICK", now: endsAt + 1 });
    expect(actor.getSnapshot().matches({ reading: "part1" })).toBe(true);
    expect(actor.getSnapshot().context.listening.autoSubmitted).toBe(true);
    expect(actor.getSnapshot().context.reading.endsAt).not.toBeNull();
  });

  it("allows free navigation between grammar items", () => {
    const actor = freshActor();
    actor.send({ type: "START" });
    actor.send({ type: "GO_TO_GRAMMAR_ITEM", index: 20 });
    expect(actor.getSnapshot().context.grammar.currentIndex).toBe(20);
    actor.send({ type: "GO_TO_GRAMMAR_ITEM", index: 3 });
    expect(actor.getSnapshot().context.grammar.currentIndex).toBe(3);
  });

  it("moves from reading to writing (task1) after submitting reading", () => {
    const actor = freshActor();
    actor.send({ type: "START" });
    advanceToWriting(actor);
    expect(actor.getSnapshot().matches({ writing: "task1" })).toBe(true);
    expect(actor.getSnapshot().context.writing.endsAtByTask[1]).not.toBeNull();
  });

  it("records writing text per task and moves task1 -> task2 -> speaking", () => {
    const actor = freshActor();
    actor.send({ type: "START" });
    advanceToWriting(actor);
    actor.send({ type: "UPDATE_WRITING_TEXT", taskNumber: 1, text: "Short message text." });
    expect(actor.getSnapshot().context.writing.texts[1]).toBe("Short message text.");
    actor.send({ type: "SUBMIT_WRITING_TASK" });
    expect(actor.getSnapshot().matches({ writing: "task2" })).toBe(true);
    actor.send({ type: "UPDATE_WRITING_TEXT", taskNumber: 2, text: "Essay text." });
    actor.send({ type: "SUBMIT_WRITING_TASK" });
    expect(actor.getSnapshot().matches({ speaking: "warmup" })).toBe(true);
  });

  it("walks through every speaking phase in order via timeouts", () => {
    const actor = freshActor();
    actor.send({ type: "START" });
    advanceToSpeaking(actor);
    expect(actor.getSnapshot().matches({ speaking: "warmup" })).toBe(true);

    actor.send({ type: "TICK", now: actor.getSnapshot().context.speaking.warmupEndsAt! + 1 });
    expect(actor.getSnapshot().matches({ speaking: "task1Prep" })).toBe(true);

    actor.send({ type: "TICK", now: actor.getSnapshot().context.speaking.prepEndsAtByTask[1]! + 1 });
    expect(actor.getSnapshot().matches({ speaking: "task1Record" })).toBe(true);

    actor.send({ type: "SAVE_SPEAKING_RECORDING", taskNumber: 1, blobKey: "attempt:1" });
    expect(actor.getSnapshot().context.speaking.audioBlobKeyByTask[1]).toBe("attempt:1");

    actor.send({ type: "TICK", now: actor.getSnapshot().context.speaking.recordEndsAtByTask[1]! + 1 });
    expect(actor.getSnapshot().matches({ speaking: "task1Saving" })).toBe(true);
    actor.send({ type: "SAVE_SPEAKING_RECORDING", taskNumber: 1, blobKey: "attempt:1" });
    expect(actor.getSnapshot().matches({ speaking: "task2Prep" })).toBe(true);

    actor.send({ type: "TICK", now: actor.getSnapshot().context.speaking.prepEndsAtByTask[2]! + 1 });
    expect(actor.getSnapshot().matches({ speaking: "task2Record" })).toBe(true);

    actor.send({ type: "TICK", now: actor.getSnapshot().context.speaking.recordEndsAtByTask[2]! + 1 });
    expect(actor.getSnapshot().matches({ speaking: "task2Saving" })).toBe(true);
    actor.send({ type: "SAVE_SPEAKING_RECORDING", taskNumber: 2, blobKey: "attempt:2" });
    expect(actor.getSnapshot().matches("grading")).toBe(true);
  });

  it("reaches done with a fully zero score when every section times out untouched", async () => {
    const actor = freshActor();
    actor.send({ type: "START" });
    actor.send({ type: "TICK", now: actor.getSnapshot().context.grammar.endsAt! + 1 });
    actor.send({ type: "TICK", now: actor.getSnapshot().context.listening.endsAt! + 1 });
    actor.send({ type: "TICK", now: actor.getSnapshot().context.reading.endsAt! + 1 });
    actor.send({ type: "TICK", now: actor.getSnapshot().context.writing.endsAtByTask[1]! + 1 });
    actor.send({ type: "TICK", now: actor.getSnapshot().context.writing.endsAtByTask[2]! + 1 });
    advanceThroughSpeaking(actor);
    expect(actor.getSnapshot().matches("grading")).toBe(true);

    await waitFor(actor, (snapshot) => snapshot.matches("done"), { timeout: 2000 });
    const scores = actor.getSnapshot().context.scores!;
    expect(scores.reading).toBe(0);
    expect(scores.listening).toBe(0);
    expect(scores.grammar).toBe(0);
    expect(scores.writing).toBe(0);
    expect(scores.speaking).toBe(0);
    expect(scores.overall).toBe(0);
  });

  it("computes a perfect score on objective sections when every MCQ item is answered correctly", async () => {
    const actor = freshActor();
    actor.send({ type: "START" });
    for (const item of getGrammarItems(DEFAULT_CONTENT_PACK_KEY)) {
      actor.send({ type: "ANSWER_GRAMMAR", itemId: item.id, selectedIndex: item.correctIndex, timeSpentMs: 1000 });
    }
    actor.send({ type: "SUBMIT_GRAMMAR" });
    for (const item of getListeningItems(itepAcademicPlusV1)) {
      actor.send({ type: "ANSWER_LISTENING", itemId: item.id, selectedIndex: item.correctIndex, timeSpentMs: 1000 });
    }
    const segmentCount = getListeningSegments(itepAcademicPlusV1).length;
    for (let i = 0; i < segmentCount - 1; i++) {
      actor.send({ type: "NEXT_LISTENING_SEGMENT" });
    }
    actor.send({ type: "SUBMIT_LISTENING" });
    for (const item of getReadingItems(DEFAULT_CONTENT_PACK_KEY)) {
      actor.send({ type: "ANSWER_READING", itemId: item.id, selectedIndex: item.correctIndex, timeSpentMs: 1000 });
    }
    actor.send({ type: "NEXT_READING_PART" });
    actor.send({ type: "SUBMIT_READING" });
    // Writing/Speaking are left empty on purpose — grading them needs a live
    // Gemini call this unit test suite does not make; those paths are covered
    // by leaving the fetch calls unattempted (see gradeWritingTask/gradeSpeakingTask).
    actor.send({ type: "SUBMIT_WRITING_TASK" });
    actor.send({ type: "SUBMIT_WRITING_TASK" });
    advanceThroughSpeaking(actor);

    await waitFor(actor, (snapshot) => snapshot.matches("done"), { timeout: 2000 });
    const scores = actor.getSnapshot().context.scores!;
    expect(scores.reading).toBe(6.0);
    expect(scores.listening).toBe(6.0);
    expect(scores.grammar).toBe(6.0);
    expect(scores.writing).toBe(0);
    expect(scores.speaking).toBe(0);
    expect(scores.overall).toBe(averageScoreOfPerfectObjectiveSections());
  });
});

function averageScoreOfPerfectObjectiveSections(): number {
  return Math.round(((6 + 6 + 6 + 0 + 0) / 5) * 10) / 10;
}
