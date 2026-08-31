import type { ExamMode } from "@/lib/types/mode";
import type { AttemptScores, MCQResponse, RubricResult } from "@/lib/types/attempt";

export interface ReadingRuntimeState {
  partIndex: 0 | 1;
  responses: Record<string, MCQResponse>;
  endsAt: number | null;
  autoSubmitted: boolean;
}

export interface ListeningRuntimeState {
  currentSegmentIndex: number;
  responses: Record<string, MCQResponse>;
  /** Serializable in place of a Set, so the whole context stays JSON-safe for persistence. */
  playedSegmentIndices: number[];
  endsAt: number | null;
  autoSubmitted: boolean;
}

export interface GrammarRuntimeState {
  currentIndex: number;
  responses: Record<string, MCQResponse>;
  endsAt: number | null;
  autoSubmitted: boolean;
}

export interface WritingRuntimeState {
  texts: Record<1 | 2, string>;
  endsAtByTask: Record<1 | 2, number | null>;
  autoSubmittedByTask: Record<1 | 2, boolean>;
}

export interface SpeakingRuntimeState {
  warmupEndsAt: number | null;
  prepEndsAtByTask: Record<1 | 2, number | null>;
  recordEndsAtByTask: Record<1 | 2, number | null>;
  audioBlobKeyByTask: Partial<Record<1 | 2, string>>;
}

export interface ExamMachineContext {
  attemptId: string;
  mode: ExamMode;
  /** Static content lives in the content-pack registry, not in context — keeps
   * persisted snapshots small and avoids duplicating immutable data. Look it up
   * with `loadContentPack(contentPackKey)` wherever the pack itself is needed. */
  contentPackKey: string;
  reading: ReadingRuntimeState;
  listening: ListeningRuntimeState;
  grammar: GrammarRuntimeState;
  writing: WritingRuntimeState;
  speaking: SpeakingRuntimeState;
  scores: AttemptScores | null;
  writingGrades: Partial<Record<1 | 2, RubricResult>>;
  speakingGrades: Partial<Record<1 | 2, RubricResult>>;
  gradingErrors: string[];
}

export interface ExamMachineInput {
  attemptId: string;
  mode: ExamMode;
  contentPackKey: string;
}

export type ExamMachineEvent =
  | { type: "START" }
  | { type: "ANSWER_READING"; itemId: string; selectedIndex: number; timeSpentMs: number }
  | { type: "NEXT_READING_PART" }
  | { type: "SUBMIT_READING" }
  | { type: "MARK_SEGMENT_PLAYED"; index: number }
  | { type: "ANSWER_LISTENING"; itemId: string; selectedIndex: number; timeSpentMs: number }
  | { type: "NEXT_LISTENING_SEGMENT" }
  | { type: "SUBMIT_LISTENING" }
  | { type: "ANSWER_GRAMMAR"; itemId: string; selectedIndex: number; timeSpentMs: number }
  | { type: "GO_TO_GRAMMAR_ITEM"; index: number }
  | { type: "SUBMIT_GRAMMAR" }
  | { type: "UPDATE_WRITING_TEXT"; taskNumber: 1 | 2; text: string }
  | { type: "SUBMIT_WRITING_TASK" }
  | { type: "SAVE_SPEAKING_RECORDING"; taskNumber: 1 | 2; blobKey: string }
  | { type: "TICK"; now: number };
