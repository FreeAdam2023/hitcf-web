import { useCallback, useRef, useState } from "react";

/**
 * Hook for pronouncing French words.
 * Primary: Azure TTS audio URL (cached MP3).
 * Fallback: Web Speech API (browser TTS) with explicit French voice selection.
 */
export function useFrenchSpeech() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback((word: string, audioUrl?: string | null) => {
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (audioUrl) {
      // Primary: play cached Azure TTS audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setPlaying(true);
      audio.onended = () => setPlaying(false);
      audio.onerror = () => {
        setPlaying(false);
        // Fallback to Web Speech API
        _webSpeech(word);
      };
      audio.play().catch(() => {
        setPlaying(false);
        _webSpeech(word);
      });
    } else {
      _webSpeech(word);
    }
  }, []);

  return { speak, playing };
}

/** Cached French voice reference */
let _cachedFrenchVoice: SpeechSynthesisVoice | null | undefined;

function _findFrenchVoice(): SpeechSynthesisVoice | null {
  if (_cachedFrenchVoice !== undefined) return _cachedFrenchVoice;
  const voices = window.speechSynthesis.getVoices();
  // Priority: fr-CA > fr-FR > any fr-* voice
  const frCA = voices.find((v) => v.lang === "fr-CA");
  const frFR = voices.find((v) => v.lang === "fr-FR");
  const frAny = voices.find((v) => v.lang.startsWith("fr"));
  _cachedFrenchVoice = frCA || frFR || frAny || null;
  return _cachedFrenchVoice;
}

function _webSpeech(word: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "fr-CA";
  utterance.rate = 0.9;

  // Explicitly set a French voice to avoid English pronunciation
  const frVoice = _findFrenchVoice();
  if (frVoice) {
    utterance.voice = frVoice;
    utterance.lang = frVoice.lang;
  }

  window.speechSynthesis.speak(utterance);
}

// Pre-load voices (some browsers load asynchronously)
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    _cachedFrenchVoice = undefined; // reset cache so next call re-discovers
  };
}
