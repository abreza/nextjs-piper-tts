export type PersianVoiceId =
  | "fa_IR-amir-medium"
  | "fa_IR-gyro-medium"
  | "fa_IR-ganji-medium"
  | "fa_IR-ganji_adabi-medium"
  | "fa_IR-reza_ibrahim-medium";

export interface VoiceInfo {
  name: string;
  description: string;
}

export const VOICE_INFO: Record<PersianVoiceId, VoiceInfo> = {
  "fa_IR-amir-medium": { name: "امیر", description: "صدای مردانه متوسط" },
  "fa_IR-gyro-medium": { name: "ژیرو", description: "صدای مردانه متوسط" },
  "fa_IR-ganji-medium": { name: "گنجی", description: "صدای مردانه متوسط" },
  "fa_IR-ganji_adabi-medium": {
    name: "گنجی ادبی",
    description: "صدای مردانه ادبی",
  },
  "fa_IR-reza_ibrahim-medium": {
    name: "رضا ابراهیم",
    description: "صدای مردانه متوسط",
  },
};

export interface TTSSettings {
  isStreaming: boolean;
  chunkDelay: number;

  noiseScale: number;
  lengthScale: number;
  noiseWidth: number;

  sentencePause: number;
  maxChunkLength: number;
  enablePhrasePausing: boolean;
}
