import { z } from "zod";
import { rubricResultSchema } from "@/lib/gemini/validation";

const text = z.string().max(20_000);
const id = z.string().min(1).max(500);
const date = z.iso.datetime();
const username = z.string().regex(/^[a-z0-9][a-z0-9-]{0,29}$/);
const skill = z.enum(["grammar", "reading", "listening", "writing", "speaking"]);
const section = z.enum(["Grammar", "Reading", "Listening"]);
const counter = z.number().int().min(0).max(1_000_000);
const strings = z.array(id).max(100_000);
const keyed = <T extends z.ZodType>(schema: T) => z.record(z.string().min(1).max(500).refine((key) => !["__proto__", "prototype", "constructor"].includes(key)), schema);
const mcq = z.object({ itemId: id, selectedIndex: z.number().int().min(0).max(3).nullable(), timeSpentMs: z.number().min(0) });
const scores = z.object({ reading: z.number().min(0).max(6), listening: z.number().min(0).max(6), grammar: z.number().min(0).max(6), writing: z.number().min(0).max(6), speaking: z.number().min(0).max(6), overall: z.number().min(0).max(6), overallBand: z.enum(["Below B2", "B2", "C1", "C2"]) });
const taskNumber = z.union([z.literal(1), z.literal(2)]);
const timing = z.object({ startedAt: date, endsAt: date, submittedAt: date.optional(), autoSubmitted: z.boolean(), pausedAccumMs: z.number().min(0).optional() });
export const backupAttemptSchema = z.object({
  id, profileUsername: username.optional(), contentPackId: id, contentPackVersion: id,
  mode: z.enum(["practice", "intensive"]), status: z.literal("completed"), startedAt: date, completedAt: date.optional(),
  currentSection: z.enum(["grammar", "reading", "listening", "writing", "speaking", "done"]),
  sectionTimings: z.object({ grammar: timing.optional(), reading: timing.optional(), listening: timing.optional(), writing: timing.optional(), speaking: timing.optional() }),
  responses: z.object({ grammar: z.array(mcq).max(100), reading: z.array(mcq).max(100), listening: z.array(mcq).max(100), writing: z.array(z.object({ taskNumber, text, wordCount: counter, grading: rubricResultSchema.optional() })).max(2), speaking: z.array(z.object({ taskNumber, audioBlobKey: z.string().max(500), transcript: text.optional(), grading: rubricResultSchema.optional() })).max(2) }),
  scores: scores.optional(), gradingErrors: z.array(text).max(20).optional(),
});
const dailyDay = z.object({ answers: keyed(z.number().int().min(0).max(3)), writingText: text, writingGrade: rubricResultSchema.optional(), speakingAudioKey: id.optional(), speakingPracticed: z.boolean().optional(), speakingGrade: rubricResultSchema.optional(), completedAt: date.optional(), structureRound: z.object({ form: z.union([z.literal(0), z.literal(1)]), assisted: z.boolean() }).optional() });
const topic = z.object({ completedIds: strings, attempts: counter, rounds: counter });
const day = z.object({ attempts: counter, bestCorrect: counter, total: counter, completedAt: date.optional() });
const profile = z.object({ username, name: z.string().min(1).max(100), createdAt: date });
const learningProfile = z.object({
  activities: z.array(z.object({ id, kind: z.enum(["question", "writing", "speaking", "round", "mastery", "daily", "exam", "focus"]), label: z.string().max(2000), skill: skill.optional(), at: date, day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), xp: z.number().min(0).max(80) })).max(100_000),
  petName: z.string().min(1).max(24), petColor: z.enum(["mint", "rose", "lavender"]), accessory: z.enum(["none", "star", "flower", "scholar"]), dailyGoal: z.union([z.literal(5), z.literal(10), z.literal(15)]),
  studyPlan: z.object({ weeklyDays: z.union([z.literal(2), z.literal(3), z.literal(5)]), focus: z.enum(["balanced", "grammar", "reading", "listening", "writing", "speaking"]), targetDate: z.iso.date().optional() }).optional(),
  recalls: z.record(z.iso.date(), z.object({ questionId: id, prediction: z.string().max(500), confidence: z.enum(["sure", "between", "guess"]), selectedIndex: z.number().int().min(0).max(3), reflection: z.string().max(600), answeredAt: date })).optional(),
});
export const studyBackupSchema = z.object({
  format: z.literal("itep-study-backup"), version: z.literal(1), exportedAt: date,
  profiles: z.array(profile).max(100), activeUsername: username.nullable(),
  daily: z.object({ days: keyed(dailyDay) }),
  grammar: z.object({ byProfile: keyed(keyed(topic)), daysByProfile: keyed(z.record(z.string().regex(/^(?:[1-9]|1[0-9]|20)$/), day)) }),
  notebook: z.object({
    entries: z.array(z.object({ id, section, failed_rule: text, streak: z.number().int().min(0).max(2), profileUsername: username.nullable() })).max(10_000),
    processedAttemptIds: strings, studyDaysByProfile: keyed(z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(10_000)), masteredByProfile: keyed(counter),
    masteredTopics: z.array(z.object({ id, section, failed_rule: text, profileUsername: username.nullable(), masteredAt: date })).max(10_000),
    productiveFeedback: z.array(z.object({ id, section: z.enum(["Writing", "Speaking"]), taskNumber, score: z.number().min(0).max(6), rationale: text, improvements: z.array(text).max(10), profileUsername: username.nullable(), recordedAt: date })).max(10_000),
  }),
  learning: z.object({ profiles: keyed(learningProfile) }),
  attempts: z.array(backupAttemptSchema).max(2000),
  includedAudio: z.boolean(),
  audio: z.array(z.object({ key: id, mimeType: z.string().regex(/^audio\/[\w.+-]+(?:;[\w=., -]+)?$/), base64: z.string().max(4_000_000).regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/) })).max(5000),
});
export type StudyBackup = z.infer<typeof studyBackupSchema>;
export const MAX_BACKUP_BYTES = 100 * 1024 * 1024;

