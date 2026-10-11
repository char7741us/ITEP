import { beforeEach, describe, expect, it } from "vitest";
import { useGrammarProgressStore } from "./progress";

describe("Grammar C1 progress", () => {
  beforeEach(() => {
    localStorage.clear();
    useGrammarProgressStore.setState({ byProfile: {}, daysByProfile: {} });
  });

  it("counts rounds and completed items without mixing profiles", () => {
    const store = useGrammarProgressStore.getState();
    expect(store.startRound("guest", "subject-verb-agreement")).toBe(0);
    expect(store.startRound("guest", "subject-verb-agreement")).toBe(1);
    store.recordAnswer("guest", "subject-verb-agreement", "subject-verb-agreement:0", false);
    store.recordAnswer("guest", "subject-verb-agreement", "subject-verb-agreement:0", true);
    store.recordAnswer("guest", "subject-verb-agreement", "subject-verb-agreement:0", true);
    expect(useGrammarProgressStore.getState().byProfile.guest["subject-verb-agreement"]).toEqual({
      rounds: 2,
      attempts: 3,
      completedIds: ["subject-verb-agreement:0"],
    });
    expect(useGrammarProgressStore.getState().byProfile["profile:other"]).toBeUndefined();
    expect(localStorage.getItem("itep-simulator:grammar-c1-progress")).toContain("subject-verb-agreement:0");
  });

  it("approves a day at 85 percent and remembers the best attempt", () => {
    const store = useGrammarProgressStore.getState();
    store.recordDayResult("guest", 1, 5, 7);
    expect(useGrammarProgressStore.getState().daysByProfile.guest[1].completedAt).toBeUndefined();
    store.recordDayResult("guest", 1, 6, 7);
    const result = useGrammarProgressStore.getState().daysByProfile.guest[1];
    expect(result.attempts).toBe(2);
    expect(result.bestCorrect).toBe(6);
    expect(result.completedAt).toBeTruthy();
    expect(localStorage.getItem("itep-simulator:grammar-c1-progress")).toContain('"completedAt"');
  });

  it("keeps an earlier approval without comparing scores from different day lengths", () => {
    const store = useGrammarProgressStore.getState();
    store.recordDayResult("guest", 1, 5, 5);
    const approvedAt = useGrammarProgressStore.getState().daysByProfile.guest[1].completedAt;
    store.recordDayResult("guest", 1, 2, 7);
    expect(useGrammarProgressStore.getState().daysByProfile.guest[1]).toMatchObject({
      attempts: 2,
      bestCorrect: 2,
      total: 7,
      completedAt: approvedAt,
    });
  });
});
