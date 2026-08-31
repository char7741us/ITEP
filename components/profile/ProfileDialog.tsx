"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import { saveProfile, setActiveUsername, slugifyUsername, useProfiles } from "@/lib/storage/profileRepo";
import type { UserProfile } from "@/lib/types/profile";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function ProfileDialog({
  open,
  onOpenChange,
  activeProfile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeProfile: UserProfile | null;
}) {
  const profiles = useProfiles();
  const [name, setName] = useState(activeProfile?.name ?? "");
  const [username, setUsername] = useState(activeProfile?.username ?? "");
  const [usernameTouched, setUsernameTouched] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!usernameTouched) setUsername(slugifyUsername(value));
  }

  function handleSave() {
    if (!name.trim()) return;
    saveProfile(name, username || name);
    onOpenChange(false);
  }

  function handleSwitch(profile: UserProfile) {
    setActiveUsername(profile.username);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{activeProfile ? "Tu perfil" : "¿Cómo te llamas?"}</DialogTitle>
          <DialogDescription>
            Tu nombre y usuario se guardan solo en este navegador, para saludarte y llevar tu progreso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Nombre</Label>
            <Input
              id="profile-name"
              placeholder="Ej. María José"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-username">Usuario</Label>
            <Input
              id="profile-username"
              placeholder="ej. maria-jose"
              value={username}
              onChange={(e) => {
                setUsernameTouched(true);
                setUsername(slugifyUsername(e.target.value));
              }}
            />
            <p className="text-xs text-muted-foreground">Se usa para diferenciar tu progreso si comparten esta computadora.</p>
          </div>

          {profiles.length > 0 && (
            <div className="space-y-1.5 border-t pt-3">
              <p className="text-xs font-medium text-muted-foreground">O cambia a un perfil existente</p>
              <div className="flex flex-wrap gap-2">
                {profiles.map((profile) => (
                  <button
                    key={profile.username}
                    type="button"
                    onClick={() => handleSwitch(profile)}
                    className="flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    <Avatar size="sm">
                      <AvatarFallback>
                        <UserRound className="h-3.5 w-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    {profile.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {activeProfile ? "Guardar cambios" : "Empezar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { initialsFor };