export function parseStudyBackup(json: string): StudyBackup {
  if (new TextEncoder().encode(json).length > MAX_BACKUP_BYTES) throw new Error("La copia supera 100 MB.");
  const value = JSON.parse(json, (key, item) => {
    if (["__proto__", "constructor", "prototype"].includes(key)) throw new Error("La copia contiene claves no permitidas.");
    return item;
  });
  return studyBackupSchema.parse(value);
}

/** Import only missing records. Never combine conflicting answers or overwrite local work. */
export function mergeStudyBackups(current: StudyBackup, incoming: StudyBackup): StudyBackup {
  const union = <T>(a: T[], b: T[], key: (value: T) => string): T[] => {
    const seen = new Set<string>();
    return [...a, ...b].filter((value) => {
      const identifier = key(value);
      if (seen.has(identifier)) return false;
      seen.add(identifier);
      return true;
    });
  };
  const mergeNested = <T>(a: Record<string, Record<string, T>>, b: Record<string, Record<string, T>>) => Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])].map((key) => [key, { ...b[key], ...a[key] }]));
  const topicKey = (item: { profileUsername: string | null; section: string; failed_rule: string }) => JSON.stringify([item.profileUsername, item.section, item.failed_rule]);
  const existingTopics = new Set([...current.notebook.entries, ...current.notebook.masteredTopics].map(topicKey));
  const entries = [...current.notebook.entries, ...incoming.notebook.entries.filter((item) => !existingTopics.has(topicKey(item)))];
  const pending = new Set(entries.map(topicKey));
  const masteredTopics = [...current.notebook.masteredTopics, ...incoming.notebook.masteredTopics.filter((item) => !existingTopics.has(topicKey(item)))].filter((item) => !pending.has(topicKey(item)));
  const learningProfiles = { ...incoming.learning.profiles };
  for (const [key, value] of Object.entries(current.learning.profiles)) learningProfiles[key] = { ...value, recalls: { ...incoming.learning.profiles[key]?.recalls, ...value.recalls }, activities: union(value.activities, incoming.learning.profiles[key]?.activities ?? [], (item) => item.id) };
  const masteredCounts = { ...incoming.notebook.masteredByProfile };
  for (const [key, count] of Object.entries(current.notebook.masteredByProfile)) masteredCounts[key] = Math.max(count, masteredCounts[key] ?? 0);
  return {
    ...current,
    profiles: union(current.profiles, incoming.profiles, (item) => item.username),
    activeUsername: current.activeUsername ?? incoming.activeUsername,
    daily: { days: { ...incoming.daily.days, ...current.daily.days } },
    grammar: { byProfile: mergeNested(current.grammar.byProfile, incoming.grammar.byProfile), daysByProfile: mergeNested(current.grammar.daysByProfile, incoming.grammar.daysByProfile) },
    notebook: { entries, masteredTopics, processedAttemptIds: [...new Set([...current.notebook.processedAttemptIds, ...incoming.notebook.processedAttemptIds])], masteredByProfile: masteredCounts, productiveFeedback: union(current.notebook.productiveFeedback, incoming.notebook.productiveFeedback, (item) => item.id), studyDaysByProfile: Object.fromEntries([...new Set([...Object.keys(current.notebook.studyDaysByProfile), ...Object.keys(incoming.notebook.studyDaysByProfile)])].map((key) => [key, [...new Set([...(current.notebook.studyDaysByProfile[key] ?? []), ...(incoming.notebook.studyDaysByProfile[key] ?? [])])].sort()])) },
    learning: { profiles: learningProfiles },
    attempts: union(current.attempts, incoming.attempts, (item) => item.id),
    audio: union(current.audio, incoming.audio, (item) => item.key),
    includedAudio: current.includedAudio || incoming.includedAudio,
  };
}
