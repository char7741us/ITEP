import { beforeEach, describe, expect, it } from "vitest";
import { recallForDay } from "./recall";
import { useLearningStore } from "./store";

describe("recuperación activa en tres minutos", () => {
  beforeEach(() => { localStorage.clear(); useLearningStore.setState({ profiles: {} }); });
  it("rotates all 13 topics over 13 days with four options and a complete solution", () => {
    const topics = new Set<string>();
    for (let index = 1; index <= 13; index++) {
      const challenge = recallForDay(`2026-10-${String(index).padStart(2, "0")}`);
      topics.add(challenge.topic.id);
      expect(challenge.options).toHaveLength(4);
      expect(challenge.correctIndex).toBeGreaterThanOrEqual(0);
      expect(challenge.correctIndex).toBeLessThan(4);
      expect(challenge.solution).not.toContain("[[");
      expect(challenge.solution).not.toContain("_____");
    }
    expect(topics.size).toBe(13);
  });
  it("keeps today's question stable across reloads", () => {
    expect(recallForDay("2026-10-11")).toEqual(recallForDay("2026-10-11"));
    expect(recallForDay("2026-10-11").id).not.toEqual(recallForDay("2026-10-12").id);
  });
  it("can display historical notes dated before the Unix epoch", () => {
    expect(recallForDay("1960-01-01").options).toHaveLength(4);
  });
  it("retains the first answer and saves reflection without mixing profiles", async () => {
    const record = { questionId: "q1", prediction: "is, because the subject is singular", confidence: "sure" as const, selectedIndex: 1, reflection: "", answeredAt: "2026-10-11T12:00:00.000Z" };
    const store = useLearningStore.getState();
    store.saveRecall("guest", "2026-10-11", record);
    store.saveRecall("guest", "2026-10-11", { ...record, selectedIndex: 2 });
    store.reflectRecall("guest", "2026-10-11", "Buscar el núcleo.");
    store.saveRecall("profile:ana", "2026-10-11", { ...record, selectedIndex: 0 });
    const saved = localStorage.getItem("itep-simulator:learning-companion")!;
    useLearningStore.setState({ profiles: {} });
    localStorage.setItem("itep-simulator:learning-companion", saved);
    await useLearningStore.persist.rehydrate();
    expect(useLearningStore.getState().profiles.guest.recalls?.["2026-10-11"]).toMatchObject({ selectedIndex: 1, reflection: "Buscar el núcleo." });
    expect(useLearningStore.getState().profiles["profile:ana"].recalls?.["2026-10-11"].selectedIndex).toBe(0);
  });
});
