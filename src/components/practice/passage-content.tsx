"use client";

import { useCallback, useState, Children, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { WordCard } from "./word-card";
import type { WordSaveContext } from "./french-text";

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

/** Extract the sentence containing a word from text */
function extractSentence(text: string, word: string): string | undefined {
  const sentences = text.split(/(?<=[.!?…])\s+/);
  const lower = word.toLowerCase();
  const found = sentences.find((s) => s.toLowerCase().includes(lower));
  return found?.trim();
}

interface PassageContentProps {
  text: string;
  /** Disable vocabulary cards (e.g., exam mode) — renders plain markdown */
  disabled?: boolean;
  className?: string;
  /** Context for saving words */
  saveContext?: WordSaveContext;
  /** Sentence-level translations for context-aware word card matching */
  sentenceTranslations?: { fr: string; zh?: string; en?: string; native?: string }[];
}

/**
 * Renders passage text with markdown support + clickable French word lookup.
 * Plain text (no markdown) renders identically to the old whitespace-pre-line approach
 * thanks to remark-breaks (single \n → <br>).
 */
export function PassageContent({ text, disabled, className, saveContext, sentenceTranslations }: PassageContentProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<string | undefined>(undefined);
  const [selectedSentenceTranslation, setSelectedSentenceTranslation] = useState<string | undefined>(undefined);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleWordClick = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>, word: string) => {
      if (disabled) return;
      e.stopPropagation();
      const cleaned = word.replace(/^['-]+|['-]+$/g, "");
      if (cleaned.length <= 1 && !/^\d$/.test(cleaned)) return;
      const lookup = /^\d+$/.test(cleaned) ? numberToFrench(parseInt(cleaned, 10)) ?? cleaned : cleaned;
      const sentence = extractSentence(text, cleaned);
      setSelectedWord(lookup);
      setSelectedSentence(sentence);
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

  /** Tokenize a plain string into clickable word spans */
  const tokenize = useCallback(
    (str: string): ReactNode => {
      const normalized = str.normalize("NFC");
      const parts: ReactNode[] = [];
      let lastIndex = 0;
      let key = 0;
      const re = new RegExp(WORD_RE.source, WORD_RE.flags);
      let match: RegExpExecArray | null;
      while ((match = re.exec(normalized)) !== null) {
        if (match.index > lastIndex) {
          parts.push(normalized.slice(lastIndex, match.index));
        }
        const word = match[0];
        const cleaned = word.replace(/^['-]+|['-]+$/g, "");
        if (cleaned.length > 1 || /^\d+$/.test(word)) {
          parts.push(
            <span
              key={key++}
              className="cursor-pointer rounded-sm transition-colors hover:bg-blue-100/70 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
              onClick={(e) => handleWordClick(e, word)}
            >
              {word}
            </span>,
          );
        } else {
          parts.push(word);
        }
        lastIndex = match.index + word.length;
      }
      if (lastIndex < normalized.length) {
        parts.push(normalized.slice(lastIndex));
      }
      return <>{parts}</>;
    },
    [handleWordClick],
  );

  /** Replace string leaves in React children with tokenized word spans */
  const processChildren = useCallback(
    (children: ReactNode): ReactNode => {
      return Children.map(children, (child) => {
        if (typeof child === "string") {
          return tokenize(child);
        }
        return child;
      });
    },
    [tokenize],
  );

  const remarkPlugins = [remarkGfm, remarkBreaks];

  if (disabled) {
    return (
      <div className={className}>
        <ReactMarkdown remarkPlugins={remarkPlugins}>{text}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{processChildren(children)}</p>,
          strong: ({ children }) => <strong className="font-semibold">{processChildren(children)}</strong>,
          em: ({ children }) => <em>{processChildren(children)}</em>,
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{processChildren(children)}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mb-1">{processChildren(children)}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold mb-1">{processChildren(children)}</h3>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
          li: ({ children }) => <li className="mb-0.5">{processChildren(children)}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-muted-foreground/30 pl-3 italic mb-2">{children}</blockquote>
          ),
          hr: () => <hr className="my-3 border-muted" />,
          table: ({ children }) => (
            <table className="my-2 w-full border-collapse border border-border text-sm">{children}</table>
          ),
          th: ({ children }) => (
            <th className="border border-border px-2 py-1.5 text-left font-semibold bg-muted/50">
              {processChildren(children)}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-2 py-1.5">{processChildren(children)}</td>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
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
    </div>
  );
}
