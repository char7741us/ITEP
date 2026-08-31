import type { ExamMode } from "@/lib/types/mode";

export interface AppSettings {
  modeDefault: ExamMode;
  activePackId: string;
  hasSeenOnboarding: boolean;
}

const SETTINGS_KEY = "itep-simulator:settings";

const DEFAULT_SETTINGS: AppSettings = {
  modeDefault: "intensive",
  activePackId: "itep-academic-plus@1.0.0",
  hasSeenOnboarding: false,
};

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...partial };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }
  return next;
}
