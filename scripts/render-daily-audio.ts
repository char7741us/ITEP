import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { dailySessions } from "../lib/content/daily/build";

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

async function render(day: number) {
  const session = dailySessions[day - 1];
  const tempDir = await mkdtemp(join(tmpdir(), `itep-daily-audio-${day}-`));
  const output = join(process.cwd(), "public/audio/daily", `day-${String(day).padStart(2, "0")}.m4a`);
  try {
    const segments: Buffer[] = [];
    for (let i = 0; i < session.listening.lines.length; i++) {
      const line = session.listening.lines[i];
      const aiff = join(tempDir, `${i}.aiff`);
      const wav = join(tempDir, `${i}.wav`);
      await run("say", ["-v", line.speaker === "Student" ? "Samantha" : "Daniel", "-r", "180", "-o", aiff, line.text]);
      await run("afconvert", ["-f", "WAVE", "-d", "LEI16@22050", aiff, wav]);
      segments.push(pcmFromWav(await readFile(wav)));
      segments.push(Buffer.alloc(22050 * 2 / 5)); // 200 ms pause between speakers
    }
    const combined = join(tempDir, "combined.wav");
    await writeFile(combined, wrapWav(Buffer.concat(segments)));
    await run("afconvert", ["-f", "m4af", "-d", "aac", "-b", "48000", combined, output]);
    console.log(`Rendered day ${day}`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function main() {
  await mkdir(join(process.cwd(), "public/audio/daily"), { recursive: true });
  const arg = process.argv.find((value) => value.startsWith("--day="));
  const days = arg ? [Number(arg.slice(6))] : dailySessions.map((session) => session.day);
  for (const day of days) {
    if (!Number.isInteger(day) || day < 1 || day > 60) throw new Error(`Invalid day: ${day}`);
    await render(day);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
