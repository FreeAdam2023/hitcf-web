"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hitcf-transcript-langs";

/**
 * Toggle visibility of EN (bridge) and Native translation lines
 * in the transcript block. For EN users, only the native toggle matters
 * (since EN = native). Persists preferences to localStorage.
 */
export function useTranscriptLang() {
  const [showEn, setShowEn] = useState(true);
  const [showNative, setShowNative] = useState(true);

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const prefs = JSON.parse(saved);
        // Support both old format {en, zh} and new format {en, native}
        setShowEn(prefs.en ?? true);
        setShowNative(prefs.native ?? prefs.zh ?? true);
      }
    } catch {
      // ignore corrupt data
    }
  }, []);

  const persist = useCallback((en: boolean, native: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ en, native }));
    } catch {
      // storage full or unavailable
    }
  }, []);

  const toggleEn = useCallback(() => {
    setShowEn((prev) => {
      const next = !prev;
      setShowNative((n) => {
        persist(next, n);
        return n;
      });
      return next;
    });
  }, [persist]);

  const toggleNative = useCallback(() => {
    setShowNative((prev) => {
      const next = !prev;
      setShowEn((en) => {
        persist(en, next);
        return en;
      });
      return next;
    });
  }, [persist]);

  return { showEn, showNative, toggleEn, toggleNative } as const;
}
