import { beforeEach, describe, expect, it, vi } from "vitest";
import { emptyLearningProfile } from "@/lib/learning/model";
import { useLearningStore } from "@/lib/learning/store";
import { useDailyProgressStore } from "@/lib/content/daily/progress";
import { useGrammarProgressStore } from "@/lib/grammar-c1/progress";
import { useErrorNotebookStore } from "@/lib/notebook/store";
import { createStudyBackup, restoreStudyBackup } from "./backup";

const database = vi.hoisted(() => ({ getAll: vi.fn(), getAllKeys: vi.fn(), get: vi.fn(), transaction: vi.fn() }));
vi.mock("./db", () => ({ getDb: async () => database }));

describe("restauración durable y fallos de almacenamiento", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    localStorage.clear();
    database.getAll.mockResolvedValue([]);
    database.getAllKeys.mockResolvedValue([]);
    database.get.mockResolvedValue(undefined);
    useLearningStore.setState({ profiles: { guest: emptyLearningProfile() } });
    useDailyProgressStore.setState({ days: {} });
    useGrammarProgressStore.setState({ byProfile: {}, daysByProfile: {} });
    useErrorNotebookStore.setState({ entries: [], processedAttemptIds: [], studyDaysByProfile: {}, masteredByProfile: {}, masteredTopics: [], productiveFeedback: [] });
    await Promise.all([useLearningStore.persist.rehydrate(), useDailyProgressStore.persist.rehydrate(), useGrammarProgressStore.persist.rehydrate(), useErrorNotebookStore.persist.rehydrate()]);
  });
  it("adds audio to IndexedDB and writes the expected versioned stores", async () => {
    const put = vi.fn().mockResolvedValue("record");
    database.transaction.mockReturnValue({ objectStore: () => ({ put }), done: Promise.resolve(), abort: vi.fn() });
    const incoming = await createStudyBackup(false);
    incoming.audio = [{ key: "record", mimeType: "audio/webm", base64: "YXVkaW8=" }];
    incoming.includedAudio = true;
    incoming.learning.profiles["profile:ana"] = { ...emptyLearningProfile(), petName: "Luna" };
    await restoreStudyBackup(incoming);
    expect(put).toHaveBeenCalledWith({ key: "record", blob: expect.any(Blob) });
    expect(JSON.parse(localStorage.getItem("itep-simulator:learning-companion")!).state.profiles["profile:ana"].petName).toBe("Luna");
    expect(JSON.parse(localStorage.getItem("itep-simulator:grammar-c1-progress")!).version).toBe(2);
  });
  it("does not replace recordings already stored on this device", async () => {
    const put = vi.fn().mockResolvedValue("record");
    database.getAllKeys.mockImplementation(async (store) => store === "speakingAudioBlobs" ? ["record"] : []);
    database.transaction.mockReturnValue({ objectStore: () => ({ put }), done: Promise.resolve(), abort: vi.fn() });
    const incoming = await createStudyBackup(false);
    incoming.audio = [{ key: "record", mimeType: "audio/webm", base64: "YXVkaW8=" }];
    await restoreStudyBackup(incoming);
    expect(put).not.toHaveBeenCalled();
  });
  it("rolls back local writes when quota fails and observes aborted audio requests", async () => {
    const incoming = await createStudyBackup(false);
    incoming.daily.days["guest:2"] = { answers: {}, writingText: "Recovered text" };
    incoming.audio = [{ key: "record", mimeType: "audio/webm", base64: "YXVkaW8=" }];
    const before = localStorage.getItem("itep-simulator:daily-progress");
    const abort = vi.fn();
    database.transaction.mockReturnValue({ objectStore: () => ({ put: () => Promise.reject(new Error("aborted")) }), done: Promise.resolve(), abort });
    const original = Storage.prototype.setItem;
    let failOnce = true;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
      if (key === "itep-simulator:grammar-c1-progress" && failOnce) { failOnce = false; throw new Error("QuotaExceededError"); }
      original.call(this, key, value);
    });
    await expect(restoreStudyBackup(incoming)).rejects.toThrow("No se pudo restaurar");
    expect(abort).toHaveBeenCalled();
    expect(localStorage.getItem("itep-simulator:daily-progress")).toBe(before);
  });
});
