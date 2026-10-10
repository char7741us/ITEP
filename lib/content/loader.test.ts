import { describe, expect, it } from "vitest";
import { statSync } from "node:fs";
import { join } from "node:path";
import { listContentPacks, loadContentPack, pickContentPackKeyForMode } from "./loader";
import { validateContentPack } from "./schema";

describe("bancos iTEP Academic-Plus", () => {
  it("valida 32 bancos históricos y 6 simulacros nuevos con la estructura y los tiempos oficiales", () => {
    const packs = listContentPacks();
    expect(packs).toHaveLength(38);
    for (const { key } of packs) {
      const pack = loadContentPack(key);
      expect(`${pack.manifest.packId}@${pack.manifest.version}`).toBe(key);
      expect(pack.reading.totalTimeSeconds).toBe(1200);
      expect(pack.grammar.parts.map((part) => part.items.length)).toEqual([13, 12]);
    }
  });

  it("alterna variantes y nunca repite el banco inmediatamente anterior", () => {
    for (const mode of ["practice", "intensive"] as const) {
      let previous = pickContentPackKeyForMode(mode);
      const firstCycle = [previous];
      for (let index = 0; index < 5; index++) {
        previous = pickContentPackKeyForMode(mode, previous);
        firstCycle.push(previous);
      }
      expect(new Set(firstCycle).size).toBe(6);
      expect(firstCycle.every((key) => key.includes("-new-"))).toBe(true);
      for (let index = 0; index < 100; index++) {
        const next = pickContentPackKeyForMode(mode, previous);
        expect(next).not.toBe(previous);
        expect(loadContentPack(next)).toBeDefined();
        previous = next;
      }
    }
  });

  it("cada simulacro nuevo tiene textos y guiones distintos", () => {
    const packs = listContentPacks().filter(({ key }) => key.includes("-new-")).map(({ key }) => loadContentPack(key));
    expect(new Set(packs.map((pack) => pack.reading.parts[0].passageText)).size).toBe(6);
    expect(new Set(packs.map((pack) => pack.reading.parts[1].passageText)).size).toBe(6);
    expect(new Set(packs.map((pack) => pack.listening.parts[2].segments[0].audioScript.map((line) => line.text).join(" "))).size).toBe(6);
    for (const pack of packs) {
      expect(pack.reading.parts[0].passageText.split(/\s+/).length).toBeGreaterThanOrEqual(170);
      expect(pack.reading.parts[1].passageText.split(/\s+/).length).toBeGreaterThanOrEqual(400);
      for (const segment of pack.listening.parts.flatMap((part) => part.segments)) {
        const asset = join(process.cwd(), "public", segment.audioAssetPath);
        expect(statSync(asset).size).toBeGreaterThan(10_000);
      }
    }
    const firstError = packs[0].grammar.parts[1].items[0];
    expect(firstError.choices[firstError.correctIndex]).toBe("have completed");
  });

  it("rechaza un banco con duración incorrecta", () => {
    const pack = structuredClone(loadContentPack());
    pack.reading.totalTimeSeconds = 1500;
    expect(() => validateContentPack(pack)).toThrow("Reading debe durar 20 minutos");
  });
});
