/* eslint-disable @typescript-eslint/no-explicit-any */
import { TtsSession, VoiceId, PATH_MAP } from "@mintplex-labs/piper-tts-web";
import { initializePatches } from "./monkey-patch";

initializePatches();

export type PersianVoiceId =
  | "fa_IR-amir-medium"
  | "fa_IR-gyro-medium"
  | "fa_IR-ganji-medium"
  | "fa_IR-ganji_adabi-medium"
  | "fa_IR-reza_ibrahim-medium";

Object.assign(PATH_MAP, {
  "fa_IR-amir-medium": "fa/fa_IR/amir/medium/fa_IR-amir-medium.onnx",
  "fa_IR-gyro-medium": "fa/fa_IR/gyro/medium/fa_IR-gyro-medium.onnx",
  "fa_IR-ganji-medium": "fa/fa_IR/ganji/medium/fa_IR-ganji-medium.onnx",
  "fa_IR-ganji_adabi-medium":
    "fa/fa_IR/ganji_adabi/medium/fa_IR-ganji_adabi-medium.onnx",
  "fa_IR-reza_ibrahim-medium":
    "fa/fa_IR/reza_ibrahim/medium/fa_IR-reza_ibrahim-medium.onnx",
});

const sessions: Record<string, TtsSession> = {};

export async function getPersianTTS(voiceId: PersianVoiceId) {
  if (sessions[voiceId]) {
    return sessions[voiceId];
  }

  TtsSession._instance = null;

  try {
    sessions[voiceId] = await TtsSession.create({
      voiceId: voiceId as VoiceId,
      progress: (progress) => {
        console.log(
          `Downloading ${progress.url} - ${Math.round(
            (progress.loaded * 100) / progress.total
          )}%`
        );
      },
      logger: (text) => console.log(`TTS: ${text}`),
      wasmPaths: {
        onnxWasm: "/ort/",
        piperData: "/piper/piper_phonemize.data",
        piperWasm: "/piper/piper_phonemize.wasm",
      },
    });

    console.log(`Successfully created TTS session for ${voiceId}`);
    return sessions[voiceId];
  } catch (error) {
    console.error(`Failed to initialize Persian TTS for ${voiceId}:`, error);
    throw error;
  }
}
