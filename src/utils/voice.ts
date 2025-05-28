import { VOICE_INFO, PersianVoiceId } from "../types/voice";

export const getModelDisplayName = (modelId: string): string => {
  return VOICE_INFO[modelId as PersianVoiceId]?.name || modelId;
};

export const getModelDescription = (modelId: string): string => {
  return VOICE_INFO[modelId as PersianVoiceId]?.description || "مدل صوتی";
};

export const formatFileSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  return `${Math.round(mb)} مگابایت`;
};
