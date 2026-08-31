"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Circle } from "lucide-react";
import { startRecording, type RecordingHandle } from "@/lib/audio/recorder";

export function RecorderControls({ onRecorded }: { onRecorded: (blob: Blob) => void }) {
  const [status, setStatus] = useState<"starting" | "recording" | "error">("starting");
  const handleRef = useRef<RecordingHandle | null>(null);

  useEffect(() => {
    let stopped = false;
    startRecording()
      .then((handle) => {
        if (stopped) {
          handle.cancel();
          return;
        }
        handleRef.current = handle;
        setStatus("recording");
      })
      .catch(() => setStatus("error"));

    return () => {
      stopped = true;
      const handle = handleRef.current;
      if (handle) {
        handle.stop().then(onRecorded);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "error") {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6">
        <div className="flex items-center gap-3">
          <MicOff className="h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">No se pudo acceder al micrófono</p>
            <p className="text-xs text-muted-foreground">
              Revisa los permisos del navegador y recarga la página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10 p-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 transition-all duration-300 ${
              status === "recording" ? "animate-pulse bg-destructive/20" : ""
            }`}
          >
            {status === "recording" ? (
              <Mic className="h-5 w-5 text-destructive" />
            ) : (
              <MicOff className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          {status === "recording" && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <Circle className="relative inline-flex h-3 w-3 fill-destructive text-destructive" />
            </span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {status === "recording" ? "Grabando..." : "Preparando micrófono..."}
          </p>
          <p className="text-xs text-muted-foreground">
            Habla con claridad. La grabación se detiene automáticamente.
          </p>
        </div>
      </div>

      {status === "recording" && (
        <div className="mt-4 flex items-center justify-center gap-1">
          {[12, 20, 8, 16, 10, 22, 14].map((height, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-destructive/60"
              style={{
                height: `${height}px`,
                animation: `pulse 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { height: 8px; }
          100% { height: 24px; }
        }
      `}</style>
    </div>
  );
}
