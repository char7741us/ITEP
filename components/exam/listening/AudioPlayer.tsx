"use client";

import { useEffect, useState } from "react";
import { Volume2, CheckCircle2 } from "lucide-react";
import { playAudioFile, playListeningScript, type PlaybackHandle } from "@/lib/audio/player";
import type { ListeningLine } from "@/lib/types/content";

/** Mount with a fresh `key` per segment (see ListeningPart) so effects reset cleanly. */
export function AudioPlayer({
  audioAssetPath,
  audioScript,
  alreadyPlayed,
  onPlaybackEnd,
}: {
  audioAssetPath: string;
  audioScript: ListeningLine[];
  alreadyPlayed: boolean;
  onPlaybackEnd: () => void;
}) {
  const [status, setStatus] = useState<"playing" | "done">(alreadyPlayed ? "done" : "playing");

  useEffect(() => {
    if (alreadyPlayed) return;
    let cancelled = false;
    const finish = () => {
      if (cancelled) return;
      setStatus("done");
      onPlaybackEnd();
    };

    // Try the real pre-rendered recording first (see scripts/generate-listening-audio.ts);
    // fall back to the browser's voice synthesis if it hasn't been generated yet.
    let activeHandle: PlaybackHandle = playAudioFile(audioAssetPath, finish, () => {
      if (cancelled) return;
      activeHandle = playListeningScript(audioScript, finish);
    });

    return () => {
      cancelled = true;
      activeHandle.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4">
      {status === "playing" ? (
        <>
          <Volume2 className="h-5 w-5 shrink-0 animate-pulse text-primary" />
          <div>
            <p className="text-sm font-medium">Reproduciendo audio...</p>
            <p className="text-xs text-muted-foreground">Escucha con atención — el audio se reproduce una sola vez.</p>
          </div>
        </>
      ) : (
        <>
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-medium">Audio reproducido</p>
            <p className="text-xs text-muted-foreground">Ya no se puede repetir en este intento.</p>
          </div>
        </>
      )}
    </div>
  );
}
