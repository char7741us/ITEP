"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useActiveProfile } from "@/lib/storage/profileRepo";
import { ProfileDialog } from "./ProfileDialog";

export function Greeting() {
  const profile = useActiveProfile();
  const [open, setOpen] = useState(false);

  if (profile) {
    return (
      <p className="text-lg font-medium text-foreground">
        Hola, {profile.name} <span aria-hidden="true">👋</span>
      </p>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Cuéntanos tu nombre para empezar
      </Button>
      <ProfileDialog open={open} onOpenChange={setOpen} activeProfile={null} />
    </>
  );
}
