"use client";
import { useCallback } from "react";
import { getPersianTTS, PersianVoiceId } from "../lib/piper";

export function useSpeech() {
  return useCallback(async (text: string, voiceId: PersianVoiceId) => {
    try {
      const tts = await getPersianTTS(voiceId);
      const wav = await tts.predict(text.trim());
      const audio = new Audio();
      audio.src = URL.createObjectURL(wav);

      audio.onended = () => URL.revokeObjectURL(audio.src);
      audio.onerror = () => URL.revokeObjectURL(audio.src);

      await audio.play();
    } catch (error) {
      console.error("Failed to synthesize speech:", error);
      throw new Error("خطا در تولید صدا. لطفاً دوباره تلاش کنید.");
    }
  }, []);
}
