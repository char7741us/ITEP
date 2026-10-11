import { describe, expect, it } from "vitest";
import { completedSentence, correctedSentence, grammarC1Topics, sentenceParts } from "./bank";

describe("Grammar C1 bank", () => {
  it("covers a broad C1 roadmap and prioritizes subject–verb agreement", () => {
    expect(grammarC1Topics.length).toBeGreaterThanOrEqual(12);
    expect(grammarC1Topics[0].id).toBe("subject-verb-agreement");
    expect(grammarC1Topics[0].questions.length).toBeGreaterThanOrEqual(20);
    expect(new Set(grammarC1Topics.map((topic) => topic.id)).size).toBe(grammarC1Topics.length);
  });

  it("keeps both question formats clear and structurally valid", () => {
    const sentences = new Set<string>();
    for (const topic of grammarC1Topics) {
      expect(topic.questions.filter((question) => question.kind === "complete-sentence").length, topic.id).toBeGreaterThanOrEqual(2);
      expect(topic.questions.filter((question) => question.kind === "error-word").length, topic.id).toBeGreaterThanOrEqual(5);
      for (const question of topic.questions) {
        if (question.kind === "error-word") {
          const marks = sentenceParts(question.sentence).filter((part) => part.mark);
          expect(marks.map((part) => part.mark), question.sentence).toEqual(["A", "B", "C", "D"]);
          for (const choice of marks) expect(choice.text, question.sentence).toMatch(/^[A-Za-z]+(?:-[A-Za-z]+)*$/);
          expect(question.correction, question.sentence).toMatch(/^[A-Za-z]+(?:-[A-Za-z]+)*$/);
          expect(correctedSentence(question), question.sentence).not.toContain("[[");
          expect(marks.find((part) => part.mark === question.wrong)?.text.toLowerCase()).not.toBe(question.correction.toLowerCase());
        } else {
          expect(question.sentence.match(/_____/g), question.sentence).toHaveLength(1);
          expect(question.choices, question.sentence).toHaveLength(4);
          expect(new Set(question.choices).size, question.sentence).toBe(4);
          expect("ABCD").toContain(question.correct);
          expect(completedSentence(question), question.sentence).not.toContain("_____");
        }
        expect(question.explanation.trim().length, question.sentence).toBeGreaterThan(15);
        expect(sentences.has(question.sentence), question.sentence).toBe(false);
        sentences.add(question.sentence);
      }
    }
  });
});
