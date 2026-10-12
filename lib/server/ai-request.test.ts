import { describe, expect, it } from "vitest";
import { readLimitedJSON, limitAIRequest, requestProblemResponse } from "./ai-request";

describe("límites básicos de solicitudes de IA", () => {
  it("accepts same-origin JSON and rejects cross-site requests", async () => {
    const good = new Request("https://example.com/api/coach", { method: "POST", headers: { Origin: "https://example.com" }, body: '{"message":"hello"}' });
    expect(await readLimitedJSON(good)).toEqual({ message: "hello" });
    const bad = new Request("https://example.com/api/coach", { method: "POST", headers: { Origin: "https://attacker.com" }, body: "{}" });
    await expect(readLimitedJSON(bad)).rejects.toMatchObject({ status: 403 });
  });
  it("limits actual bytes even when Content-Length is absent", async () => {
    const request = new Request("https://example.com/api/coach", { method: "POST", body: JSON.stringify({ message: "a".repeat(100) }) });
    await expect(readLimitedJSON(request, 30)).rejects.toMatchObject({ status: 413 });
  });
  it("checks the public Host rather than Next's internal URL and still rejects unrelated origins", async () => {
    const local = new Request("http://localhost:3211/api/coach", { method: "POST", headers: { Host: "127.0.0.1:3211", Origin: "http://127.0.0.1:3211" }, body: "{}" });
    expect(await readLimitedJSON(local)).toEqual({});
    const deployed = new Request("https://internal.vercel.app/api/coach", { method: "POST", headers: { Host: "itep-taupe.vercel.app", Origin: "https://itep-taupe.vercel.app" }, body: "{}" });
    expect(await readLimitedJSON(deployed)).toEqual({});
    const unrelated = new Request("http://localhost:3211/api/coach", { method: "POST", headers: { Host: "127.0.0.1:3211", Origin: "http://localhost:3211" }, body: "{}" });
    await expect(readLimitedJSON(unrelated)).rejects.toMatchObject({ status: 403 });
  });
  it("rejects declared oversized bodies and malformed JSON", async () => {
    await expect(readLimitedJSON(new Request("https://example.com/api/coach", { method: "POST", headers: { "Content-Length": "1000" }, body: "{}" }), 20)).rejects.toMatchObject({ status: 413 });
    await expect(readLimitedJSON(new Request("https://example.com/api/coach", { method: "POST", body: "not JSON" }))).rejects.toMatchObject({ status: 400 });
  });
  it("allows a normal burst then returns 429 and recovers after a minute", () => {
    const request = new Request("https://example.com/api/coach", { headers: { "x-forwarded-for": "192.0.2.123" } });
    const now = Date.now();
    for (let index = 0; index < 12; index++) expect(limitAIRequest(request, now)).toBeNull();
    const limited = limitAIRequest(request, now);
    expect(limited?.status).toBe(429);
    expect(limited?.headers.get("Retry-After")).toBe("60");
    expect(limitAIRequest(request, now + 60_001)).toBeNull();
  });
  it("does not expose unexpected error details", async () => {
    const response = requestProblemResponse(new Error("secret-key"));
    expect(JSON.stringify(await response.json())).not.toContain("secret-key");
  });
});
