import { beforeEach, describe, expect, it } from "vitest";
import { useGrammarProgressStore } from "./progress";

describe("Grammar C1 progress", () => {
  beforeEach(() => {
    localStorage.clear();
    useGrammarProgressStore.setState({ byProfile: {} });
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
});
