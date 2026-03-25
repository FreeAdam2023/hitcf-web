"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Loader2,
  Headphones,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { getAudioUrl } from "@/lib/api/media";
import { formatTime } from "@/lib/utils";

const SAS_REFRESH_MS = 12 * 60 * 1000; // refresh after 12 minutes

export interface AudioPlayerHandle {
  seekTo: (seconds: number) => void;
  playSegment: (start: number, end: number) => void;
  replay: () => void;
}

interface AudioPlayerProps {
  questionId: string;
  /** Pre-signed audio URL (skips /api/media/audio fetch if provided) */
  audioUrl?: string | null;
  maxPlays?: number;
  onPlaybackComplete?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  /** Automatically start playback when questionId changes */
  autoPlay?: boolean;
  /** Exam mode: hide all controls, show minimal listening indicator */
  examMode?: boolean;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25];

export const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(
  function AudioPlayer({ questionId, audioUrl: directUrl, maxPlays, onPlaybackComplete, onTimeUpdate: onTimeUpdateProp, autoPlay, examMode }, ref) {
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
  const segmentEndRef = useRef<number | null>(null);
  const restartRef = useRef<() => void>(() => {});

  const exhausted = maxPlays !== undefined && playCount >= maxPlays;

  const loadUrl = useCallback(async () => {
    // Use pre-signed URL from question data if fresh (< 12 min old)
    const sasExpired = fetchedAtRef.current > 0 && Date.now() - fetchedAtRef.current > SAS_REFRESH_MS;
    if (directUrl && !sasExpired) {
      setUrl(directUrl);
      fetchedAtRef.current = fetchedAtRef.current || Date.now();
      return;
    }
    // Fetch fresh SAS URL from API (directUrl may have expired)
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
  }, [questionId, directUrl, t]);

  useImperativeHandle(ref, () => ({
    seekTo(seconds: number) {
      const audio = audioRef.current;
      if (!audio || !url) {
        // Queue a load + seek
        pendingSeekRef.current = { type: "seek", seconds };
        loadUrl();
        return;
      }
      segmentEndRef.current = null;
      audio.currentTime = seconds;
      audio.play().then(() => setPlaying(true)).catch(() => {});
    },
    playSegment(start: number, end: number) {
      const audio = audioRef.current;
      if (!audio || !url) {
        pendingSeekRef.current = { type: "segment", start, end };
        loadUrl();
        return;
      }
      segmentEndRef.current = end;
      audio.currentTime = start;
      audio.play().then(() => setPlaying(true)).catch(() => {});
    },
    replay() {
      restartRef.current();
    },
  }), [url, loadUrl]);

  // Pending seek/segment after URL loads
  const pendingSeekRef = useRef<
    | { type: "seek"; seconds: number }
    | { type: "segment"; start: number; end: number }
    | null
  >(null);

  // Reset when question changes
  useEffect(() => {
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setSpeed(1);
    setPlayCount(0);
    pendingPlayRef.current = false;
    pendingSeekRef.current = null;
    segmentEndRef.current = null;
    // Pre-set URL if direct URL available, otherwise clear for lazy load
    if (directUrl) {
      setUrl(directUrl);
      fetchedAtRef.current = Date.now();
    } else {
      setUrl(null);
      fetchedAtRef.current = 0;
    }
  }, [questionId, directUrl]);

  // Auto-play on question change (e.g. clicking "next" in listening practice)
  useEffect(() => {
    if (!autoPlay) return;
    pendingPlayRef.current = true;
    loadUrl();
  }, [questionId, autoPlay, loadUrl]);

  // Auto-play after URL loads when user clicked play or pending seek
  useEffect(() => {
    const audio = audioRef.current;
    if (!url || !audio) return;

    const pending = pendingSeekRef.current;
    if (pending) {
      pendingSeekRef.current = null;
      const doSeek = () => {
        if (pending.type === "seek") {
          segmentEndRef.current = null;
          audio.currentTime = pending.seconds;
        } else {
          segmentEndRef.current = pending.end;
          audio.currentTime = pending.start;
        }
        audio.play().then(() => setPlaying(true)).catch(() => {});
      };
      if (audio.readyState >= 2) {
        doSeek();
      } else {
        audio.addEventListener("canplay", doSeek, { once: true });
      }
      return;
    }

    if (!pendingPlayRef.current) return;
    pendingPlayRef.current = false;

    const tryPlay = () => {
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => {
          // Autoplay blocked by browser policy — silently wait for manual click
          if (autoPlay) return;
          setError(t("audio.playError"));
        });
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
      segmentEndRef.current = null;
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setError(t("audio.playError"));
      }
    }
  };

  const restart = async () => {
    if (exhausted) return;
    if (!url || Date.now() - fetchedAtRef.current > SAS_REFRESH_MS) {
      pendingPlayRef.current = true;
      await loadUrl();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setProgress(0);
    setCurrentTime(0);
    segmentEndRef.current = null;
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setError(t("audio.playError"));
    }
  };
  restartRef.current = restart;

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const newMuted = !muted;
    setMuted(newMuted);
    audio.muted = newMuted;
  };

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
    setCurrentTime(audio.currentTime);
    onTimeUpdateProp?.(audio.currentTime);
    // Segment end detection
    if (segmentEndRef.current != null && audio.currentTime >= segmentEndRef.current) {
      audio.pause();
      setPlaying(false);
      segmentEndRef.current = null;
    }
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
    segmentEndRef.current = null;
    const newCount = playCount + 1;
    setPlayCount(newCount);
    if (maxPlays !== undefined && newCount >= maxPlays) {
      onPlaybackComplete?.();
    }
  };

  const retryCountRef = useRef(0);

  /** Append cache-busting param to bypass browser cache on retry. */
  const bustCache = (rawUrl: string) => {
    const sep = rawUrl.includes("?") ? "&" : "?";
    return `${rawUrl}${sep}_t=${Date.now()}`;
  };

  const onError = () => {
    setPlaying(false);
    // Auto-retry once: fetch fresh URL with cache bust
    if (retryCountRef.current < 1) {
      retryCountRef.current += 1;
      setUrl(null);
      fetchedAtRef.current = 0;
      getAudioUrl(questionId)
        .then((res) => {
          setUrl(bustCache(res.url));
          fetchedAtRef.current = Date.now();
        })
        .catch(() => setError(t("audio.loadRetryError")));
    } else {
      setError(t("audio.loadRetryError"));
    }
  };

  // Reset retry counter when question changes
  useEffect(() => { retryCountRef.current = 0; }, [questionId]);

  if (examMode) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        {playing ? (
          <Headphones className="h-5 w-5 text-primary animate-pulse" />
        ) : loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (
          <Headphones className="h-5 w-5 text-muted-foreground" />
        )}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
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

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-3">
      {/* Volume control */}
      <div className="relative" ref={volumeRef}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setShowVolume(!showVolume)}
          onContextMenu={(e) => {
            e.preventDefault();
            toggleMute();
          }}
          aria-label={muted ? t("audio.unmute") : t("audio.mute")}
        >
          {muted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        {showVolume && (
          <div className="absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 rounded-lg border bg-popover px-2.5 py-3 shadow-md">
            <div
              className="relative h-20 w-1.5 rounded-full bg-muted cursor-pointer"
              aria-label={t("audio.volume")}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round((muted ? 0 : volume) * 100)}
              onPointerDown={(e) => {
                const el = e.currentTarget;
                el.setPointerCapture(e.pointerId);
                const rect = el.getBoundingClientRect();
                const update = (clientY: number) => {
                  const ratio = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
                  const val = Math.round(ratio * 20) / 20;
                  setVolume(val);
                  setMuted(val === 0);
                  if (audioRef.current) {
                    audioRef.current.volume = val;
                    audioRef.current.muted = val === 0;
                  }
                };
                update(e.clientY);
                const onMove = (ev: PointerEvent) => update(ev.clientY);
                const onUp = () => {
                  el.removeEventListener("pointermove", onMove);
                  el.removeEventListener("pointerup", onUp);
                };
                el.addEventListener("pointermove", onMove);
                el.addEventListener("pointerup", onUp);
              }}
            >
              <div
                className="absolute inset-x-0 bottom-0 rounded-full bg-primary transition-[height] duration-75"
                style={{ height: `${(muted ? 0 : volume) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Play/Pause/Retry */}
      <Button
        variant={error ? "destructive" : "outline"}
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => {
          if (error) {
            setError(null);
            retryCountRef.current = 0;
            setUrl(null);
            fetchedAtRef.current = 0;
            pendingPlayRef.current = true;
            // Fetch fresh URL with cache bust
            getAudioUrl(questionId)
              .then((res) => {
                setUrl(bustCache(res.url));
                fetchedAtRef.current = Date.now();
              })
              .catch(() => setError(t("audio.loadRetryError")));
          } else {
            togglePlay();
          }
        }}
        disabled={loading || exhausted}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : error ? (
          <RotateCcw className="h-4 w-4" />
        ) : playing ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {/* Progress bar + time */}
      <div className="flex flex-1 items-center gap-2">
        <div
          className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-muted"
          role="slider"
          aria-label={t("audio.seek")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          onPointerDown={(e) => {
            const audio = audioRef.current;
            if (!audio || !duration) return;
            const el = e.currentTarget;
            el.setPointerCapture(e.pointerId);
            const seek = (clientX: number) => {
              const rect = el.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
              audio.currentTime = ratio * duration;
              setProgress(ratio * 100);
              setCurrentTime(ratio * duration);
            };
            seek(e.clientX);
            const onMove = (ev: PointerEvent) => seek(ev.clientX);
            const onUp = () => {
              el.removeEventListener("pointermove", onMove);
              el.removeEventListener("pointerup", onUp);
            };
            el.addEventListener("pointermove", onMove);
            el.addEventListener("pointerup", onUp);
          }}
        >
          <div
            className="h-1.5 rounded-full bg-primary transition-[width] duration-75"
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
});
