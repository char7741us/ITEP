"use client";

import type { ListeningLine } from "@/lib/types/content";

export interface PlaybackHandle {
  cancel: () => void;
}

/**
 * Ranked by how natural/professional they sound. Availability varies a lot by
 * OS/browser — Chrome on Windows/Android typically exposes the "Google ..."
 * network voices (very natural); Chrome/Safari on macOS expose Apple's voices,
 * where "Samantha"/"Karen"/"Daniel"/"Moira" sound natural and the rest of the
 * catalog is mostly novelty voices (Bells, Zarvox, Trinoids, etc.) unsuited to
 * exam narration. This is a preference order, not a requirement.
 */
const PREFERRED_VOICE_NAMES = [
  "Google US English",
  "Google UK English Female",
  "Google UK English Male",
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Microsoft Guy Online (Natural) - English (United States)",
  "Microsoft Ryan Online (Natural) - English (United Kingdom)",
  "Samantha",
  "Karen",
  "Daniel",
  "Moira",
  "Tessa",
  "Rishi",
  "Microsoft Zira",
  "Microsoft David",
];

const NOVELTY_VOICE_NAMES = new Set([
  "Albert",
  "Bad News",
  "Bahh",
  "Bells",
  "Boing",
  "Bubbles",
  "Cellos",
  "Good News",
  "Jester",
  "Organ",
  "Superstar",
  "Trinoids",
  "Whisper",
  "Wobble",
  "Zarvox",
  "Fred",
  "Junior",
  "Kathy",
  "Ralph",
  "Grandma",
  "Grandpa",
]);

function voiceRank(voice: SpeechSynthesisVoice): number {
  const preferredIndex = PREFERRED_VOICE_NAMES.indexOf(voice.name);
  if (preferredIndex !== -1) return preferredIndex;
  if (NOVELTY_VOICE_NAMES.has(voice.name)) return 1000;
  // Unlisted-but-plausible voices rank just after the known-good list, network
  // (non-local) voices slightly ahead of on-device ones as a mild tie-breaker.
  return PREFERRED_VOICE_NAMES.length + (voice.localService ? 1 : 0);
}

function getRankedEnglishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
  return voices.sort((a, b) => voiceRank(a) - voiceRank(b));
}

/** Chrome loads the voice list asynchronously; the first call right after page
 * load often returns an empty array. Wait briefly for `voiceschanged` so we
 * don't fall back to the default (usually more robotic) voice unnecessarily. */
function ensureVoicesLoaded(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve();
    if (window.speechSynthesis.getVoices().length > 0) return resolve();
    const timeout = setTimeout(() => resolve(), 300);
    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timeout);
      resolve();
    };
  });
}

function assignVoicesToSpeakers(speakers: string[]): Map<string, SpeechSynthesisVoice | null> {
  const ranked = getRankedEnglishVoices();
  const map = new Map<string, SpeechSynthesisVoice | null>();
  speakers.forEach((speaker, index) => {
    map.set(speaker, ranked.length > 0 ? ranked[index % ranked.length] : null);
  });
  return map;
}

/**
 * Plays a pre-rendered audio file (see scripts/generate-listening-audio.ts).
 * Calls `onError` instead of throwing if the file is missing/unplayable, so
 * the caller can fall back to `playListeningScript`.
 */
export function playAudioFile(src: string, onDone: () => void, onError: () => void): PlaybackHandle {
  const audio = new Audio(src);
  let settled = false;

  const handleEnded = () => {
    if (settled) return;
    settled = true;
    onDone();
  };
  const handleError = () => {
    if (settled) return;
    settled = true;
    onError();
  };

  audio.addEventListener("ended", handleEnded);
  audio.addEventListener("error", handleError);
  audio.play().catch(handleError);

  return {
    cancel: () => {
      settled = true;
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    },
  };
}

/**
 * Plays a listening segment's script via the browser's SpeechSynthesis API.
 * This is the documented fallback path (and, until real pre-rendered TTS audio
 * files exist under /public/audio, the ONLY path) — see the plan's "Audio de
 * Listening" section. Real <audio> playback of pre-rendered files can be added
 * later without changing this function's contract.
 */
export function playListeningScript(lines: ListeningLine[], onDone: () => void): PlaybackHandle {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onDone();
    return { cancel: () => {} };
  }

  const synth = window.speechSynthesis;
  synth.cancel();
  const knownSpeakers = Array.from(new Set(lines.map((l) => l.speaker)));
  let cancelled = false;
  let safetyTimer: ReturnType<typeof setTimeout> | null = null;
  // Chrome has a long-standing bug where an utterance can be garbage-collected
  // before it finishes speaking, silently killing onend/onerror. Keeping a
  // live reference here prevents that.
  let liveUtterance: SpeechSynthesisUtterance | null = null;

  function clearSafetyTimer() {
    if (safetyTimer !== null) {
      clearTimeout(safetyTimer);
      safetyTimer = null;
    }
  }

  function speakNext(index: number, voiceBySpeaker: Map<string, SpeechSynthesisVoice | null>) {
    if (cancelled) return;
    if (index >= lines.length) {
      onDone();
      return;
    }
    const line = lines[index];
    const utterance = new SpeechSynthesisUtterance(line.text);
    liveUtterance = utterance;
    const voice = voiceBySpeaker.get(line.speaker);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.97;
    // Small pitch offset per speaker as a secondary cue — most noticeable when
    // only one real voice is available and voice timbre can't do the work.
    const speakerIndex = knownSpeakers.indexOf(line.speaker);
    utterance.pitch = speakerIndex % 2 === 0 ? 1 : 1.08;

    const advance = () => {
      if (cancelled) return;
      clearSafetyTimer();
      // A brief natural pause between lines — longer on a speaker change so
      // turn-taking doesn't sound rushed, shorter mid-speaker for pacing.
      const nextLine = lines[index + 1];
      const speakerChanges = nextLine && nextLine.speaker !== line.speaker;
      setTimeout(() => speakNext(index + 1, voiceBySpeaker), speakerChanges ? 550 : 250);
    };
    utterance.onend = advance;
    utterance.onerror = advance;
    synth.speak(utterance);

    // Safety net: never let a flaky voice/engine combination hang the exam.
    // Force progress after a generous estimate of this line's speaking time.
    const wordCount = line.text.trim().split(/\s+/).length;
    const estimatedMs = Math.max(2500, wordCount * 450 + 1500);
    safetyTimer = setTimeout(advance, estimatedMs);
  }

  function start() {
    if (cancelled) return;
    speakNext(0, assignVoicesToSpeakers(knownSpeakers));
  }

  if (getRankedEnglishVoices().length > 0) {
    start();
  } else {
    ensureVoicesLoaded().then(start);
  }

  return {
    cancel: () => {
      cancelled = true;
      clearSafetyTimer();
      if (liveUtterance) liveUtterance = null;
      synth.cancel();
    },
  };
}
