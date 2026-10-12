"use client";

export interface RecordingHandle {
  stop: () => Promise<Blob>;
  cancel: () => void;
}

/** Timing starts only after microphone permission succeeds. Cancel/stop clears every timer. */
export async function startTimedRecording(
  seconds: number,
  onElapsed: (seconds: number) => void,
  onLimit: () => void,
): Promise<RecordingHandle> {
  const handle = await startRecording();
  const startedAt = performance.now();
  const ticker = setInterval(() => onElapsed(Math.min(seconds, Math.floor((performance.now() - startedAt) / 1000))), 250);
  const limit = setTimeout(onLimit, seconds * 1000);
  const clear = () => { clearInterval(ticker); clearTimeout(limit); };
  return { stop: () => { clear(); return handle.stop(); }, cancel: () => { clear(); handle.cancel(); } };
}

export async function startRecording(): Promise<RecordingHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  let recorder: MediaRecorder;
  try {
    const mimeType = typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
    recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  } catch (error) {
    stream.getTracks().forEach((track) => track.stop());
    throw error;
  }
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  try {
    recorder.start();
  } catch (error) {
    stream.getTracks().forEach((track) => track.stop());
    throw error;
  }

  function stopTracks() {
    stream.getTracks().forEach((track) => track.stop());
  }

  return {
    stop: () =>
      new Promise((resolve) => {
        recorder.onstop = () => {
          stopTracks();
          resolve(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
        };
        if (recorder.state !== "inactive") recorder.stop();
        else {
          stopTracks();
          resolve(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
        }
      }),
    cancel: () => {
      if (recorder.state !== "inactive") recorder.stop();
      stopTracks();
    },
  };
}
