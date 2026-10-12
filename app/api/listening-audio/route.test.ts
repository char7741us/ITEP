import { afterEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ tts: vi.fn() }));
vi.mock("@/lib/gemini/accent-tts", () => ({ synthesizeAccent: mock.tts }));
import { POST } from "./route";
const request = (body: unknown, ip = "192.0.2.200", origin = "http://localhost") => new Request("http://localhost/api/listening-audio", { method: "POST", headers: { "Content-Type": "application/json", origin, "x-forwarded-for": ip }, body: JSON.stringify(body) });
afterEach(() => vi.clearAllMocks());
describe("audio regional desde el banco permitido", () => {
  it.each([{ source: "lab", id: "present-past", accent: "fake" }, { source: "lab", id: "present-past", accent: "us", text: "Arbitrary synthesis is not allowed" }, { source: "daily", id: "1", accent: "us", apiKey: "not allowed" }])("rejects arbitrary fields or accents before generation", async (body) => {
    expect((await POST(request(body))).status).toBe(400); expect(mock.tts).not.toHaveBeenCalled();
  });
  it.each([{ source: "lab", id: "missing", accent: "us" }, { source: "daily", id: "61", accent: "us" }, { source: "daily", id: "01", accent: "us" }])("rejects unknown content", async (body) => {
    expect((await POST(request(body))).status).toBe(404); expect(mock.tts).not.toHaveBeenCalled();
  });
  it("blocks cross-origin requests", async () => {
    expect((await POST(request({ source: "lab", id: "present-past", accent: "us" }, "192.0.2.201", "https://other.example"))).status).toBe(403);
  });
  it("returns audio and reuses a bounded cache", async () => {
    mock.tts.mockResolvedValue(new Uint8Array([82, 73, 70, 70]));
    const body = { source: "lab", id: "agreement", accent: "in" };
    const response = await POST(request(body));
    expect(response.status).toBe(200); expect(response.headers.get("Content-Type")).toBe("audio/wav");
    await POST(request(body)); expect(mock.tts).toHaveBeenCalledTimes(1);
    expect(mock.tts.mock.calls[0][0][0].text).toContain("number of requests");
  });
  it("hides provider details and never returns a fake accent fallback", async () => {
    mock.tts.mockRejectedValue(new Error("api_key=private-test-value"));
    const response = await POST(request({ source: "daily", id: "2", accent: "au" }, "192.0.2.202"));
    expect(response.status).toBe(502); expect(JSON.stringify(await response.json())).not.toContain("private-test-value");
  });
});
