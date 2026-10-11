import { describe, expect, it } from "vitest";
import { correctedSentence, grammarC1Topics, sentenceParts } from "./bank";

describe("Grammar C1 bank", () => {
  it("covers a broad C1 roadmap and prioritizes subject–verb agreement", () => {
    expect(grammarC1Topics.length).toBeGreaterThanOrEqual(12);
    expect(grammarC1Topics[0].id).toBe("subject-verb-agreement");
    expect(grammarC1Topics[0].questions.length).toBeGreaterThanOrEqual(20);
    expect(new Set(grammarC1Topics.map((topic) => topic.id)).size).toBe(grammarC1Topics.length);
  });

  it("offers four distinct single-word choices and a one-word correction in every item", () => {
    const sentences = new Set<string>();
    for (const topic of grammarC1Topics) {
      expect(topic.questions.length, topic.id).toBeGreaterThanOrEqual(5);
      for (const question of topic.questions) {
        const marks = sentenceParts(question.sentence).filter((part) => part.mark);
        expect(marks.map((part) => part.mark), question.sentence).toEqual(["A", "B", "C", "D"]);
        for (const choice of marks) expect(choice.text, question.sentence).toMatch(/^[A-Za-z]+(?:-[A-Za-z]+)*$/);
        expect(question.correction, question.sentence).toMatch(/^[A-Za-z]+(?:-[A-Za-z]+)*$/);
        expect(correctedSentence(question), question.sentence).not.toContain("[[");
        expect(sentences.has(question.sentence), question.sentence).toBe(false);
        sentences.add(question.sentence);
      }
    }
  });
});
