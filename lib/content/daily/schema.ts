import { z } from "zod";

const questionSchema = z.object({
  prompt: z.string().trim().min(12),
  choices: z.tuple([z.string().trim().min(1), z.string().trim().min(1), z.string().trim().min(1), z.string().trim().min(1)]),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().trim().min(12),
}).refine((question) => new Set(question.choices.map((choice) => choice.toLowerCase())).size === 4, {
  message: "Las opciones deben ser distintas",
});

export const dailySessionSchema = z.object({
  day: z.number().int().min(1).max(60),
  theme: z.string().trim().min(4),
  grammar: z.tuple([questionSchema, questionSchema, questionSchema]),
  reading: z.object({
    title: z.string().trim().min(5),
    passage: z.string().trim().min(400),
    questions: z.tuple([questionSchema, questionSchema, questionSchema]),
  }),
  listening: z.object({
    lines: z.array(z.object({ speaker: z.string().trim().min(1), text: z.string().trim().min(8) })).min(6).max(12),
    questions: z.tuple([questionSchema, questionSchema, questionSchema]),
    audioAssetPath: z.string().regex(/^\/audio\/daily\/day-\d{2}\.m4a$/),
  }),
  writing: z.object({
    taskNumber: z.union([z.literal(1), z.literal(2)]),
    prompt: z.string().trim().min(30),
    minWords: z.number().int(),
    maxWords: z.number().int(),
  }),
  speaking: z.object({
    taskNumber: z.union([z.literal(1), z.literal(2)]),
    prompt: z.string().trim().min(30),
    prepSeconds: z.number().int(),
    responseSeconds: z.number().int(),
  }),
}).superRefine((session, ctx) => {
  const words = session.reading.passage.trim().split(/\s+/).length;
  if (words < 170 || words > 260) ctx.addIssue({ code: "custom", path: ["reading", "passage"], message: `La lectura tiene ${words} palabras; se requieren 170–260` });
  const spokenWords = session.listening.lines.reduce((count, line) => count + line.text.trim().split(/\s+/).length, 0);
  if (spokenWords < 75 || spokenWords > 160) ctx.addIssue({ code: "custom", path: ["listening", "lines"], message: `El audio tiene ${spokenWords} palabras; se requieren 75–160` });
  if (new Set(session.listening.lines.map((line) => line.speaker)).size !== 2) ctx.addIssue({ code: "custom", path: ["listening", "lines"], message: "Se requieren dos hablantes" });
  const short = session.day % 2 === 1;
  if (session.writing.taskNumber !== (short ? 1 : 2) || session.writing.minWords !== (short ? 50 : 175) || session.writing.maxWords !== (short ? 75 : 225)) {
    ctx.addIssue({ code: "custom", path: ["writing"], message: "La tarea de Writing no corresponde al día" });
  }
  if (session.speaking.taskNumber !== (short ? 1 : 2) || session.speaking.prepSeconds !== (short ? 30 : 45) || session.speaking.responseSeconds !== (short ? 45 : 60)) {
    ctx.addIssue({ code: "custom", path: ["speaking"], message: "La tarea de Speaking no corresponde al día" });
  }
  if (session.listening.audioAssetPath !== `/audio/daily/day-${String(session.day).padStart(2, "0")}.m4a`) {
    ctx.addIssue({ code: "custom", path: ["listening", "audioAssetPath"], message: "El audio no corresponde al día" });
  }
});

export const dailySessionsSchema = z.array(dailySessionSchema).length(60).superRefine((sessions, ctx) => {
  const days = new Set(sessions.map((session) => session.day));
  if (days.size !== 60 || sessions.some((session, index) => session.day !== index + 1)) {
    ctx.addIssue({ code: "custom", message: "Deben existir los días 1 al 60 en orden" });
  }
  if (new Set(sessions.map((session) => session.reading.passage.toLowerCase())).size !== 60) {
    ctx.addIssue({ code: "custom", message: "Las 60 lecturas deben ser distintas" });
  }
  if (new Set(sessions.map((session) => session.listening.lines.map((line) => line.text).join(" ").toLowerCase())).size !== 60) {
    ctx.addIssue({ code: "custom", message: "Los 60 diálogos deben ser distintos" });
  }
});

export type DailySession = z.infer<typeof dailySessionSchema>;
