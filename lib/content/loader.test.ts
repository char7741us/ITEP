import { describe, expect, it } from "vitest";
import { listContentPacks, loadContentPack, pickContentPackKeyForMode } from "./loader";
import { validateContentPack } from "./schema";

describe("bancos iTEP Academic-Plus", () => {
  it("valida 32 combinaciones con la estructura y los tiempos oficiales", () => {
    const packs = listContentPacks();
    expect(packs).toHaveLength(32);
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
      for (let index = 0; index < 100; index++) {
        const next = pickContentPackKeyForMode(mode, previous);
        expect(next).not.toBe(previous);
        expect(loadContentPack(next)).toBeDefined();
        previous = next;
      }
    }
  });

  it("rechaza un banco con duración incorrecta", () => {
    const pack = structuredClone(loadContentPack());
    pack.reading.totalTimeSeconds = 1500;
    expect(() => validateContentPack(pack)).toThrow("Reading debe durar 20 minutos");
  });
});
