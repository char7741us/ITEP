import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { itepAcademicPlusV1 } from "@/lib/content/packs/itep-academic-plus-v1";
import { itepAcademicPlusV2 } from "@/lib/content/packs/itep-academic-plus-v2";
import { getListeningSegments } from "@/lib/exam/listening";
import { synthesizeListeningAudio } from "@/lib/gemini/tts";
import type { ExamContentPack } from "@/lib/types/content";

const PACKS: ExamContentPack[] = [itepAcademicPlusV1, itepAcademicPlusV2];

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY no está configurada. Copia .env.local.example a .env.local y agrega tu key.");
    process.exitCode = 1;
    return;
  }

  let ok = 0;
  let failed = 0;

  for (const pack of PACKS) {
    for (const segment of getListeningSegments(pack)) {
      const relativePath = segment.audioAssetPath.replace(/^\//, "");
      const outPath = path.join(process.cwd(), "public", relativePath);
      process.stdout.write(`${pack.manifest.packId} · ${relativePath} ... `);
      try {
        const wavBuffer = await synthesizeListeningAudio(segment.audioScript);
        await mkdir(path.dirname(outPath), { recursive: true });
        await writeFile(outPath, wavBuffer);
        console.log(`OK (${(wavBuffer.length / 1024).toFixed(0)} KB)`);
        ok++;
      } catch (err) {
        console.log(`FALLÓ: ${err instanceof Error ? err.message : err}`);
        failed++;
      }
    }
  }

  console.log(`\n${ok} archivos generados, ${failed} fallidos.`);
  if (failed > 0) process.exitCode = 1;
}

main();
