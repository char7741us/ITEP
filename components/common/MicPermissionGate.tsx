"use client";

import { useState } from "react";
import { CheckCircle2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestMicPermission, isMediaRecordingSupported } from "@/lib/audio/micPermission";

type Status = "idle" | "checking" | "granted" | "denied" | "unsupported";

export function MicPermissionGate({ onGranted }: { onGranted: () => void }) {
  const [status, setStatus] = useState<Status>(() => (isMediaRecordingSupported() ? "idle" : "unsupported"));

  async function handleCheck() {
    setStatus("checking");
    const granted = await requestMicPermission();
    setStatus(granted ? "granted" : "denied");
    if (granted) onGranted();
  }

  if (status === "unsupported") {
    return (
      <p className="text-sm text-destructive">
        Este navegador no soporta grabación de audio (MediaRecorder). La sección de Speaking no va a funcionar aquí —
        prueba con una versión reciente de Chrome, Safari o Edge.
      </p>
    );
  }

  if (status === "granted") {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-4 w-4 shrink-0" /> Micrófono habilitado — listo para Speaking
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" size="sm" onClick={handleCheck} disabled={status === "checking"} className="gap-2">
        <Mic className="h-4 w-4" />
        {status === "checking" ? "Solicitando permiso..." : "Habilitar micrófono"}
      </Button>
      {status === "denied" && (
        <p className="text-xs text-destructive">
          No se concedió el permiso. Revisa el ícono de candado/cámara en la barra de direcciones de tu navegador y
          permite el micrófono para este sitio, luego intenta de nuevo — lo necesitarás en la sección de Speaking.
        </p>
      )}
    </div>
  );
}
