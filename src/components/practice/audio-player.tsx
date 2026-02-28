"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { getAudioUrl } from "@/lib/api/media";
import { formatTime } from "@/lib/utils";

const SAS_REFRESH_MS = 12 * 60 * 1000; // refresh after 12 minutes

interface AudioPlayerProps {
  questionId: string;
  maxPlays?: number;
  onPlaybackComplete?: () => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function AudioPlayer({ questionId, maxPlays, onPlaybackComplete }: AudioPlayerProps) {
  const t = useTranslations();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const volumeRef = useRef<HTMLDivElement>(null);
  const fetchedAtRef = useRef(0);
  const pendingPlayRef = useRef(false);

  const exhausted = maxPlays !== undefined && playCount >= maxPlays;

  const loadUrl = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAudioUrl(questionId);
      setUrl(res.url);
      fetchedAtRef.current = Date.now();
    } catch {
      setError(t("audio.loadError"));
    } finally {
      setLoading(false);
    }
  }, [questionId, t]);

  // Reset when question changes
  useEffect(() => {
    setUrl(null);
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setPlayCount(0);
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
        .catch(() => setError(t("audio.playError")));
    };

    if (audio.readyState >= 2) {
      tryPlay();
    } else {
      audio.addEventListener("canplay", tryPlay, { once: true });
    }
  }, [url]);

  // Close volume popup on outside click
  useEffect(() => {
    if (!showVolume) return;
    const handler = (e: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        setShowVolume(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showVolume]);

  const togglePlay = async () => {
    if (exhausted) return;
    if (!url || Date.now() - fetchedAtRef.current > SAS_REFRESH_MS) {
      pendingPlayRef.current = true;
      await loadUrl();
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
        setError(t("audio.playError"));
      }
    }
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setProgress(0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const newMuted = !muted;
    setMuted(newMuted);
    audio.muted = newMuted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
  };

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
    setCurrentTime(audio.currentTime);
  };

  const onLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
    audio.playbackRate = speed;
    audio.volume = volume;
    audio.muted = muted;
  };

  const onEnded = () => {
    setPlaying(false);
    setProgress(100);
    const newCount = playCount + 1;
    setPlayCount(newCount);
    if (maxPlays !== undefined && newCount >= maxPlays) {
      onPlaybackComplete?.();
    }
  };

  const onError = () => {
    setPlaying(false);
    setError(t("audio.loadRetryError"));
  };

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-3">
      {/* Volume control */}
      <div className="relative" ref={volumeRef}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => {
            if (showVolume) {
              setShowVolume(false);
            } else {
              toggleMute();
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowVolume(!showVolume);
          }}
          onDoubleClick={() => setShowVolume(!showVolume)}
          aria-label={muted ? t("audio.unmute") : t("audio.mute")}
        >
          {muted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        {showVolume && (
          <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md border bg-popover p-2 shadow-md">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="h-20 w-1.5 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
              style={{ writingMode: "vertical-lr", direction: "rtl" }}
              aria-label={t("audio.volume")}
            />
          </div>
        )}
      </div>

      {/* Play/Pause */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={togglePlay}
        disabled={loading || exhausted}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : playing ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {/* Progress bar + time */}
      <div className="flex flex-1 items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Restart */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={restart}
        disabled={exhausted}
        aria-label={t("audio.replay")}
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>

      {/* Speed — hidden when plays exhausted */}
      {!exhausted && (
        <select
          value={speed}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setSpeed(val);
            if (audioRef.current) audioRef.current.playbackRate = val;
          }}
          className="h-8 shrink-0 rounded-md border bg-background px-1.5 text-xs font-mono tabular-nums cursor-pointer"
          aria-label={t("audio.speed")}
        >
          {SPEED_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}x</option>
          ))}
        </select>
      )}

      {exhausted && (
        <span className="shrink-0 text-xs text-muted-foreground">{t("audio.played")}</span>
      )}

      {url && (
        <audio
          ref={audioRef}
          src={url}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEnded}
          onError={onError}
          preload="auto"
        />
      )}

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
