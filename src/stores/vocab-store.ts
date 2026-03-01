import { create } from "zustand";
import { checkSavedWords, saveWord, unsaveWord, type SaveWordRequest } from "@/lib/api/vocabulary";

interface VocabState {
  savedWords: Set<string>;
  isLoaded: boolean;
  fetchSavedWords: () => Promise<void>;
  addWord: (word: string, req: SaveWordRequest) => Promise<void>;
  removeWord: (word: string) => Promise<void>;
  isSaved: (word: string) => boolean;
}

export const useVocabStore = create<VocabState>((set, get) => ({
  savedWords: new Set(),
  isLoaded: false,

  fetchSavedWords: async () => {
    try {
      const res = await checkSavedWords();
      set({ savedWords: new Set(res.words), isLoaded: true });
    } catch {
      // Silent fail — user may not be logged in
      set({ isLoaded: true });
    }
  },

  addWord: async (word: string, req: SaveWordRequest) => {
    const normalized = word.trim().toLowerCase();
    // Optimistic update
    set((state) => {
      const next = new Set(state.savedWords);
      next.add(normalized);
      return { savedWords: next };
    });
    try {
      await saveWord(req);
    } catch (err: unknown) {
      // Revert on error (unless 409 = already saved)
      const status = (err as { status?: number })?.status;
      if (status !== 409) {
        set((state) => {
          const next = new Set(state.savedWords);
          next.delete(normalized);
          return { savedWords: next };
        });
        throw err;
      }
    }
  },

  removeWord: async (word: string) => {
    const normalized = word.trim().toLowerCase();
    // Optimistic update
    set((state) => {
      const next = new Set(state.savedWords);
      next.delete(normalized);
      return { savedWords: next };
    });
    try {
      await unsaveWord(normalized);
    } catch {
      // Revert on error
      set((state) => {
        const next = new Set(state.savedWords);
        next.add(normalized);
        return { savedWords: next };
      });
    }
  },

  isSaved: (word: string) => {
    return get().savedWords.has(word.trim().toLowerCase());
  },
}));
