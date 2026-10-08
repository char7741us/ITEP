import { describe, expect, it } from "vitest";
import { statSync } from "node:fs";
import { join } from "node:path";
import { dailySessions, getDailySession } from "./build";

describe("60 días de práctica", () => {
  it("ofrece 60 sesiones distintas con las cinco áreas", () => {
    expect(dailySessions).toHaveLength(60);
    expect(new Set(dailySessions.map((session) => session.theme)).size).toBe(60);
    for (const session of dailySessions) {
      expect(session.grammar).toHaveLength(3);
      expect(session.reading.questions).toHaveLength(3);
      expect(session.listening.questions).toHaveLength(3);
      expect(session.reading.passage.split(/\s+/).length).toBeGreaterThanOrEqual(170);
      expect(session.writing.prompt).toBeTruthy();
      expect(session.speaking.prompt).toBeTruthy();
    }
  });

  it("mantiene respuestas válidas y audios propios por día", () => {
    for (const session of dailySessions) {
      expect(session.listening.audioAssetPath).toBe(`/audio/daily/day-${String(session.day).padStart(2, "0")}.m4a`);
      expect(statSync(join(process.cwd(), "public", session.listening.audioAssetPath)).size).toBeGreaterThan(10_000);
      for (const question of [...session.grammar, ...session.reading.questions, ...session.listening.questions]) {
        expect(question.choices).toHaveLength(4);
        expect(new Set(question.choices.map((choice) => choice.toLowerCase())).size).toBe(4);
        expect(question.choices[question.correctIndex]).toBeTruthy();
      }
    }
  });

  it("acepta solo días 1–60", () => {
    expect(getDailySession(1)?.day).toBe(1);
    expect(getDailySession(60)?.day).toBe(60);
    expect(getDailySession(0)).toBeUndefined();
    expect(getDailySession(61)).toBeUndefined();
    expect(getDailySession(1.5)).toBeUndefined();
  });
});
