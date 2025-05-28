export interface TextChunk {
  text: string;
  index: number;
  isLast: boolean;
}

export interface ChunkingOptions {
  chunkSize?: number;
  delimiter?: RegExp;
  maxChunkLength?: number;
  enablePhrasePausing?: boolean;
}

export function* chunkText(
  text: string,
  options: ChunkingOptions = {}
): Generator<TextChunk> {
  const { chunkSize = 100, delimiter = /[.!?؟]\s+/g } = options;

  const sentences = text.split(delimiter).filter((s) => s.trim());

  if (sentences.length === 0) {
    yield { text: text.trim(), index: 0, isLast: true };
    return;
  }

  let currentChunk = "";
  let chunkIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    const punctuation = text.match(delimiter)?.[i] || ". ";
    const fullSentence = sentence + punctuation.trim();

    if (currentChunk.length + fullSentence.length > chunkSize && currentChunk) {
      yield {
        text: currentChunk.trim(),
        index: chunkIndex++,
        isLast: false,
      };
      currentChunk = fullSentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + fullSentence;
    }
  }

  if (currentChunk) {
    yield {
      text: currentChunk.trim(),
      index: chunkIndex,
      isLast: true,
    };
  }
}

export function* chunkTextByPhrases(
  text: string,
  options: ChunkingOptions = {}
): Generator<TextChunk> {
  const { maxChunkLength = 80, enablePhrasePausing = true } = options;

  let phraseDelimiters: RegExp;

  if (enablePhrasePausing) {
    phraseDelimiters = /[.!?؟،,;:]\s+|[\n\r]+/g;
  } else {
    phraseDelimiters = /[.!?؟]\s+|[\n\r]+/g;
  }

  const phrases = text.split(phraseDelimiters).filter((p) => p.trim());

  if (phrases.length === 0) {
    yield { text: text.trim(), index: 0, isLast: true };
    return;
  }

  let currentChunk = "";
  let chunkIndex = 0;

  for (let i = 0; i < phrases.length; i++) {
    const phrase = phrases[i].trim();

    if (phrase.length > maxChunkLength) {
      if (currentChunk) {
        yield {
          text: currentChunk.trim(),
          index: chunkIndex++,
          isLast: false,
        };
        currentChunk = "";
      }

      const longPhraseChunks = splitLongPhrase(phrase, maxChunkLength);
      for (let j = 0; j < longPhraseChunks.length; j++) {
        const isLastOfLongPhrase = j === longPhraseChunks.length - 1;
        const isLastOverall = i === phrases.length - 1 && isLastOfLongPhrase;

        yield {
          text: longPhraseChunks[j],
          index: chunkIndex++,
          isLast: isLastOverall,
        };
      }
      continue;
    }

    if (currentChunk.length + phrase.length > maxChunkLength && currentChunk) {
      yield {
        text: currentChunk.trim(),
        index: chunkIndex++,
        isLast: false,
      };
      currentChunk = phrase;
    } else {
      currentChunk += (currentChunk ? " " : "") + phrase;
    }
  }

  if (currentChunk) {
    yield {
      text: currentChunk.trim(),
      index: chunkIndex,
      isLast: true,
    };
  }
}

function splitLongPhrase(phrase: string, maxLength: number): string[] {
  const words = phrase.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const word of words) {
    if (word.length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }

      for (let i = 0; i < word.length; i += maxLength) {
        chunks.push(word.slice(i, i + maxLength));
      }
    } else if (currentChunk.length + word.length + 1 > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = word;
    } else {
      currentChunk += (currentChunk ? " " : "") + word;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
