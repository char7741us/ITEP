import { describe, expect, it, vi } from "vitest";
import { validateRubricResult } from "./validation";
const mocks = vi.hoisted(() => ({ generate: vi.fn() }));
vi.mock("./provider", () => ({ GRADING_MODELS: ["first", "fallback"], WRITING_MODELS: ["first", "fallback"], getGeminiClient: () => ({ models: { generateContent: mocks.generate } }) }));
import { gradeWriting } from "./grade";

const result = { score: 6, cefrBand: "C2", dimensionScores: { organization: 4, grammarAccuracy: 3, vocabulary: 4, taskAchievement: 3 }, rationale: "Precisión y desarrollo por mejorar.", strengths: ["Postura clara"], improvements: ["Revisar concordancia"] };
const dimensions = ["organization", "grammarAccuracy", "vocabulary", "taskAchievement"];
describe("rúbricas verificadas", () => {
  it("calculates the score and band from dimensions instead of trusting model arithmetic", () => {
    expect(validateRubricResult(result, dimensions)).toMatchObject({ score: 3.5, cefrBand: "B2" });
  });
  it.each([{ ...result, score: 7 }, { ...result, dimensionScores: { organization: -1 } }, { ...result, dimensionScores: { organization: 4 } }, { ...result, rationale: "" }])("rejects invalid or incomplete results", (value) => expect(() => validateRubricResult(value, dimensions)).toThrow());
  it("retries invalid provider output and uses a bounded request timeout", async () => {
    mocks.generate.mockReset();
    mocks.generate.mockResolvedValueOnce({ text: '{"score":99}' }).mockResolvedValueOnce({ text: JSON.stringify(result) });
    const grade = await gradeWriting({ taskTitle: "Essay", prompt: "Discuss.", studentText: "My answer", minWords: 175, maxWords: 225 });
    expect(grade.score).toBe(3.5);
    expect(mocks.generate).toHaveBeenCalledTimes(2);
    expect(mocks.generate.mock.calls[0][0].config.httpOptions.timeout).toBe(25000);
    expect(mocks.generate.mock.calls[0][0].config.systemInstruction).toContain("no confiables");
  });
});
