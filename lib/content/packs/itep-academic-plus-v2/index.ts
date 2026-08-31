import type { ExamContentPack } from "@/lib/types/content";
import { manifest } from "./manifest";
import { readingContent } from "./reading";
import { listeningContent } from "./listening";
import { grammarContent } from "./grammar";
import { writingContent } from "./writing";
import { speakingContent } from "./speaking";

export const itepAcademicPlusV2: ExamContentPack = {
  manifest,
  reading: readingContent,
  listening: listeningContent,
  grammar: grammarContent,
  writing: writingContent,
  speaking: speakingContent,
};
