"use client";

import { useCallback, useState } from "react";
import { WordCard } from "./word-card";

/** Regex to tokenize French text preserving words with accents, apostrophes, hyphens */
const WORD_RE = /([a-zA-ZÀ-ÿœŒæÆçÇ](?:[a-zA-ZÀ-ÿœŒæÆçÇ'-]*[a-zA-ZÀ-ÿœŒæÆçÇ])?)/g;

export interface WordSaveContext {
  sourceType?: string;
  testSetId?: string;
  testSetName?: string;
  questionId?: string;
  questionNumber?: number;
}

interface FrenchTextProps {
  text: string;
  /** Disable vocabulary cards (e.g., exam mode) — renders plain text */
  disabled?: boolean;
  className?: string;
  /** Context for saving words (source test, question, etc.) */
  saveContext?: WordSaveContext;
}

/** Extract the sentence containing a word from text */
function extractSentence(text: string, word: string): string | undefined {
  const sentences = text.split(/(?<=[.!?…])\s+/);
  const lower = word.toLowerCase();
  const found = sentences.find((s) => s.toLowerCase().includes(lower));
  return found?.trim();
}

/**
 * Wraps French text, making each word clickable for vocabulary lookup.
 * Skips single-letter tokens (l', d', n', etc.).
 */
export function FrenchText({ text, disabled, className, saveContext }: FrenchTextProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<string | undefined>(undefined);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleWordClick = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>, word: string) => {
      if (disabled) return;
      e.stopPropagation();
      // Strip leading/trailing apostrophes/hyphens
      const cleaned = word.replace(/^['-]+|['-]+$/g, "");
      if (cleaned.length <= 1) return;
      setSelectedWord(cleaned);
      setSelectedSentence(extractSentence(text, cleaned));
      setAnchorEl(e.currentTarget);
    },
    [disabled, text],
  );

  const handleClose = useCallback(() => {
    setSelectedWord(null);
    setSelectedSentence(undefined);
    setAnchorEl(null);
  }, []);

  if (disabled) {
    return <span className={className}>{text}</span>;
  }

  // Split text into tokens (words and non-words)
  const parts: { text: string; isWord: boolean }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const re = new RegExp(WORD_RE.source, WORD_RE.flags);
  while ((match = re.exec(text)) !== null) {
    const matchStart = match.index;
    if (matchStart > lastIndex) {
      parts.push({ text: text.slice(lastIndex, matchStart), isWord: false });
    }
    parts.push({ text: match[0], isWord: true });
    lastIndex = matchStart + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isWord: false });
  }

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.isWord && part.text.replace(/^['-]+|['-]+$/g, "").length > 1 ? (
          <span
            key={i}
            className="cursor-pointer rounded-sm transition-colors hover:bg-blue-100/70 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
            onClick={(e) => handleWordClick(e, part.text)}
          >
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
      {selectedWord && anchorEl && (
        <WordCard
          word={selectedWord}
          anchorEl={anchorEl}
          onClose={handleClose}
          saveContext={saveContext}
          sentence={selectedSentence}
        />
      )}
    </span>
  );
}
