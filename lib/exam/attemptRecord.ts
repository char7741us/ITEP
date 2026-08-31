import type { AttemptRecord } from "@/lib/types/attempt";
import { createEmptyResponses } from "@/lib/types/attempt";
import type { ExamMode } from "@/lib/types/mode";
import type { ExamContentPack } from "@/lib/types/content";
import type { ExamMachineContext } from "./machine.types";

export function createAttemptRecord(mode: ExamMode, contentPack: ExamContentPack): AttemptRecord {
  return {
    id: crypto.randomUUID(),
    contentPackId: contentPack.manifest.packId,
    contentPackVersion: contentPack.manifest.version,
    mode,
    status: "in_progress",
    startedAt: new Date().toISOString(),
    currentSection: "reading",
    sectionTimings: {},
    responses: createEmptyResponses(),
  };
}

export function buildCompletedAttemptRecord(base: AttemptRecord, context: ExamMachineContext): AttemptRecord {
  return {
    ...base,
    status: "completed",
    completedAt: new Date().toISOString(),
    currentSection: "done",
    sectionTimings: {
      reading: {
        startedAt: base.startedAt,
        endsAt: new Date(context.reading.endsAt ?? Date.now()).toISOString(),
        submittedAt: new Date().toISOString(),
        autoSubmitted: context.reading.autoSubmitted,
      },
      listening: {
        startedAt: base.startedAt,
        endsAt: new Date(context.listening.endsAt ?? Date.now()).toISOString(),
        submittedAt: new Date().toISOString(),
        autoSubmitted: context.listening.autoSubmitted,
      },
      grammar: {
        startedAt: base.startedAt,
        endsAt: new Date(context.grammar.endsAt ?? Date.now()).toISOString(),
        submittedAt: new Date().toISOString(),
        autoSubmitted: context.grammar.autoSubmitted,
      },
      writing: {
        startedAt: base.startedAt,
        endsAt: new Date(context.writing.endsAtByTask[2] ?? Date.now()).toISOString(),
        submittedAt: new Date().toISOString(),
        autoSubmitted: context.writing.autoSubmittedByTask[1] || context.writing.autoSubmittedByTask[2],
      },
      speaking: {
        startedAt: base.startedAt,
        endsAt: new Date(context.speaking.recordEndsAtByTask[2] ?? Date.now()).toISOString(),
        submittedAt: new Date().toISOString(),
        autoSubmitted: true,
      },
    },
    responses: {
      ...base.responses,
      reading: Object.values(context.reading.responses),
      listening: Object.values(context.listening.responses),
      grammar: Object.values(context.grammar.responses),
      writing: [1, 2].map((taskNumber) => ({
        taskNumber: taskNumber as 1 | 2,
        text: context.writing.texts[taskNumber as 1 | 2],
        wordCount: countWords(context.writing.texts[taskNumber as 1 | 2]),
        grading: context.writingGrades[taskNumber as 1 | 2],
      })),
      speaking: ([1, 2] as const)
        .filter((taskNumber) => context.speaking.audioBlobKeyByTask[taskNumber])
        .map((taskNumber) => ({
          taskNumber,
          audioBlobKey: context.speaking.audioBlobKeyByTask[taskNumber]!,
          grading: context.speakingGrades[taskNumber],
        })),
    },
    scores: context.scores ?? undefined,
  };
}

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}
