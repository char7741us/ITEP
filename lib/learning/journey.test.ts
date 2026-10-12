import { describe, expect, it } from "vitest";
import { emptyLearningProfile, dateKey, type LearningActivity } from "./model";
import { weeklyJourney, daysUntilExam, questionFingerprint } from "./journey";

describe("ruta personal y compromiso flexible", () => {
  it("uses a Monday-to-Sunday local week across month boundaries", () => {
    const profile = emptyLearningProfile();
    const now = new Date(2026, 10, 1, 23);
    expect(weeklyJourney(profile, now).days).toEqual(["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01"]);
  });
  it("only counts actual practice, not clocks, completion bonuses or future dates", () => {
    const profile = emptyLearningProfile();
    const now = new Date(2026, 9, 7, 12);
    const activity = (day: number, kind: LearningActivity["kind"], skill: LearningActivity["skill"] = "grammar"): LearningActivity => ({ id: `${day}:${kind}`, at: new Date(2026, 9, day, 12).toISOString(), day: dateKey(new Date(2026, 9, day)), kind, skill, xp: 0, label: "Test" });
    profile.activities = [activity(5, "question"), activity(5, "writing", "writing"), activity(6, "focus"), activity(7, "exam"), activity(8, "question"), activity(1, "question")];
    const week = weeklyJourney(profile, now);
    expect(week.practicedDays.size).toBe(1);
    expect(week.practicedSkills).toBe(2);
    expect(week.previousDays).toBe(1);
    expect(week.actionCount).toBe(2);
  });
  it("calculates calendar days and handles invalid, past and today's exam dates", () => {
    const now = new Date(2026, 9, 11, 23, 59);
    expect(daysUntilExam("2026-10-12", now)).toBe(1);
    expect(daysUntilExam("2026-10-11", now)).toBe(0);
    expect(daysUntilExam("2026-10-10", now)).toBe(-1);
    expect(daysUntilExam("2026-02-30", now)).toBeNull();
    expect(daysUntilExam(undefined, now)).toBeNull();
  });
  it("deduplicates a repeated microquiz even if its options were reordered", () => {
    expect(questionFingerprint("Choose the verb", ["is", "are", "was", "were"])).toBe(questionFingerprint("Choose the verb", ["were", "was", "are", "is"]));
    expect(questionFingerprint("Choose a noun", ["is", "are", "was", "were"])).not.toBe(questionFingerprint("Choose the verb", ["is", "are", "was", "were"]));
  });
});
