import { VOICE_INFO, PersianVoiceId } from "../types/voice";

export function getModelDisplayName(modelId: string): string {
  if (modelId in VOICE_INFO) {
    return VOICE_INFO[modelId as PersianVoiceId].name;
  }
  return modelId;
}

export function getModelDescription(modelId: string): string {
  if (modelId in VOICE_INFO) {
    return VOICE_INFO[modelId as PersianVoiceId].description;
  }
  return "مدل نامشخص";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 بایت";

  const k = 1024;
  const sizes = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
