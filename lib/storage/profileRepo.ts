"use client";

import { useSyncExternalStore } from "react";
import type { UserProfile } from "@/lib/types/profile";

const PROFILES_KEY = "itep-simulator:profiles";
const ACTIVE_KEY = "itep-simulator:active-profile";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Cached so repeated reads between writes return the same reference — required
// for useSyncExternalStore to avoid re-rendering on every call.
let cachedProfiles: UserProfile[] | null = null;

function readProfiles(): UserProfile[] {
  if (cachedProfiles) return cachedProfiles;
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PROFILES_KEY);
    cachedProfiles = raw ? (JSON.parse(raw) as UserProfile[]) : [];
  } catch {
    cachedProfiles = [];
  }
  return cachedProfiles;
}

function writeProfiles(profiles: UserProfile[]) {
  cachedProfiles = profiles;
  window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  emit();
}

export function slugifyUsername(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 30);
  return slug || "estudiante";
}

export function getProfiles(): UserProfile[] {
  return readProfiles();
}

export function getActiveUsername(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}

export function getActiveProfile(): UserProfile | null {
  const username = getActiveUsername();
  if (!username) return null;
  return readProfiles().find((p) => p.username === username) ?? null;
}

/** Creates a new profile or renames an existing one with the same username, then makes it active. */
export function saveProfile(name: string, usernameInput: string): UserProfile {
  const username = slugifyUsername(usernameInput);
  const trimmedName = name.trim() || username;
  const profiles = readProfiles();
  const index = profiles.findIndex((p) => p.username === username);
  const profile: UserProfile = {
    username,
    name: trimmedName,
    createdAt: index >= 0 ? profiles[index].createdAt : new Date().toISOString(),
  };
  const next = index >= 0 ? profiles.map((p, i) => (i === index ? profile : p)) : [...profiles, profile];
  writeProfiles(next);
  window.localStorage.setItem(ACTIVE_KEY, username);
  emit();
  return profile;
}

export function setActiveUsername(username: string): void {
  window.localStorage.setItem(ACTIVE_KEY, username);
  emit();
}

export function deleteProfile(username: string): void {
  writeProfiles(readProfiles().filter((p) => p.username !== username));
  if (getActiveUsername() === username) {
    window.localStorage.removeItem(ACTIVE_KEY);
    emit();
  }
}

/** Hydration-safe: server snapshot is always `null`, matching the SSR pass. */
export function useActiveProfile(): UserProfile | null {
  return useSyncExternalStore(subscribe, getActiveProfile, () => null);
}

export function useProfiles(): UserProfile[] {
  return useSyncExternalStore(subscribe, getProfiles, () => []);
}
