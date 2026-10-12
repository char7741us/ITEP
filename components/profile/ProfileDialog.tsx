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
  const [creating, setCreating] = useState(!activeProfile);
  const [error, setError] = useState("");

  function handleNameChange(value: string) {
    setName(value);
    if (creating && !usernameTouched) setUsername(slugifyUsername(value));
  }

  function handleSave() {
    if (!name.trim()) return;
    const target = slugifyUsername(username || name);
    if (creating && profiles.some((profile) => profile.username === target)) { setError("Ese usuario ya tiene un perfil. Selecciónalo abajo o elige otro usuario para no cambiar su nombre."); return; }
    try { saveProfile(name, creating ? target : activeProfile!.username); onOpenChange(false); }
    catch { setError("No se pudo guardar el perfil. Revisa el almacenamiento de este navegador."); }
  }

  function handleSwitch(profile: UserProfile) {
    try { setActiveUsername(profile.username); onOpenChange(false); }
    catch { setError("No se pudo cambiar de perfil. Revisa el almacenamiento del navegador."); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{creating ? "Crea un perfil local" : "Tu perfil local"}</DialogTitle>
          <DialogDescription>
            Tu nombre y usuario se guardan solo en este navegador, para saludarte y llevar tu progreso.
            No es una cuenta con contraseña ni se sincroniza con otros dispositivos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Nombre</Label>
            <Input
              id="profile-name"
              placeholder="Ej. María José"
              value={name}
              maxLength={100}
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
              readOnly={!creating}
              maxLength={30}
              onChange={(e) => {
                setUsernameTouched(true);
                setUsername(slugifyUsername(e.target.value));
              }}
            />
            <p className="text-xs text-muted-foreground">{creating ? "Separa tu progreso del de otros perfiles de esta computadora. No protege el acceso con contraseña." : "Este identificador no cambia para conservar tu progreso. Puedes cambiar tu nombre o crear otro perfil."}</p>
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
          {!creating && <button type="button" onClick={() => { setCreating(true); setName(""); setUsername(""); setUsernameTouched(false); setError(""); }} className="text-sm font-semibold underline">Crear otro perfil</button>}
          {activeProfile && <button type="button" onClick={() => { try { setActiveUsername(null); onOpenChange(false); } catch { setError("No se pudo abrir el perfil Invitado."); } }} className="block text-xs underline">Ver progreso sin perfil (Invitado)</button>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {creating ? "Crear perfil" : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { initialsFor };
