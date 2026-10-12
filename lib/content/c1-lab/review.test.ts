import { beforeEach, describe, expect, it } from "vitest";
import { labKey, structureReview } from "./review";
import { structureLessons } from "./structures";
import { useDailyProgressStore, type DailyProgress } from "../daily/progress";
const lesson = structureLessons[0];
function round(form: 0 | 1, assisted = false, correct = 3): DailyProgress {
  return { writingText: "My recall", completedAt: "2026-10-12T12:00:00.000Z", structureRound: { form, assisted }, answers: Object.fromEntries(lesson.questions.slice(form * 3, form * 3 + 3).map((item, i) => [`grammar-${i}`, i < correct ? item.correctIndex : (item.correctIndex + 1) % 4])) };
}
describe("repaso espaciado de estructuras", () => {
  beforeEach(() => { localStorage.clear(); useDailyProgressStore.setState({ days: {} }); });
  it("schedules 1, 3, 7, 14 days without treating support or mistakes as mastery", () => {
    const prefix = `${labKey("ana", lesson.id)}:structure:`;
    const days: Record<string, DailyProgress> = { [`${prefix}2026-10-12`]: round(0) };
    expect(structureReview(days, "ana", lesson, "2026-10-12")).toMatchObject({ stage: 1, due: "2026-10-13", todayDone: true, isDue: false, nextForm: 1 });
    days[`${prefix}2026-10-13`] = round(1);
    expect(structureReview(days, "ana", lesson, "2026-10-13").due).toBe("2026-10-16");
    days[`${prefix}2026-10-16`] = round(0);
    expect(structureReview(days, "ana", lesson, "2026-10-16").due).toBe("2026-10-23");
    days[`${prefix}2026-10-23`] = round(1);
    expect(structureReview(days, "ana", lesson, "2026-10-23").due).toBe("2026-11-06");
    days[`${prefix}2026-11-06`] = round(0, true);
    expect(structureReview(days, "ana", lesson, "2026-11-06")).toMatchObject({ stage: 0, due: "2026-11-07" });
    days[`${prefix}2026-11-07`] = round(1, false, 2);
    expect(structureReview(days, "ana", lesson, "2026-11-07").stage).toBe(0);
  });
  it("separates students, dates, daily records and productive takes", () => {
    const days = { [`${labKey("ana", lesson.id)}:structure:2026-10-12`]: round(0), "ana:1": round(0), [`${labKey("ana", lesson.id)}:take:1`]: round(0) };
    expect(structureReview(days, "ana", lesson, "2026-10-13").rounds).toHaveLength(1);
    expect(structureReview(days, "luis", lesson, "2026-10-13").rounds).toHaveLength(0);
    expect(structureReview(days, null, lesson, "2026-10-13").rounds).toHaveLength(0);
  });
  it("keeps the chosen form and support flag through reload and cannot change a completed round", async () => {
    const key = `${labKey(null, lesson.id)}:structure:2026-10-12`;
    const store = useDailyProgressStore.getState();
    store.prepareStructure(key, 1); store.prepareStructure(key, 0);
    store.setWriting(key, "I completed it yesterday."); store.revealStructure(key);
    await useDailyProgressStore.persist.rehydrate();
    expect(useDailyProgressStore.getState().days[key]).toMatchObject({ structureRound: { form: 1, assisted: true }, writingText: "I completed it yesterday." });
    store.complete(key); store.answer(key, "grammar-0", 0);
    expect(useDailyProgressStore.getState().days[key].answers).toEqual({});
  });
  it("retains independent first and revised takes and invalidates only the edited grade", () => {
    const first = `${labKey("ana", "present-past-speaking-1")}:take:1`;
    const second = `${labKey("ana", "present-past-speaking-1")}:take:2`;
    const grade = { score: 4, cefrBand: "B2" as const, dimensionScores: {}, rationale: "Sample", strengths: [], improvements: [] };
    const store = useDailyProgressStore.getState();
    store.setSpeakingAudio(first, "audio-1"); store.setSpeakingGrade(first, grade);
    store.setSpeakingAudio(second, "audio-2"); store.setSpeakingGrade(second, grade);
    store.setSpeakingAudio(second, "audio-3");
    expect(useDailyProgressStore.getState().days[first].speakingGrade).toEqual(grade);
    expect(useDailyProgressStore.getState().days[first].speakingAudioKey).toBe("audio-1");
    expect(useDailyProgressStore.getState().days[second].speakingGrade).toBeUndefined();
  });
});
