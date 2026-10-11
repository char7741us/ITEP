import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

describe("AI status", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("offers grading for a configured key regardless of its prefix", async () => {
    vi.stubEnv("GEMINI_API_KEY", "valid-key-with-another-format");
    expect(await (await GET()).json()).toEqual({ available: true });
  });

  it("does not offer grading when no key is configured", async () => {
    vi.stubEnv("GEMINI_API_KEY", "  ");
    expect(await (await GET()).json()).toEqual({ available: false });
  });
});
