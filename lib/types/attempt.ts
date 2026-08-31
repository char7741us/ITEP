import type { SkillSection } from "./content";
import type { ExamMode } from "./mode";

export type CEFRBand = "Below B2" | "B2" | "C1" | "C2";

export interface RubricResult {
  score: number; // 0.0 - 6.0
  cefrBand: CEFRBand;
  dimensionScores: Record<string, number>;
  rationale: string;
  strengths: string[];
  improvements: string[];
}

export interface SectionTiming {
  startedAt: string;
  endsAt: string;
  submittedAt?: string;
  autoSubmitted: boolean;
  pausedAccumMs?: number;
}

export interface MCQResponse {
  itemId: string;
  selectedIndex: number | null;
  timeSpentMs: number;
}

export interface WritingResponse {
  taskNumber: 1 | 2;
  text: string;
  wordCount: number;
  grading?: RubricResult;
}

export interface SpeakingResponse {
  taskNumber: 1 | 2;
  audioBlobKey: string;
  transcript?: string;
  grading?: RubricResult;
}

export interface AttemptScores {
  reading: number;
  listening: number;
  grammar: number;
  writing: number;
  speaking: number;
  overall: number;
  overallBand: "Below B2" | "B2" | "C1" | "C2";
}

export interface AttemptRecord {
  id: string;
  /** Username of the active local profile when this attempt was started (see lib/storage/profileRepo.ts). Absent for attempts made before profiles existed. */
  profileUsername?: string;
  contentPackId: string;
  contentPackVersion: string;
  mode: ExamMode;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: string;
  completedAt?: string;
  currentSection: SkillSection | "done";
  sectionTimings: Partial<Record<SkillSection, SectionTiming>>;
  responses: {
    reading: MCQResponse[];
    listening: MCQResponse[];
    grammar: MCQResponse[];
    writing: WritingResponse[];
    speaking: SpeakingResponse[];
  };
  scores?: AttemptScores;
}

export function createEmptyResponses(): AttemptRecord["responses"] {
  return { reading: [], listening: [], grammar: [], writing: [], speaking: [] };
}
