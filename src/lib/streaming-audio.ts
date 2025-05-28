export interface StreamingAudioOptions {
  sentencePause?: number;
}

export class StreamingAudioManager {
  private audioQueue: HTMLAudioElement[] = [];
  private currentAudioIndex = 0;
  private isPlaying = false;
  private onEndedCallback?: () => void;
  private abortController?: AbortController;
  private sentencePause: number;

  constructor(options: StreamingAudioOptions = {}) {
    this.audioQueue = [];
    this.sentencePause = options.sentencePause ?? 300;
  }

  addAudioChunk(audioBlob: Blob, isLastChunk: boolean = false) {
    const audio = new Audio();
    audio.src = URL.createObjectURL(audioBlob);

    audio.onended = () => {
      URL.revokeObjectURL(audio.src);
      this.playNext(isLastChunk);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audio.src);
      console.error("Audio playback error");
      this.playNext(isLastChunk);
    };

    this.audioQueue.push(audio);

    if (!this.isPlaying && this.audioQueue.length === 1) {
      this.playNext(isLastChunk);
    }
  }

  private async playNext(wasLastChunk: boolean = false) {
    if (this.abortController?.signal.aborted) {
      this.cleanup();
      return;
    }

    if (this.currentAudioIndex >= this.audioQueue.length) {
      this.isPlaying = false;
      this.onEndedCallback?.();
      return;
    }

    this.isPlaying = true;
    const audio = this.audioQueue[this.currentAudioIndex];
    this.currentAudioIndex++;

    try {
      await audio.play();

      if (
        !wasLastChunk &&
        this.sentencePause > 0 &&
        this.currentAudioIndex < this.audioQueue.length
      ) {
        await new Promise((resolve) => {
          const timeout = setTimeout(resolve, this.sentencePause);

          if (this.abortController?.signal.aborted) {
            clearTimeout(timeout);
            resolve(undefined);
          }
        });
      }
    } catch (error) {
      console.error("Failed to play audio chunk:", error);
      this.playNext(wasLastChunk);
    }
  }

  onEnded(callback: () => void) {
    this.onEndedCallback = callback;
  }

  stop() {
    this.abortController?.abort();
    this.cleanup();
  }

  private cleanup() {
    this.audioQueue.forEach((audio) => {
      audio.pause();
      audio.src = "";
      if (audio.src) {
        URL.revokeObjectURL(audio.src);
      }
    });
    this.audioQueue = [];
    this.currentAudioIndex = 0;
    this.isPlaying = false;
  }

  setAbortController(controller: AbortController) {
    this.abortController = controller;
  }

  setSentencePause(pause: number) {
    this.sentencePause = pause;
  }
}
