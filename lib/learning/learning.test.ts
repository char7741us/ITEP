import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import {
  dateKey,
  emptyLearningProfile,
  learningBadges,
  learningStats,
  type LearningActivity,
} from "./model";
import {
  hydrateLearning,
  recordLearningActivity,
  useLearningStore,
} from "./store";
import { useFocusStore } from "./focus";

const activity = (
  id: string,
  date: Date,
  kind: LearningActivity["kind"] = "question",
): LearningActivity => ({
  id,
  kind,
  label: "Grammar",
  skill: "grammar",
  at: date.toISOString(),
  day: dateKey(date),
  xp: kind === "focus" ? 0 : 5,
});

describe("constancia y motivación basadas en práctica real", () => {
  beforeEach(() => {
    localStorage.clear();
    useLearningStore.setState({ profiles: {}, celebration: null });
    useFocusStore.getState().reset();
  });
  afterEach(() => vi.useRealTimers());

  it("preserves yesterday's streak before today's first practice, including a month boundary", () => {
    const profile = emptyLearningProfile();
    profile.activities = [
      activity("1", new Date(2026, 8, 29)),
      activity("2", new Date(2026, 8, 30)),
    ];
    expect(learningStats(profile, new Date(2026, 9, 1)).streak).toBe(2);
    profile.activities.push(activity("3", new Date(2026, 9, 1)));
    expect(learningStats(profile, new Date(2026, 9, 1)).streak).toBe(3);
    expect(learningStats(profile, new Date(2026, 9, 3)).streak).toBe(0);
    expect(learningStats(profile, new Date(2026, 9, 3)).bestStreak).toBe(3);
  });

  it("uses local dates and doesn't count a clock or multiple same-day events as extra days", () => {
    const now = new Date(2026, 9, 11, 0, 1);
    const profile = emptyLearningProfile();
    profile.activities = [activity("focus", now, "focus")];
    expect(learningStats(profile, now)).toMatchObject({
      streak: 0,
      xp: 0,
      actionCount: 0,
    });
    profile.activities.push(activity("one", now), activity("two", now));
    expect(learningStats(profile, now)).toMatchObject({
      streak: 1,
      actionCount: 2,
      goalMet: false,
    });
    expect(dateKey(now)).toBe("2026-10-11");
  });

  it("deduplicates saved answers, isolates profiles and persists settings and rewards", async () => {
    await hydrateLearning();
    const store = useLearningStore.getState();
    store.track("profile:michi", {
      id: "q1",
      kind: "question",
      label: "Una pregunta",
    });
    store.track("profile:michi", {
      id: "q1",
      kind: "question",
      label: "Guardado repetido",
    });
    store.track("guest", {
      id: "q1",
      kind: "speaking",
      label: "Práctica oral",
    });
    store.customize("profile:michi", {
      petName: "  Coco  ",
      petColor: "rose",
      dailyGoal: 10,
    });
    const profiles = useLearningStore.getState().profiles;
    expect(profiles["profile:michi"].activities).toHaveLength(1);
    expect(profiles["profile:michi"].activities[0].xp).toBe(5);
    expect(profiles.guest.activities[0].xp).toBe(15);
    expect(profiles["profile:michi"].petName).toBe("Coco");
    const persisted = localStorage.getItem(
      "itep-simulator:learning-companion",
    )!;
    useLearningStore.setState({ profiles: {} });
    localStorage.setItem("itep-simulator:learning-companion", persisted);
    await useLearningStore.persist.rehydrate();
    expect(useLearningStore.getState().profiles["profile:michi"]).toMatchObject(
      { petName: "Coco", petColor: "rose", dailyGoal: 10 },
    );
  });

  it("only celebrates reaching a goal once and does not celebrate backfilled history", () => {
    const store = useLearningStore.getState();
    for (let n = 0; n < 5; n++)
      store.track("guest", {
        id: String(n),
        kind: "question",
        label: "Práctica",
      });
    expect(useLearningStore.getState().celebration?.message).toContain(
      "Meta de hoy cumplida",
    );
    store.clearCelebration();
    store.track("guest", { id: "6", kind: "question", label: "Práctica" });
    expect(useLearningStore.getState().celebration).toBeNull();
    store.track(
      "guest",
      {
        id: "old-exam",
        kind: "exam",
        label: "Historia",
        at: new Date(2026, 1, 1).toISOString(),
      },
      true,
    );
    expect(useLearningStore.getState().celebration).toBeNull();
    store.track("guest", {
      id: "invalid",
      kind: "exam",
      label: "Dato inválido",
      at: "not-a-date",
    });
    expect(useLearningStore.getState().profiles.guest.activities).toHaveLength(
      7,
    );
  });

  it("unlocks accessories with effort without reducing XP when equipped", () => {
    const store = useLearningStore.getState();
    store.wear("guest", "star");
    expect(useLearningStore.getState().profiles.guest).toBeUndefined();
    store.track("guest", { id: "exam", kind: "exam", label: "Simulacro" });
    store.track("guest", {
      id: "round",
      kind: "round",
      label: "Ronda",
      skill: "grammar",
    });
    store.wear("guest", "star");
    store.wear("guest", "scholar");
    const profile = useLearningStore.getState().profiles.guest;
    expect(profile.accessory).toBe("star");
    expect(learningStats(profile, new Date())).toMatchObject({
      xp: 100,
      levelIndex: 1,
    });
    expect(
      learningBadges(profile, new Date()).find((badge) => badge.id === "first")
        ?.earned,
    ).toBe(true);
  });

  it("finishes focus exactly once, preserves paused time and gives no study streak", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 11, 12));
    const focus = useFocusStore.getState();
    focus.choose(5);
    focus.toggle(null);
    vi.advanceTimersByTime(60000);
    focus.tick();
    focus.pause();
    expect(useFocusStore.getState()).toMatchObject({
      remaining: 240,
      running: false,
    });
    vi.advanceTimersByTime(100000);
    focus.tick();
    expect(useFocusStore.getState().remaining).toBe(240);
    focus.toggle(null);
    vi.advanceTimersByTime(240000);
    focus.tick();
    focus.tick();
    await Promise.resolve();
    await recordLearningActivity(null, {
      id: "settle",
      kind: "focus",
      label: "settle",
    });
    const profile = useLearningStore.getState().profiles.guest;
    expect(
      profile.activities.filter((item) => item.id.startsWith("focus:")),
    ).toHaveLength(1);
    expect(learningStats(profile, new Date())).toMatchObject({
      streak: 0,
      xp: 0,
      actionCount: 0,
    });
  });
});
