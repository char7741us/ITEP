import { describe, expect, it } from "vitest";
import { studyBackupSchema, parseStudyBackup, mergeStudyBackups, type StudyBackup } from "./backup-schema";
import { emptyLearningProfile } from "@/lib/learning/model";

const emptyBackup = (): StudyBackup => ({ format: "itep-study-backup", version: 1, exportedAt: "2026-10-11T12:00:00.000Z", profiles: [], activeUsername: null, daily: { days: {} }, grammar: { byProfile: {}, daysByProfile: {} }, notebook: { entries: [], masteredTopics: [], masteredByProfile: {}, studyDaysByProfile: {}, processedAttemptIds: [], productiveFeedback: [] }, learning: { profiles: {} }, attempts: [], audio: [], includedAudio: false });
const topic = { id: "topic-a", section: "Grammar" as const, failed_rule: "Subject–verb agreement", streak: 1, profileUsername: null };

describe("copias portables del progreso", () => {
  it("round-trips a versioned backup with optional plan and recorded audio", () => {
    const backup = emptyBackup();
    backup.learning.profiles.guest = { ...emptyLearningProfile(), studyPlan: { weeklyDays: 2, focus: "grammar", targetDate: "2026-11-15" } };
    backup.audio = [{ key: "audio-1", mimeType: "audio/webm;codecs=opus", base64: "YXVkaW8=" }];
    backup.includedAudio = true;
    backup.notebook.entries = [topic];
    expect(parseStudyBackup(JSON.stringify(backup))).toEqual(backup);
  });
  it("rejects invalid files, unsupported versions, invalid scores and prototype keys", () => {
    expect(() => parseStudyBackup("not json")).toThrow();
    expect(() => parseStudyBackup(JSON.stringify({ ...emptyBackup(), version: 2 }))).toThrow();
    expect(() => parseStudyBackup('{"__proto__":{"polluted":true}}')).toThrow();
    const backup = emptyBackup();
    backup.notebook.entries = [{ ...topic, streak: 3 }];
    expect(studyBackupSchema.safeParse(backup).success).toBe(false);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    const badRecall = emptyBackup();
    badRecall.learning.profiles.guest = { ...emptyLearningProfile(), recalls: { "not-a-date": { questionId: "q1", prediction: "", confidence: "sure", selectedIndex: 0, reflection: "", answeredAt: badRecall.exportedAt } } };
    expect(studyBackupSchema.safeParse(badRecall).success).toBe(false);
  });
  it("does not overwrite answers, drafts or completed days already on this device", () => {
    const current = emptyBackup(), incoming = emptyBackup();
    current.daily.days["guest:1"] = { answers: { "grammar-0": 0 }, writingText: "My current draft" };
    incoming.daily.days["guest:1"] = { answers: { "grammar-0": 2 }, writingText: "Old draft", completedAt: incoming.exportedAt };
    incoming.daily.days["guest:2"] = { answers: {}, writingText: "New day" };
    const merged = mergeStudyBackups(current, incoming);
    expect(merged.daily.days["guest:1"]).toEqual(current.daily.days["guest:1"]);
    expect(merged.daily.days["guest:2"].writingText).toBe("New day");
    expect(studyBackupSchema.safeParse(merged).success).toBe(true);
  });
  it("keeps a current pending topic pending when an old backup says mastered", () => {
    const current = emptyBackup(), incoming = emptyBackup();
    current.notebook.entries = [topic];
    incoming.notebook.masteredTopics = [{ ...topic, masteredAt: incoming.exportedAt }];
    const merged = mergeStudyBackups(current, incoming);
    expect(merged.notebook.entries).toEqual([topic]);
    expect(merged.notebook.masteredTopics).toEqual([]);
  });
  it("does not resurrect a locally mastered topic from an old pending entry", () => {
    const current = emptyBackup(), incoming = emptyBackup();
    current.notebook.masteredTopics = [{ ...topic, masteredAt: current.exportedAt }];
    incoming.notebook.entries = [topic];
    const merged = mergeStudyBackups(current, incoming);
    expect(merged.notebook.entries).toEqual([]);
    expect(merged.notebook.masteredTopics).toHaveLength(1);
  });
  it("merges unique activity IDs without doubling XP or replacing preferences", () => {
    const current = emptyBackup(), incoming = emptyBackup();
    const activity = { id: "q1", at: current.exportedAt, day: "2026-10-11", xp: 5, kind: "question" as const, skill: "grammar" as const, label: "Grammar" };
    current.learning.profiles.guest = { ...emptyLearningProfile(), petName: "Luna", activities: [activity] };
    incoming.learning.profiles.guest = { ...emptyLearningProfile(), activities: [activity, { ...activity, id: "q2" }] };
    const once = mergeStudyBackups(current, incoming);
    const twice = mergeStudyBackups(once, incoming);
    expect(twice.learning.profiles.guest.activities).toHaveLength(2);
    expect(twice.learning.profiles.guest.petName).toBe("Luna");
    expect(twice.learning.profiles.guest.activities.reduce((sum, item) => sum + item.xp, 0)).toBe(10);
  });
  it("preserves current profiles, audio and Grammar results while adding missing ones", () => {
    const current = emptyBackup(), incoming = emptyBackup();
    current.profiles = [{ username: "ana", name: "Ana actual", createdAt: current.exportedAt }];
    incoming.profiles = [{ ...current.profiles[0], name: "Ana antigua" }, { username: "maria", name: "María", createdAt: current.exportedAt }];
    current.grammar.daysByProfile.guest = { 1: { attempts: 2, bestCorrect: 4, total: 5 } };
    incoming.grammar.daysByProfile.guest = { 1: { attempts: 1, bestCorrect: 5, total: 5, completedAt: incoming.exportedAt }, 2: { attempts: 1, bestCorrect: 5, total: 5 } };
    const merged = mergeStudyBackups(current, incoming);
    expect(merged.profiles[0].name).toBe("Ana actual");
    expect(merged.profiles).toHaveLength(2);
    expect(merged.grammar.daysByProfile.guest[1]).toEqual(current.grammar.daysByProfile.guest[1]);
    expect(merged.grammar.daysByProfile.guest[2].bestCorrect).toBe(5);
  });
});
