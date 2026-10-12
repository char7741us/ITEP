import { describe, expect, it } from "vitest";
import { accents, suggestedAccent } from "./accents";

describe("accent suggestions", () => {
  it("always supplies a valid accent even for an invalid or missing day", () => {
    for (const day of [0, -1, NaN, Infinity, 1.5, 1, 60]) {
      expect(accents.some((accent) => accent.id === suggestedAccent(day))).toBe(true);
    }
  });
  it("favours North America in six of every ten sessions", () => {
    expect(Array.from({ length: 10 }, (_, i) => suggestedAccent(i + 1)).filter((id) => id === "us" || id === "ca")).toHaveLength(6);
  });
});
