import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ generateContent: vi.fn() }));
vi.mock("@/lib/gemini/provider", () => ({
  WRITING_MODELS: ["first", "fallback"],
  getGeminiClient: () => ({
    models: { generateContent: mocks.generateContent },
  }),
}));
import { POST } from "./route";
import { coachAnswerSchema } from "@/lib/learning/coach";

const summary = {
  dailyGoal: 5,
  todayActions: 2,
  streak: 1,
  nextDaily: 2,
  nextGrammar: 1,
  dailyCompleted: 1,
  grammarCompleted: 0,
  weakest: "Grammar",
  scores: { Grammar: 3 },
  pendingRules: [],
  improvements: [],
};
const request = (body: unknown) =>
  new Request("http://localhost/api/coach", {
    method: "POST",
    body: JSON.stringify(body),
  });
afterEach(() => {
  vi.unstubAllEnvs();
  mocks.generateContent.mockReset();
});

describe("coach de estudio", () => {
  it("keeps fallback explanations within the same response contract", async () => {
    vi.stubEnv("GEMINI_API_KEY", " ");
    const response = await POST(request({ message: "Explícame la pista", summary, context: { question: "A question", explanation: "Una explicación extensa. ".repeat(100) } }));
    expect(coachAnswerSchema.safeParse(await response.json()).success).toBe(true);
  });
  it("rejects invalid requests before calling the provider", async () => {
    const response = await POST(request({ message: " ", summary }));
    expect(response.status).toBe(400);
    expect(mocks.generateContent).not.toHaveBeenCalled();
  });
  it("offers a meaningful local microquiz when AI is not configured", async () => {
    vi.stubEnv("GEMINI_API_KEY", " ");
    const response = await POST(
      request({ message: "Ayúdame con Grammar", summary }),
    );
    const answer = await response.json();
    expect(answer.source).toBe("local");
    expect(answer.quiz.options).toHaveLength(4);
    expect(answer.quiz.correctIndex).toBe(1);
    expect(mocks.generateContent).not.toHaveBeenCalled();
  });
  it("validates model output and retries an invalid quiz instead of displaying it", async () => {
    vi.stubEnv("GEMINI_API_KEY", "secret-test-key");
    mocks.generateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        message: "Hola",
        steps: ["Paso"],
        example: "",
        quiz: {
          skill: "grammar",
          question: "Choose",
          options: ["A", "A", "C", "D"],
          correctIndex: 9,
          explanation: "Bad",
        },
      }),
    });
    mocks.generateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        message: "Busca el sujeto.",
        steps: ["Encuentra el núcleo."],
        example: "The collection is…",
        quiz: null,
      }),
    });
    const response = await POST(
      request({ message: "Ayúdame con Grammar", summary }),
    );
    const answer = await response.json();
    expect(answer.source).toBe("ai");
    expect(mocks.generateContent).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(answer)).not.toContain("secret-test-key");
  });
  it("falls back without leaking provider errors or secrets", async () => {
    vi.stubEnv("GEMINI_API_KEY", "secret-test-key");
    mocks.generateContent.mockRejectedValue(
      new Error("credential: secret-test-key"),
    );
    const response = await POST(
      request({
        message: "Estoy atascada",
        summary,
        context: {
          skill: "Grammar",
          question: "The collection are here.",
          explanation: "Collection es singular: is.",
        },
      }),
    );
    const answer = await response.json();
    expect(response.status).toBe(200);
    expect(answer.source).toBe("local");
    expect(answer.steps.join(" ")).toContain("Collection es singular");
    expect(JSON.stringify(answer)).not.toContain("secret-test-key");
  });
});
