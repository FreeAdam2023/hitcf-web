"use client";

import { useCallback, useState } from "react";
import { WordCard } from "./word-card";

/** Regex to tokenize French text preserving words with accents, apostrophes, hyphens, and numbers */
const WORD_RE = /([a-zA-ZÀ-ÿœŒæÆçÇ](?:[a-zA-ZÀ-ÿœŒæÆçÇ'-]*[a-zA-ZÀ-ÿœŒæÆçÇ])?|\d+)/g;

/** Convert a number (0–999999) to its French word form */
function numberToFrench(n: number): string | null {
  if (n < 0 || n > 999999 || !Number.isInteger(n)) return null;
  const ones = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
    "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize"];
  if (n === 0) return "zéro";
  if (n <= 16) return ones[n];
  if (n <= 19) return "dix-" + ones[n - 10];
  if (n <= 69) {
    const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"];
    const t = Math.floor(n / 10), r = n % 10;
    if (r === 0) return tens[t];
    if (r === 1) return tens[t] + " et un";
    return tens[t] + "-" + ones[r];
  }
  if (n <= 79) {
    const r = n - 60;
    if (r === 0) return "soixante";
    return "soixante-" + (r === 11 ? "et-onze" : numberToFrench(r));
  }
  if (n <= 99) {
    if (n === 80) return "quatre-vingts";
    return "quatre-vingt-" + numberToFrench(n - 80);
  }
  if (n <= 999) {
    const h = Math.floor(n / 100), r = n % 100;
    const prefix = h === 1 ? "cent" : ones[h] + " cent";
    if (r === 0) return h === 1 ? "cent" : prefix + "s";
    return prefix + " " + numberToFrench(r);
  }
  const th = Math.floor(n / 1000), r = n % 1000;
  const prefix = th === 1 ? "mille" : numberToFrench(th) + " mille";
  if (r === 0) return prefix;
  return prefix + " " + numberToFrench(r);
}

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
  /** Sentence-level translations for context-aware word card matching */
  sentenceTranslations?: { fr: string; zh?: string; en?: string; native?: string }[];
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
export function FrenchText({ text, disabled, className, saveContext, sentenceTranslations }: FrenchTextProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<string | undefined>(undefined);
  const [selectedSentenceTranslation, setSelectedSentenceTranslation] = useState<string | undefined>(undefined);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleWordClick = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>, word: string) => {
      if (disabled) return;
      e.stopPropagation();
      // Strip leading/trailing apostrophes/hyphens
      const cleaned = word.replace(/^['-]+|['-]+$/g, "");
      if (cleaned.length <= 1 && !/^\d$/.test(cleaned)) return;
      // Convert digits to French number word
      const lookup = /^\d+$/.test(cleaned) ? numberToFrench(parseInt(cleaned, 10)) ?? cleaned : cleaned;
      const sentence = extractSentence(text, cleaned);
      setSelectedWord(lookup);
      setSelectedSentence(sentence);
      // Find translation for the sentence containing this word
      if (sentenceTranslations && sentence) {
        const lowerSentence = sentence.toLowerCase();
        const match = sentenceTranslations.find(
          (st) => st.fr && lowerSentence.includes(st.fr.toLowerCase().slice(0, 20)),
        );
        setSelectedSentenceTranslation(match?.native || match?.zh || match?.en);
      } else {
        setSelectedSentenceTranslation(undefined);
      }
      setAnchorEl(e.currentTarget);
    },
    [disabled, text, sentenceTranslations],
  );

  const handleClose = useCallback(() => {
    setSelectedWord(null);
    setSelectedSentence(undefined);
    setSelectedSentenceTranslation(undefined);
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
        part.isWord && (part.text.replace(/^['-]+|['-]+$/g, "").length > 1 || /^\d+$/.test(part.text)) ? (
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
          sentenceTranslation={selectedSentenceTranslation}
        />
      )}
    </span>
  );
}
