import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { newFullPacks } from "../lib/content/packs/daily-full/build";
import { renderSpeech } from "./render-speech";

async function main() {
  await mkdir(join(process.cwd(), "public/audio/mock-2026-v2"), { recursive: true });
  const requested = process.argv.find((value) => value.startsWith("--form="));
  const forms = requested ? [Number(requested.slice(7))] : newFullPacks.map((_, index) => index + 1);
  for (const form of forms) {
    if (!Number.isInteger(form) || form < 1 || form > newFullPacks.length) throw new Error(`Invalid form: ${form}`);
    const pack = newFullPacks[form - 1];
    const segments = (process.argv.includes("--long-only") ? pack.listening.parts.slice(1) : pack.listening.parts).flatMap((part) => part.segments);
    for (const [index, segment] of segments.entries()) {
      const output = join(process.cwd(), "public", segment.audioAssetPath.replace(/^\//, ""));
      await renderSpeech(segment.audioScript, output, `form-${form}-${index + 1}`);
      console.log(`Rendered form ${form} segment ${index + 1}/${segments.length}`);
    }
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
