"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAudioUrl } from "@/lib/api/media";

const SAS_REFRESH_MS = 12 * 60 * 1000; // refresh after 12 minutes

interface AudioPlayerProps {
  questionId: string;
}

export function AudioPlayer({ questionId }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedAtRef = useRef(0);
  const pendingPlayRef = useRef(false);

  const loadUrl = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAudioUrl(questionId);
      setUrl(res.url);
      fetchedAtRef.current = Date.now();
    } catch {
      setError("无法加载音频");
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  // Reset when question changes
  useEffect(() => {
    setUrl(null);
    setPlaying(false);
    setProgress(0);
    setError(null);
    fetchedAtRef.current = 0;
    pendingPlayRef.current = false;
  }, [questionId]);

  // Auto-play after URL loads when user clicked play
  useEffect(() => {
    const audio = audioRef.current;
    if (!url || !pendingPlayRef.current || !audio) return;
    pendingPlayRef.current = false;

    const tryPlay = () => {
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => setError("播放失败"));
    };

    if (audio.readyState >= 2) {
      tryPlay();
    } else {
      audio.addEventListener("canplay", tryPlay, { once: true });
    }
  }, [url]);

  const togglePlay = async () => {
    // If no URL yet or SAS expired, load it first
    if (!url || Date.now() - fetchedAtRef.current > SAS_REFRESH_MS) {
      pendingPlayRef.current = true;
      await loadUrl();
      // Play will be triggered by the useEffect above after re-render
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setError("播放失败");
      }
    }
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setProgress(0);
  };

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const onEnded = () => {
    setPlaying(false);
    setProgress(100);
  };

  const onError = () => {
    setPlaying(false);
    setError("音频加载失败，请重试");
  };

  return (
    <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
      <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" />

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={togglePlay}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : playing ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <div className="flex-1">
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={restart}
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>

      {url && (
        <audio
          ref={audioRef}
          src={url}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          onError={onError}
          preload="auto"
        />
      )}

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
