import { beforeEach, describe, expect, it } from "vitest";
import { dailyProgressKey, useDailyProgressStore } from "./progress";

describe("avance de práctica diaria", () => {
  beforeEach(() => {
    localStorage.clear();
    useDailyProgressStore.setState({ days: {} });
  });

  it("separa perfiles y días, y persiste respuestas y escritura", () => {
    const key = dailyProgressKey("ana", 1);
    const other = dailyProgressKey("luis", 1);
    const store = useDailyProgressStore.getState();
    store.answer(key, "grammar-0", 2);
    store.answer(key, "grammar-0", 1); // The first submitted answer is final.
    store.setWriting(key, "A short practice response.");
    expect(useDailyProgressStore.getState().days[key].answers["grammar-0"]).toBe(2);
    expect(useDailyProgressStore.getState().days[other]).toBeUndefined();
    const saved = JSON.parse(localStorage.getItem("itep-simulator:daily-progress") ?? "null");
    expect(saved.state.days[key].writingText).toBe("A short practice response.");
  });

  it("conserva la fecha al completar sin reabrir respuestas", () => {
    const key = dailyProgressKey(null, 3);
    const store = useDailyProgressStore.getState();
    store.answer(key, "listening-0", 0);
    store.complete(key);
    const completedAt = useDailyProgressStore.getState().days[key].completedAt;
    store.answer(key, "listening-1", 1);
    store.complete(key);
    expect(useDailyProgressStore.getState().days[key].completedAt).toBe(completedAt);
    expect(useDailyProgressStore.getState().days[key].answers["listening-1"]).toBeUndefined();
  });
});
