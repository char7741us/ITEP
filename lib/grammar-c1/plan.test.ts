import { describe, expect, it } from "vitest";
import { grammarC1Topics } from "./bank";
import { grammarC1Days, isValidGrammarPlan } from "./plan";

describe("20-day Grammar C1 plan", () => {
  it("covers the core bank in 16 days and matches the two iTEP Grammar parts on day 20", () => {
    expect(isValidGrammarPlan()).toBe(true);
    const firstPass = grammarC1Days.slice(0, 16).flatMap((day) => day.refs.map((ref) => `${ref.topicId}:${ref.index}`));
    const allItems = grammarC1Topics.flatMap((topic) => topic.questions.map((_, index) => `${topic.id}:${index}`));
    const finalItems = grammarC1Days[19].refs.map((ref) => `${ref.topicId}:${ref.index}`);
    expect(new Set([...firstPass, ...finalItems])).toEqual(new Set(allItems));
    expect(finalItems.filter((item) => !firstPass.includes(item))).toHaveLength(13);
    expect(finalItems).toHaveLength(25);
    expect(grammarC1Days.slice(16, 19).every((day) => day.kind === "review")).toBe(true);
    expect(new Set(grammarC1Days[19].refs.map((ref) => ref.topicId)).size).toBe(grammarC1Topics.length);
    const topics = new Map(grammarC1Topics.map((topic) => [topic.id, topic]));
    expect(grammarC1Days[19].refs.slice(0, 13).every((ref) => topics.get(ref.topicId)?.questions[ref.index].kind === "complete-sentence")).toBe(true);
    expect(grammarC1Days[19].refs.slice(13).every((ref) => topics.get(ref.topicId)?.questions[ref.index].kind === "error-word")).toBe(true);
    for (const day of grammarC1Days) {
      const kinds = new Set(day.refs.map((ref) => topics.get(ref.topicId)?.questions[ref.index].kind));
      expect(kinds, `Día ${day.day}`).toEqual(new Set(["error-word", "complete-sentence"]));
    }
  });
});
