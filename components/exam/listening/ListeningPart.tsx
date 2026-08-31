"use client";

import type { FlattenedListeningSegment } from "@/lib/exam/listening";
import type { MCQResponse } from "@/lib/types/attempt";
import { AudioPlayer } from "./AudioPlayer";
import { NoteScratchpad } from "./NoteScratchpad";
import { MCQCard } from "@/components/exam/MCQCard";
import { Button } from "@/components/ui/button";

export function ListeningPart({
  segment,
  isLastSegment,
  alreadyPlayed,
  responses,
  onPlaybackEnd,
  onAnswer,
  onNext,
  onSubmit,
}: {
  segment: FlattenedListeningSegment;
  isLastSegment: boolean;
  alreadyPlayed: boolean;
  responses: Record<string, MCQResponse>;
  onPlaybackEnd: () => void;
  onAnswer: (itemId: string, selectedIndex: number) => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Parte {segment.partNumber} · {segment.segmentLabel}
        </p>
      </div>

      <AudioPlayer
        key={segment.globalIndex}
        audioAssetPath={segment.audioAssetPath}
        audioScript={segment.audioScript}
        alreadyPlayed={alreadyPlayed}
        onPlaybackEnd={onPlaybackEnd}
      />

      <NoteScratchpad />

      <div className="space-y-5">
        {segment.items.map((item, index) => (
          <MCQCard
            key={item.id}
            item={item}
            index={index}
            selectedIndex={responses[item.id]?.selectedIndex}
            onAnswer={(selectedIndex) => onAnswer(item.id, selectedIndex)}
          />
        ))}
      </div>

      <div className="flex justify-end">
        {isLastSegment ? (
          <Button size="lg" onClick={onSubmit}>
            Enviar Listening y continuar a Grammar
          </Button>
        ) : (
          <Button size="lg" onClick={onNext}>
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
}
