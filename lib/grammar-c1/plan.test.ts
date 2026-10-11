import { describe, expect, it } from "vitest";
import { grammarC1Topics } from "./bank";
import { grammarC1Days, isValidGrammarPlan } from "./plan";

describe("20-day Grammar C1 plan", () => {
  it("covers the core bank in 16 days and saves unseen items for the final challenge", () => {
    expect(isValidGrammarPlan()).toBe(true);
    const firstPass = grammarC1Days.slice(0, 16).flatMap((day) => day.refs.map((ref) => `${ref.topicId}:${ref.index}`));
    const allItems = grammarC1Topics.flatMap((topic) => topic.questions.map((_, index) => `${topic.id}:${index}`));
    const finalItems = grammarC1Days[19].refs.map((ref) => `${ref.topicId}:${ref.index}`);
    expect(new Set([...firstPass, ...finalItems])).toEqual(new Set(allItems));
    expect(finalItems.every((item) => !firstPass.includes(item))).toBe(true);
    expect(grammarC1Days.slice(16, 19).every((day) => day.kind === "review")).toBe(true);
    expect(new Set(grammarC1Days[19].refs.map((ref) => ref.topicId)).size).toBe(grammarC1Topics.length);
  });
});
