"use client";
import { useCallback, useRef } from "react";
import { getPersianTTS, PersianVoiceId } from "../lib/piper";
import { StreamingAudioManager } from "../lib/streaming-audio";
import { chunkTextByPhrases } from "../lib/text-chunker";

export interface SpeechOptions {
  streaming?: boolean;
  chunkDelay?: number;
  noiseScale?: number;
  lengthScale?: number;
  noiseWidth?: number;
  sentencePause?: number;
  maxChunkLength?: number;
  enablePhrasePausing?: boolean;
}

export function useSpeech() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioManagerRef = useRef<StreamingAudioManager | null>(null);

  const speak = useCallback(
    async (
      text: string,
      voiceId: PersianVoiceId,
      onDownloadProgress?: (progress: string) => void,
      onProcessingProgress?: (
        progress: string,
        current: number,
        total: number
      ) => void,
      options: SpeechOptions = {}
    ) => {
      const {
        streaming = true,
        chunkDelay = 100,
        noiseScale = 0.667,
        lengthScale = 1.0,
        noiseWidth = 0.8,
        sentencePause = 300,
        maxChunkLength = 80,
        enablePhrasePausing = true,
      } = options;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      try {
        const tts = await getPersianTTS(voiceId, onDownloadProgress);

        if (!streaming) {
          const wav = await tts.predict(text.trim(), {
            noise_scale: noiseScale,
            length_scale: lengthScale,
            noise_width: noiseWidth,
          });
          if (signal.aborted) return;

          const audio = new Audio();
          audio.src = URL.createObjectURL(wav);
          audio.onended = () => URL.revokeObjectURL(audio.src);
          audio.onerror = () => URL.revokeObjectURL(audio.src);
          await audio.play();
        } else {
          audioManagerRef.current = new StreamingAudioManager({
            sentencePause,
          });
          audioManagerRef.current.setAbortController(
            abortControllerRef.current
          );

          const chunks = Array.from(
            chunkTextByPhrases(text, {
              maxChunkLength,
              enablePhrasePausing,
            })
          );
          const totalChunks = chunks.length;

          for (const chunk of chunks) {
            if (signal.aborted) break;

            if (onProcessingProgress) {
              onProcessingProgress(
                `پردازش بخش ${chunk.index + 1} از ${totalChunks}...`,
                chunk.index + 1,
                totalChunks
              );
            }

            try {
              const wav = await tts.predict(chunk.text, {
                noise_scale: noiseScale,
                length_scale: lengthScale,
                noise_width: noiseWidth,
              });
              if (signal.aborted) break;

              audioManagerRef.current.addAudioChunk(wav, chunk.isLast);

              if (!chunk.isLast && chunkDelay > 0) {
                await new Promise((resolve) => setTimeout(resolve, chunkDelay));
              }
            } catch (error) {
              console.error(`Failed to process chunk ${chunk.index}:`, error);
            }
          }

          await new Promise<void>((resolve) => {
            audioManagerRef.current?.onEnded(() => {
              resolve();
            });
          });
        }
      } catch (error) {
        console.error("Failed to synthesize speech:", error);
        throw new Error("خطا در تولید صدا. لطفاً دوباره تلاش کنید.");
      } finally {
        abortControllerRef.current = null;
        audioManagerRef.current = null;
      }
    },
    []
  );

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    audioManagerRef.current?.stop();
  }, []);

  return { speak, stop };
}
