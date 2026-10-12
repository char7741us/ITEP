import { describe, expect, it } from "vitest";
import { c1Modules, productiveTasks, getLabModule } from "./bank";
import { accents, suggestedAccent } from "./accents";
import { dailySessions } from "../daily/build";

describe("banco original del Laboratorio C1", () => {
  it("adds genuinely distinct texts, dialogues and productive prompts without replacing the 60 days", () => {
    expect(c1Modules).toHaveLength(12);
    expect(new Set(c1Modules.map((item) => item.id)).size).toBe(12);
    expect(new Set([...dailySessions.map((item) => item.reading.passage), ...c1Modules.map((item) => item.reading.passage)]).size).toBe(72);
    expect(new Set(c1Modules.map((item) => item.listening.lines.map((line) => line.text).join(" "))).size).toBe(12);
    expect(productiveTasks.filter((item) => item.skill === "speaking")).toHaveLength(48);
    expect(productiveTasks.filter((item) => item.skill === "writing")).toHaveLength(24);
    expect(new Set(productiveTasks.map((item) => item.id)).size).toBe(72);
    expect(new Set(productiveTasks.map((item) => item.prompt)).size).toBe(72);
    expect(getLabModule("missing")).toBeUndefined();
  });
  it("validates word ranges, two speakers, learning aids and all 144 objective items", () => {
    let total = 0;
    for (const workshop of c1Modules) {
      expect(workshop.reading.passage.split(/\s+/).length).toBeGreaterThanOrEqual(170);
      expect(workshop.reading.passage.split(/\s+/).length).toBeLessThanOrEqual(260);
      const spoken = workshop.listening.lines.map((line) => line.text).join(" ").split(/\s+/).length;
      expect(spoken).toBeGreaterThanOrEqual(75); expect(spoken).toBeLessThanOrEqual(160);
      expect(new Set(workshop.listening.lines.map((line) => line.speaker)).size).toBe(2);
      expect(workshop.lesson.timeline).toHaveLength(3);
      expect(workshop.lesson.questions).toHaveLength(6);
      expect(workshop.lesson.model.length).toBeGreaterThan(30);
      for (const item of [...workshop.lesson.questions, ...workshop.reading.questions, ...workshop.listening.questions]) {
        total++;
        expect(item.choices).toHaveLength(4);
        expect(new Set(item.choices.map((choice) => choice.toLowerCase().trim())).size).toBe(4);
        expect(item.correctIndex).toBeGreaterThanOrEqual(0); expect(item.correctIndex).toBeLessThan(4);
        expect(item.choices[item.correctIndex]).toBeTruthy();
        expect(item.explanation.length).toBeGreaterThan(30);
        if (item.prompt.startsWith("Identify the ONE")) {
          expect(item.choices.every((choice) => choice.split(/\s+/).length === 1)).toBe(true);
          expect(item.prompt.match(/\[[ABCD]\]/g)).toHaveLength(4);
          expect([...item.prompt.matchAll(/\[([ABCD])\]([A-Za-z-]+)/g)].map((match) => match[2])).toEqual(item.choices);
        }
      }
    }
    expect(total).toBe(144);
  });
  it("offers five explicit requested accents with North America in 60% of suggestions", () => {
    expect(accents.map((item) => item.locale)).toEqual(["en-US", "en-CA", "en-GB", "en-AU", "en-IN"]);
    const suggestions = Array.from({ length: 60 }, (_, i) => suggestedAccent(i + 1));
    expect(suggestions.filter((id) => id === "us" || id === "ca")).toHaveLength(36);
    expect(new Set(suggestions).size).toBe(5);
  });
});
