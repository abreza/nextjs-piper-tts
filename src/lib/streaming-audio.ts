export class StreamingAudioManager {
  private audioQueue: HTMLAudioElement[] = [];
  private currentAudioIndex = 0;
  private isPlaying = false;
  private onEndedCallback?: () => void;
  private abortController?: AbortController;

  constructor() {
    this.audioQueue = [];
  }

  addAudioChunk(audioBlob: Blob) {
    const audio = new Audio();
    audio.src = URL.createObjectURL(audioBlob);

    audio.onended = () => {
      URL.revokeObjectURL(audio.src);
      this.playNext();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audio.src);
      console.error("Audio playback error");
      this.playNext();
    };

    this.audioQueue.push(audio);

    if (!this.isPlaying && this.audioQueue.length === 1) {
      this.playNext();
    }
  }

  private async playNext() {
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
    } catch (error) {
      console.error("Failed to play audio chunk:", error);
      this.playNext();
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
      URL.revokeObjectURL(audio.src);
    });
    this.audioQueue = [];
    this.currentAudioIndex = 0;
    this.isPlaying = false;
  }

  setAbortController(controller: AbortController) {
    this.abortController = controller;
  }
}
