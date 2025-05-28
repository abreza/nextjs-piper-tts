export interface TextChunk {
  text: string;
  index: number;
  isLast: boolean;
}

export function* chunkText(
  text: string,
  options: {
    chunkSize?: number;
    delimiter?: RegExp;
  } = {}
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

export function* chunkTextByPhrases(text: string): Generator<TextChunk> {
  const phraseDelimiters = /[.!?؟،,;:]\s+|[\n\r]+/g;
  const phrases = text.split(phraseDelimiters).filter((p) => p.trim());

  if (phrases.length === 0) {
    yield { text: text.trim(), index: 0, isLast: true };
    return;
  }

  const maxPhraseLength = 80;
  let currentChunk = "";
  let chunkIndex = 0;

  for (let i = 0; i < phrases.length; i++) {
    const phrase = phrases[i].trim();

    if (currentChunk.length + phrase.length > maxPhraseLength && currentChunk) {
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
