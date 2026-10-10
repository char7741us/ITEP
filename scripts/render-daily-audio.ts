import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { dailySessions } from "../lib/content/daily/build";
import { renderSpeech } from "./render-speech";

async function main() {
  await mkdir(join(process.cwd(), "public/audio/daily"), { recursive: true });
  const arg = process.argv.find((value) => value.startsWith("--day="));
  const days = arg ? [Number(arg.slice(6))] : dailySessions.map((session) => session.day);
  for (const day of days) {
    if (!Number.isInteger(day) || day < 1 || day > 60) throw new Error(`Invalid day: ${day}`);
    const session = dailySessions[day - 1];
    const output = join(process.cwd(), "public/audio/daily", `day-${String(day).padStart(2, "0")}.m4a`);
    await renderSpeech(session.listening.lines, output, `daily-${day}`);
    console.log(`Rendered day ${day}`);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
