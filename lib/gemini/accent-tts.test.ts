import { afterEach, describe, expect, it, vi } from "vitest";
import { synthesizeAccent } from "./accent-tts";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const lines = [{ speaker: "Student", text: "I submitted the report yesterday." }, { speaker: "Adviser", text: "Have you revised it since then?" }];
function mockResponse(payload: unknown, status = 200) {
  const mock = vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status }));
  vi.stubGlobal("fetch", mock);
  vi.stubEnv("GEMINI_API_KEY", "test-server-key");
  return mock;
}
describe("server accent synthesis", () => {
  it("reads structured WAV audio and sends only the authored dialogue with accent instructions", async () => {
    const wav = Buffer.alloc(1200); wav.write("RIFF", 0); wav.write("WAVE", 8);
    const mock = mockResponse({ steps: [{ type: "model_output", content: [{ type: "audio", data: wav.toString("base64") }] }] });
    expect(await synthesizeAccent(lines, "in")).toEqual(new Uint8Array(wav));
    const request = JSON.parse(mock.mock.calls[0][1].body);
    expect(request.input[0].content.map((item: { text: string }) => item.text)).toEqual(lines.map((line) => line.text));
    expect(request.input[0].content[0].annotations[0].style).toContain("Indian English");
    expect(request.generation_config.speech_config.speakers).toHaveLength(2);
  });
  it("does not expose provider details or credentials in errors", async () => {
    mockResponse({ error: "private provider details" }, 429);
    await expect(synthesizeAccent(lines, "us")).rejects.toThrow(/^TTS_429$/);
  });
  it("rejects missing or malformed audio", async () => {
    mockResponse({ steps: [] });
    await expect(synthesizeAccent(lines, "ca")).rejects.toThrow("TTS_NO_AUDIO");
    mockResponse({ steps: [{ type: "model_output", content: [{ type: "audio", data: Buffer.alloc(1200).toString("base64") }] }] });
    await expect(synthesizeAccent(lines, "au")).rejects.toThrow("TTS_INVALID_WAV");
  });
  it("does not call the provider without a server key", async () => {
    vi.stubEnv("GEMINI_API_KEY", ""); const mock = vi.fn(); vi.stubGlobal("fetch", mock);
    await expect(synthesizeAccent(lines, "gb")).rejects.toThrow("TTS_UNAVAILABLE");
    expect(mock).not.toHaveBeenCalled();
  });
});
