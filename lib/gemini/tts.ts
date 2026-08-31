import { Modality } from "@google/genai";
import { getGeminiClient } from "./provider";
import type { ListeningLine } from "@/lib/types/content";

/** Verify this id is still current before a big authoring run — preview TTS
 * model names shift; see https://ai.google.dev/gemini-api/docs/speech-generation */
export const TTS_MODEL = "gemini-2.5-flash-preview-tts";

/** Prebuilt Gemini voices — first two are used for 2-speaker dialogues, the
 * first alone for single-narrator segments (e.g. the Part 3 lecture). */
const VOICE_POOL = ["Kore", "Puck"];

interface WavOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}

function parseMimeType(mimeType: string): WavOptions {
  const [fileType, ...params] = mimeType.split(";").map((s) => s.trim());
  const [, format] = fileType.split("/");
  const options: Partial<WavOptions> = { numChannels: 1, bitsPerSample: 16, sampleRate: 24000 };
  if (format?.startsWith("L")) {
    const bits = parseInt(format.slice(1), 10);
    if (!isNaN(bits)) options.bitsPerSample = bits;
  }
  for (const param of params) {
    const [key, value] = param.split("=").map((s) => s.trim());
    if (key === "rate") options.sampleRate = parseInt(value, 10);
  }
  return options as WavOptions;
}

function createWavHeader(dataLength: number, options: WavOptions): Buffer {
  const { numChannels, sampleRate, bitsPerSample } = options;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);
  return buffer;
}

/** Gemini's audio TTS output is raw PCM (e.g. "audio/L16;rate=24000"), not a
 * playable file by itself — wrap it in a WAV header so `<audio>` can play it. */
function pcmToWav(base64Data: string, mimeType: string): Buffer {
  const options = parseMimeType(mimeType);
  const pcmBuffer = Buffer.from(base64Data, "base64");
  const header = createWavHeader(pcmBuffer.length, options);
  return Buffer.concat([header, pcmBuffer]);
}

function buildSpeechConfig(speakers: string[]) {
  if (speakers.length <= 1) {
    return { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_POOL[0] } } };
  }
  return {
    multiSpeakerVoiceConfig: {
      speakerVoiceConfigs: speakers.slice(0, 2).map((speaker, i) => ({
        speaker,
        voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_POOL[i] } },
      })),
    },
  };
}

export async function synthesizeListeningAudio(lines: ListeningLine[]): Promise<Buffer> {
  const client = getGeminiClient();
  const speakers = Array.from(new Set(lines.map((l) => l.speaker)));
  if (speakers.length > 2) {
    throw new Error(`Gemini multi-speaker TTS admite máximo 2 hablantes; este segmento tiene ${speakers.length}.`);
  }
  const transcript = lines.map((l) => `${l.speaker}: ${l.text}`).join("\n");

  const response = await client.models.generateContent({
    model: TTS_MODEL,
    contents: [{ role: "user", parts: [{ text: transcript }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: buildSpeechConfig(speakers),
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  const inlineData = part?.inlineData;
  if (!inlineData?.data) {
    throw new Error("Gemini no devolvió audio para este segmento.");
  }
  return pcmToWav(inlineData.data, inlineData.mimeType ?? "audio/L16;rate=24000");
}
