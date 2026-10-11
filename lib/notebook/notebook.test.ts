// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { itepAcademicPlusV1 } from "@/lib/content/packs/itep-academic-plus-v1";
import type { AttemptRecord } from "@/lib/types/attempt";
import { collectFailedTopics } from "./failedRules";
import { getCoachGuide } from "./coach";
import { getBankTwins } from "./twinsFallback";
import { consecutiveStudyDays, localStudyDate, notebookProfileKey, useErrorNotebookStore } from "./store";

beforeEach(() => {
  localStorage.clear();
  useErrorNotebookStore.setState({ entries: [], processedAttemptIds: [], studyDaysByProfile: {}, masteredByProfile: {} });
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
    expect(useErrorNotebookStore.getState().masteredByProfile[notebookProfileKey("student")]).toBe(1);
    expect(JSON.parse(localStorage.getItem("itep-simulator:error-notebook")!).state.entries).toHaveLength(0);
    store.recordAttempt("attempt-1", "student", [topic]);
    expect(useErrorNotebookStore.getState().entries).toHaveLength(0);
    store.recordAttempt("attempt-2", "student", [topic]);
    expect(useErrorNotebookStore.getState().entries).toHaveLength(1);
  });

  it("saves study days once per profile and counts consecutive local days", () => {
    const store = useErrorNotebookStore.getState();
    store.markStudyDay("student", new Date(2026, 9, 8, 23));
    store.markStudyDay("student", new Date(2026, 9, 9, 8));
    store.markStudyDay("student", new Date(2026, 9, 9, 19));
    store.markStudyDay("other", new Date(2026, 9, 9, 19));
    const state = useErrorNotebookStore.getState();
    expect(state.studyDaysByProfile[notebookProfileKey("student")]).toEqual(["2026-10-08", "2026-10-09"]);
    expect(state.studyDaysByProfile[notebookProfileKey("other")]).toEqual(["2026-10-09"]);
    expect(consecutiveStudyDays(state.studyDaysByProfile[notebookProfileKey("student")], new Date(2026, 9, 10))).toBe(2);
    expect(localStudyDate(new Date(2026, 9, 9))).toBe("2026-10-09");
    expect(JSON.parse(localStorage.getItem("itep-simulator:error-notebook")!).state.studyDaysByProfile[notebookProfileKey("student")]).toHaveLength(2);
  });

  it("matches mini lessons to the skill and keeps a safe generic guide", () => {
    expect(getCoachGuide("Reading", "Comprensión lectora: identificar la idea principal").title).toBe("La idea paraguas");
    expect(getCoachGuide("Grammar", "Future perfect describes a completed action").title).toBe("Una meta en el futuro");
    expect(getCoachGuide("Grammar", "The singular head noun collection takes the singular verb is.").title).toBe("El jefe de la frase");
    expect(getCoachGuide("Grammar", "Each is singular even when followed by a plural noun phrase.").title).toBe("Each cuenta de uno en uno");
    expect(getCoachGuide("Grammar", "A different rule that has no preset guide").steps).toHaveLength(3);
  });

  it("offers three distinct bank questions for a failed daily rule without AI", () => {
    const twins = getBankTwins("Grammar", "The singular head noun collection takes the singular verb is.");
    expect(twins).toHaveLength(3);
    expect(new Set(twins?.map((question) => question.question)).size).toBe(3);
    expect(twins?.every((question) => question.options.length === 4 && question.context === "")).toBe(true);
    expect(getBankTwins("Grammar", "A rule with no matching questions")).toBeNull();
  });

  it("includes distinct reading passages and listening scripts for comprehension practice", () => {
    const reading = getBankTwins("Reading", "Comprensión lectora: identificar la idea principal o el propósito del texto.");
    const listening = getBankTwins("Listening", "Comprensión auditiva: reconocer causas, motivos y consecuencias.");
    expect(reading).toHaveLength(3);
    expect(listening).toHaveLength(3);
    expect(new Set(reading?.map((question) => question.context)).size).toBe(3);
    expect(new Set(listening?.map((question) => question.context)).size).toBe(3);
  });
});
