import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ListeningLine } from "../lib/types/content";

const run = promisify(execFile);

function pcmFromWav(wav: Buffer): Buffer {
  if (wav.toString("ascii", 0, 4) !== "RIFF" || wav.toString("ascii", 8, 12) !== "WAVE") throw new Error("Invalid WAV audio");
  let offset = 12;
  while (offset + 8 <= wav.length) {
    const name = wav.toString("ascii", offset, offset + 4);
    const size = wav.readUInt32LE(offset + 4);
    if (name === "data") return wav.subarray(offset + 8, offset + 8 + size);
    offset += 8 + size + (size % 2);
  }
  throw new Error("WAV data chunk missing");
}

function wrapWav(data: Buffer): Buffer {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(22050, 24);
  header.writeUInt32LE(44100, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

/** Renders a scripted English dialogue or lecture to a static AAC asset using macOS voices. */
export async function renderSpeech(lines: ListeningLine[], output: string, tag: string): Promise<void> {
  const tempDir = await mkdtemp(join(tmpdir(), `itep-speech-${tag}-`));
  const speakers = Array.from(new Set(lines.map((line) => line.speaker)));
  try {
    const segments: Buffer[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const aiff = join(tempDir, `${i}.aiff`);
      const wav = join(tempDir, `${i}.wav`);
      const voice = speakers.indexOf(line.speaker) % 2 === 0 ? "Samantha" : "Daniel";
      await run("say", ["-v", voice, "-r", "180", "-o", aiff, line.text]);
      await run("afconvert", ["-f", "WAVE", "-d", "LEI16@22050", aiff, wav]);
      segments.push(pcmFromWav(await readFile(wav)));
      segments.push(Buffer.alloc(22050 * 2 / 5));
    }
    const combined = join(tempDir, "combined.wav");
    await writeFile(combined, wrapWav(Buffer.concat(segments)));
    await run("afconvert", ["-f", "m4af", "-d", "aac", "-b", "48000", combined, output]);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
