"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useActiveProfile } from "@/lib/storage/profileRepo";
import { ProfileDialog, initialsFor } from "./ProfileDialog";

export function ProfileControl() {
  const profile = useActiveProfile();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="gap-2 px-2">
        {profile ? (
          <>
            <Avatar size="sm">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {initialsFor(profile.name)}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[10ch] truncate text-sm font-medium">{profile.name}</span>
          </>
        ) : (
          <>
            <UserRound className="h-4 w-4" />
            <span className="text-sm">Tu nombre</span>
          </>
        )}
      </Button>
      <ProfileDialog open={open} onOpenChange={setOpen} activeProfile={profile} />
    </>
  );
}
