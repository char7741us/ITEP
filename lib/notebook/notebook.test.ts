// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { itepAcademicPlusV1 } from "@/lib/content/packs/itep-academic-plus-v1";
import type { AttemptRecord } from "@/lib/types/attempt";
import { collectFailedTopics } from "./failedRules";
import { useErrorNotebookStore } from "./store";

beforeEach(() => {
  localStorage.clear();
  useErrorNotebookStore.setState({ entries: [], processedAttemptIds: [] });
});

describe("Cuaderno de Errores", () => {
  it("records final incorrect answers with a specific rule and ignores correct ones", () => {
    const reading = itepAcademicPlusV1.reading.parts.flatMap((part) => part.items);
    const listening = itepAcademicPlusV1.listening.parts.flatMap((part) => part.segments.flatMap((segment) => segment.items));
    const grammar = itepAcademicPlusV1.grammar.parts.flatMap((part) => part.items);
    const attempt = {
      responses: {
        reading: reading.map((item) => ({ itemId: item.id, selectedIndex: item.correctIndex, timeSpentMs: 0 })),
        listening: listening.map((item) => ({ itemId: item.id, selectedIndex: item.correctIndex, timeSpentMs: 0 })),
        grammar: grammar.map((item) => ({ itemId: item.id, selectedIndex: item.correctIndex, timeSpentMs: 0 })),
      },
    } as AttemptRecord;
    attempt.responses.reading[2].selectedIndex = 0;
    attempt.responses.grammar[0].selectedIndex = 0;

    const failures = collectFailedTopics(attempt, itepAcademicPlusV1);
    expect(failures).toHaveLength(2);
    expect(failures).toContainEqual({
      section: "Reading",
      failed_rule: "Comprensión lectora: deducir el significado de una palabra por el contexto.",
    });
    expect(failures).toContainEqual({
      section: "Grammar",
      failed_rule: grammar[0].explanation,
    });
  });

  it("persists streaks, resets on a miss, removes mastered topics and does not reimport an attempt", async () => {
    const store = useErrorNotebookStore.getState();
    const topic = { section: "Grammar" as const, failed_rule: "Future perfect" };
    store.recordAttempt("attempt-1", "student", [topic, topic]);
    const [entry] = useErrorNotebookStore.getState().entries;
    expect(useErrorNotebookStore.getState().entries).toHaveLength(1);
    expect(entry.streak).toBe(0);
    store.answer(entry.id, true);
    store.answer(entry.id, true);
    expect(useErrorNotebookStore.getState().entries[0].streak).toBe(2);
    store.answer(entry.id, false);
    expect(useErrorNotebookStore.getState().entries[0].streak).toBe(0);
    store.answer(entry.id, true);
    store.answer(entry.id, true);
    expect(store.answer(entry.id, true)).toBe(true);
    expect(useErrorNotebookStore.getState().entries).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem("itep-simulator:error-notebook")!).state.entries).toHaveLength(0);
    store.recordAttempt("attempt-1", "student", [topic]);
    expect(useErrorNotebookStore.getState().entries).toHaveLength(0);
    store.recordAttempt("attempt-2", "student", [topic]);
    expect(useErrorNotebookStore.getState().entries).toHaveLength(1);
  });
});
