export type SkillSection =
  | "reading"
  | "listening"
  | "grammar"
  | "writing"
  | "speaking";

export interface MCQItem {
  id: string;
  prompt: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface ReadingPart {
  partNumber: 1 | 2;
  passageTitle: string;
  passageText: string;
  items: MCQItem[];
}

export interface ListeningLine {
  speaker: string;
  text: string;
}

export interface ListeningPart {
  partNumber: 1 | 2 | 3;
  title: string;
  /** For Part 1 this is an array of short independent dialogues; Part 2/3 use a single script. */
  segments: { audioScript: ListeningLine[]; audioAssetPath: string; durationSeconds: number; items: MCQItem[] }[];
}

export interface GrammarPart {
  partNumber: 1 | 2;
  kind: "sentence-completion" | "error-identification";
  items: MCQItem[];
}

export interface WritingTask {
  taskNumber: 1 | 2;
  title: string;
  prompt: string;
  minWords: number;
  maxWords: number;
  timeLimitSeconds: number;
}

export interface SpeakingTask {
  taskNumber: 1 | 2;
  title: string;
  prompt: string;
  prepSeconds: number;
  responseSeconds: number;
}

export interface ContentPackManifest {
  packId: string;
  version: string;
  locale: "en";
  createdAt: string;
  title: string;
}

export interface ExamContentPack {
  manifest: ContentPackManifest;
  reading: { totalTimeSeconds: number; parts: [ReadingPart, ReadingPart] };
  listening: { totalTimeSeconds: number; parts: [ListeningPart, ListeningPart, ListeningPart] };
  grammar: { totalTimeSeconds: number; parts: [GrammarPart, GrammarPart] };
  writing: { totalTimeSeconds: number; tasks: [WritingTask, WritingTask] };
  speaking: { warmupSeconds: number; tasks: [SpeakingTask, SpeakingTask] };
}
