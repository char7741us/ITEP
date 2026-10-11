import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ generateContent: vi.fn() }));
vi.mock("@/lib/gemini/provider", () => ({
  GRADING_MODELS: ["test-model"],
  getGeminiClient: () => ({ models: { generateContent: mocks.generateContent } }),
}));

import { POST } from "./route";

afterEach(() => { vi.unstubAllEnvs(); mocks.generateContent.mockReset(); });

describe("generación de ejercicios gemelos", () => {
  it("uses the local bank when no key is configured", async () => {
    vi.stubEnv("GEMINI_API_KEY", "  ");
    const response = await POST(new Request("http://localhost/api/generate-twins", {
      method: "POST", body: JSON.stringify({ section: "Grammar", failed_rule: "Subject–verb agreement: El sujeto es collection (singular), no maps; por eso se usa is." }),
    }));
    expect(response.status).toBe(200);
    expect((await response.json()).source).toBe("bank");
    expect(mocks.generateContent).not.toHaveBeenCalled();
  });

  it("accepts a configured key in a valid non-AIza format", async () => {
    vi.stubEnv("GEMINI_API_KEY", "valid-key-with-another-format");
    mocks.generateContent.mockResolvedValue({ text: JSON.stringify({ questions: [1, 2, 3].map((number) => ({
      context: "", question: `Question ${number}?`, options: ["A", "B", "C", "D"], correctIndex: number % 4,
      explanation: "La pista está en la concordancia verbal.",
    })) }) });
    const response = await POST(new Request("http://localhost/api/generate-twins", {
      method: "POST", body: JSON.stringify({ section: "Grammar", failed_rule: "Subject–verb agreement" }),
    }));
    expect(response.status).toBe(200);
    expect((await response.json()).source).toBe("ai");
    expect(mocks.generateContent).toHaveBeenCalledOnce();
  });
});
