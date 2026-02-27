import { useCallback, useRef, useState } from "react";

/**
 * Hook for pronouncing French words.
 * Primary: Azure TTS audio URL (cached MP3).
 * Fallback: Web Speech API (browser TTS).
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

function _webSpeech(word: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "fr-FR";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
