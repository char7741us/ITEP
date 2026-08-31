"use client";

/**
 * Requests mic access once, immediately releasing the stream. Safari (and
 * especially iOS Safari) is strict about tying getUserMedia to a direct user
 * gesture — calling this from an Instructions-screen button click, well
 * before the Speaking section's timer-driven recording phase, means the
 * permission is already resolved by the time RecorderControls needs it, so
 * that later automatic call doesn't need a fresh gesture of its own.
 */
export async function requestMicPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}

export function isMediaRecordingSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined"
  );
}
