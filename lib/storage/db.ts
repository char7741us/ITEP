import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { AttemptRecord } from "@/lib/types/attempt";

interface ItepDB extends DBSchema {
  attempts: {
    key: string;
    value: AttemptRecord;
    indexes: { "by-startedAt": string };
  };
  speakingAudioBlobs: {
    key: string;
    value: { key: string; blob: Blob };
  };
}

const DB_NAME = "itep-simulator";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ItepDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<ItepDB>> {
  if (typeof window === "undefined") {
    throw new Error("getDb() solo puede usarse en el navegador");
  }
  if (!dbPromise) {
    dbPromise = openDB<ItepDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("attempts")) {
          const store = db.createObjectStore("attempts", { keyPath: "id" });
          store.createIndex("by-startedAt", "startedAt");
        }
        if (!db.objectStoreNames.contains("speakingAudioBlobs")) {
          db.createObjectStore("speakingAudioBlobs", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}
