import type { ExamContentPack, ListeningLine, MCQItem } from "@/lib/types/content";

export interface FlattenedListeningSegment {
  globalIndex: number;
  partNumber: 1 | 2 | 3;
  partTitle: string;
  segmentLabel: string;
  audioScript: ListeningLine[];
  audioAssetPath: string;
  durationSeconds: number;
  items: MCQItem[];
}

export function getListeningSegments(contentPack: ExamContentPack): FlattenedListeningSegment[] {
  const segments: FlattenedListeningSegment[] = [];
  for (const part of contentPack.listening.parts) {
    part.segments.forEach((segment, segmentIndexInPart) => {
      segments.push({
        globalIndex: segments.length,
        partNumber: part.partNumber,
        partTitle: part.title,
        segmentLabel:
          part.segments.length > 1
            ? `Diálogo ${segmentIndexInPart + 1} de ${part.segments.length}`
            : part.title,
        audioScript: segment.audioScript,
        audioAssetPath: segment.audioAssetPath,
        durationSeconds: segment.durationSeconds,
        items: segment.items,
      });
    });
  }
  return segments;
}

export function getListeningItems(contentPack: ExamContentPack): MCQItem[] {
  return getListeningSegments(contentPack).flatMap((segment) => segment.items);
}
