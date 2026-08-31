"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export function NoteScratchpad() {
  const [value, setValue] = useState("");
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">Notas (no se califican, solo para ti)</p>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Toma notas mientras escuchas..."
        className="h-28 resize-none"
      />
    </div>
  );
}
