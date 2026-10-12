import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ writing: vi.fn(), speaking: vi.fn() }));
vi.mock("@/lib/gemini/grade", () => ({ gradeWriting: mocks.writing, gradeSpeaking: mocks.speaking }));
import { POST as writing } from "./writing/route";
import { POST as speaking } from "./speaking/route";
const request = (body: unknown, headers?: Record<string, string>) => new Request("http://localhost/api/grade", { method: "POST", body: JSON.stringify(body), headers });
const validWriting = { taskTitle: "Essay", prompt: "Discuss this view.", minWords: 175, maxWords: 225, studentText: "A student answer." };
const validSpeaking = { taskTitle: "Opinion", prompt: "Explain your view.", mimeType: "audio/webm;codecs=opus", audioBase64: "UklGRmF1ZGlvZXhhbXBsZQ==" };
afterEach(() => vi.clearAllMocks());

describe("entradas de calificación Writing/Speaking", () => {
  it.each([null, [], { studentText: 5 }, { ...validWriting, minWords: 300 }, { ...validWriting, studentText: " " }])("rejects invalid writing safely (%j)", async (body) => {
    const response = await writing(request(body));
    expect(response.status).toBe(400);
    expect(mocks.writing).not.toHaveBeenCalled();
  });
  it.each([{ ...validSpeaking, mimeType: "text/html" }, { ...validSpeaking, audioBase64: "data:audio/webm;base64,abc" }, { ...validSpeaking, audioBase64: "not base64 !!!" }])("rejects invalid audio before the provider (%j)", async (body) => {
    expect((await speaking(request(body))).status).toBe(400);
    expect(mocks.speaking).not.toHaveBeenCalled();
  });
  it("accepts the actual recorder codec MIME type", async () => {
    mocks.speaking.mockResolvedValue({ score: 4.5 });
    const response = await speaking(request(validSpeaking, { "x-forwarded-for": "192.0.2.2" }));
    expect(response.status).toBe(200);
    expect(mocks.speaking).toHaveBeenCalledWith(validSpeaking);
  });
  it("does not leak provider error details", async () => {
    mocks.writing.mockRejectedValue(new Error("api_key=secret-test-value"));
    const response = await writing(request(validWriting, { "x-forwarded-for": "192.0.2.3" }));
    expect(response.status).toBe(502);
    expect(JSON.stringify(await response.json())).not.toContain("secret-test-value");
  });
});
