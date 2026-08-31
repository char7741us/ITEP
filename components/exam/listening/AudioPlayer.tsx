"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, CheckCircle2, Play } from "lucide-react";
import { playAudioFile, playListeningScript, type PlaybackHandle } from "@/lib/audio/player";
import type { ListeningLine } from "@/lib/types/content";
import { Button } from "@/components/ui/button";

/** Mount with a fresh `key` per segment (see ListeningPart) so state resets cleanly. */
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
  const [status, setStatus] = useState<"idle" | "playing" | "done">(alreadyPlayed ? "done" : "idle");
  const handleRef = useRef<PlaybackHandle | null>(null);
  const cancelledRef = useRef(false);

  // Single playback enforced here: once started this segment can't be replayed
  // (matches the real exam), and unmounting mid-playback (section auto-submit,
  // navigating away) always stops it cleanly.
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      handleRef.current?.cancel();
    };
  }, []);

  function handlePlay() {
    if (status !== "idle") return;
    setStatus("playing");
    cancelledRef.current = false;
    const finish = () => {
      if (cancelledRef.current) return;
      setStatus("done");
      onPlaybackEnd();
    };

    // Try the real pre-rendered recording first (see scripts/generate-listening-audio.ts);
    // fall back to the browser's voice synthesis if it hasn't been generated yet.
    handleRef.current = playAudioFile(audioAssetPath, finish, () => {
      if (cancelledRef.current) return;
      handleRef.current = playListeningScript(audioScript, finish);
    });
  }

  if (status === "idle") {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4">
        <Button onClick={handlePlay} size="sm" className="gap-2">
          <Play className="h-4 w-4" />
          Reproducir audio
        </Button>
        <p className="text-xs text-muted-foreground">Se reproduce una sola vez — escucha cuando estés listo.</p>
      </div>
    );
  }

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
