import { create } from "zustand";

export interface DictationWord {
  word: string;
  display_form?: string | null;
  audio_url?: string | null;
  meaning_zh?: string | null;
  meaning_en?: string | null;
  ipa?: string | null;
}

export type DictationPhase = "listening" | "input" | "feedback" | "complete";

export interface DictationResult {
  word: string;
  display_form?: string | null;
  userInput: string;
  isCorrect: boolean;
}

interface DictationState {
  words: DictationWord[];
  currentIndex: number;
  phase: DictationPhase;
  userInput: string;
  strictMode: boolean;
  results: DictationResult[];

  // Computed
  correctCount: () => number;
  currentWord: () => DictationWord | null;

  // Actions
  init: (words: DictationWord[]) => void;
  setUserInput: (input: string) => void;
  setStrictMode: (strict: boolean) => void;
  submitAnswer: () => boolean;
  nextWord: () => void;
  reset: () => void;
}

function normalizeForComparison(text: string, strict: boolean): string {
  let normalized = text.trim().toLowerCase();
  if (!strict) {
    // Remove diacritics for lenient mode
    normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  return normalized;
}

export const useDictationStore = create<DictationState>((set, get) => ({
  words: [],
  currentIndex: 0,
  phase: "listening",
  userInput: "",
  strictMode: false,
  results: [],

  correctCount: () => get().results.filter((r) => r.isCorrect).length,

  currentWord: () => {
    const { words, currentIndex } = get();
    return currentIndex < words.length ? words[currentIndex] : null;
  },

  init: (words) => set({
    words,
    currentIndex: 0,
    phase: "listening",
    userInput: "",
    results: [],
  }),

  setUserInput: (input) => set({ userInput: input }),

  setStrictMode: (strict) => set({ strictMode: strict }),

  submitAnswer: () => {
    const { words, currentIndex, userInput, strictMode, results } = get();
    const word = words[currentIndex];
    if (!word) return false;

    const isCorrect =
      normalizeForComparison(userInput, strictMode) ===
      normalizeForComparison(word.word, strictMode);

    const result: DictationResult = {
      word: word.word,
      display_form: word.display_form,
      userInput: userInput.trim(),
      isCorrect,
    };

    set({
      results: [...results, result],
      phase: "feedback",
    });

    return isCorrect;
  },

  nextWord: () => {
    const { currentIndex, words } = get();
    if (currentIndex + 1 >= words.length) {
      set({ phase: "complete" });
    } else {
      set({
        currentIndex: currentIndex + 1,
        phase: "listening",
        userInput: "",
      });
    }
  },

  reset: () => {
    const { words } = get();
    set({
      currentIndex: 0,
      phase: "listening",
      userInput: "",
      results: [],
      words: [...words].sort(() => Math.random() - 0.5), // reshuffle
    });
  },
}));
