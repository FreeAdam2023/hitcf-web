"use client";

import { useCallback, useRef, useState } from "react";
import { getSpeechToken } from "@/lib/api/speech";

// Sentence boundary regex: period, exclamation, question, colon followed by space or end
const SENTENCE_BOUNDARY = /[.!?:;]\s/;

interface UseStreamingTTSReturn {
  isSpeaking: boolean;
  feedChunk: (text: string) => void;
  finalize: () => void;
  stop: () => void;
}

export function useStreamingTTS(
  voice = "fr-CA-SylvieNeural",
): UseStreamingTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const bufferRef = useRef("");
  const queueRef = useRef<string[]>([]);
  const processingRef = useRef(false);
  const stoppedRef = useRef(false);
  const sdkRef = useRef<typeof import("microsoft-cognitiveservices-speech-sdk") | null>(null);
  const tokenRef = useRef<{ token: string; region: string } | null>(null);
  const synthesizerRef = useRef<unknown>(null);
  const playerRef = useRef<unknown>(null);

  const ensureSDK = useCallback(async () => {
    if (!sdkRef.current) {
      sdkRef.current = await import("microsoft-cognitiveservices-speech-sdk");
    }
    if (!tokenRef.current) {
      tokenRef.current = await getSpeechToken();
    }
    return { sdk: sdkRef.current, ...tokenRef.current };
  }, []);

  const speakSentence = useCallback(
    async (sentence: string) => {
      if (stoppedRef.current || !sentence.trim()) return;

      const { sdk, token, region } = await ensureSDK();
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechSynthesisVoiceName = voice;

      const player = new sdk.SpeakerAudioDestination();
      playerRef.current = player;

      const audioConfig = sdk.AudioConfig.fromSpeakerOutput(player);
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
      synthesizerRef.current = synthesizer;

      await new Promise<void>((resolve, reject) => {
        synthesizer.speakTextAsync(
          sentence,
          (result: { reason: number; errorDetails?: string }) => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              resolve();
            } else {
              reject(new Error(result.errorDetails || "TTS failed"));
            }
            synthesizer.close();
            synthesizerRef.current = null;
          },
          (err: unknown) => {
            synthesizer.close();
            synthesizerRef.current = null;
            reject(err);
          },
        );
      });

      // Wait for audio playback to finish
      await new Promise<void>((resolve) => {
        player.onAudioEnd = () => resolve();
        if (player.isClosed) resolve();
      });
    },
    [ensureSDK, voice],
  );

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsSpeaking(true);

    while (queueRef.current.length > 0 && !stoppedRef.current) {
      const sentence = queueRef.current.shift()!;
      try {
        await speakSentence(sentence);
      } catch {
        // Non-critical — continue with next sentence
      }
    }

    processingRef.current = false;
    if (!stoppedRef.current) {
      setIsSpeaking(false);
    }
  }, [speakSentence]);

  const enqueueSentences = useCallback(() => {
    // Extract complete sentences from buffer
    let remaining = bufferRef.current;
    let match: RegExpExecArray | null;

    while ((match = SENTENCE_BOUNDARY.exec(remaining)) !== null) {
      const sentenceEnd = match.index + match[0].length;
      const sentence = remaining.substring(0, sentenceEnd).trim();
      if (sentence) {
        queueRef.current.push(sentence);
      }
      remaining = remaining.substring(sentenceEnd);
    }

    bufferRef.current = remaining;

    // Start processing if not already
    if (queueRef.current.length > 0 && !processingRef.current) {
      processQueue();
    }
  }, [processQueue]);

  const feedChunk = useCallback(
    (text: string) => {
      if (stoppedRef.current) return;
      bufferRef.current += text;
      enqueueSentences();
    },
    [enqueueSentences],
  );

  const finalize = useCallback(() => {
    // Flush remaining buffer as final sentence
    const remaining = bufferRef.current.trim();
    bufferRef.current = "";
    if (remaining) {
      queueRef.current.push(remaining);
    }
    if (queueRef.current.length > 0 && !processingRef.current) {
      processQueue();
    }
  }, [processQueue]);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    queueRef.current = [];
    bufferRef.current = "";

    try {
      const player = playerRef.current as { close?: () => void } | null;
      if (player?.close) player.close();
      const synth = synthesizerRef.current as { close?: () => void } | null;
      if (synth?.close) synth.close();
    } catch {
      // ignore cleanup errors
    }

    playerRef.current = null;
    synthesizerRef.current = null;
    processingRef.current = false;
    setIsSpeaking(false);

    // Reset stopped flag after a tick so next streaming session works
    setTimeout(() => {
      stoppedRef.current = false;
    }, 0);
  }, []);

  return {
    isSpeaking,
    feedChunk,
    finalize,
    stop,
  };
}
