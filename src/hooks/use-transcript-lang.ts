"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hitcf-transcript-langs";

interface LangPrefs {
  en: boolean;
  zh: boolean;
}

export function useTranscriptLang() {
  const [showEn, setShowEn] = useState(true);
  const [showZh, setShowZh] = useState(true);

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const prefs: LangPrefs = JSON.parse(saved);
        setShowEn(prefs.en);
        setShowZh(prefs.zh);
      }
    } catch {
      // ignore corrupt data
    }
  }, []);

  const persist = useCallback((en: boolean, zh: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ en, zh }));
    } catch {
      // storage full or unavailable
    }
  }, []);

  const toggleEn = useCallback(() => {
    setShowEn((prev) => {
      const next = !prev;
      setShowZh((zh) => {
        persist(next, zh);
        return zh;
      });
      return next;
    });
  }, [persist]);

  const toggleZh = useCallback(() => {
    setShowZh((prev) => {
      const next = !prev;
      setShowEn((en) => {
        persist(en, next);
        return en;
      });
      return next;
    });
  }, [persist]);

  return { showEn, showZh, toggleEn, toggleZh } as const;
}
