import { useCallback, useRef, useState } from "react";
import { getSpeechToken } from "@/lib/api/speech";

interface SpeechSynthesisState {
  isSpeaking: boolean;
  error: string | null;
}

export function useSpeechSynthesis(voice = "fr-CA-SylvieNeural") {
  const [state, setState] = useState<SpeechSynthesisState>({
    isSpeaking: false,
    error: null,
  });

  const synthesizerRef = useRef<unknown>(null) as React.MutableRefObject<unknown>;
  const playerRef = useRef<unknown>(null) as React.MutableRefObject<unknown>;

  const speak = useCallback(
    async (text: string) => {
      setState({ isSpeaking: true, error: null });

      try {
        const sdk = await import("microsoft-cognitiveservices-speech-sdk");
        const { token, region } = await getSpeechToken();

        const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(
          token,
          region,
        );
        speechConfig.speechSynthesisVoiceName = voice;

        const player = new sdk.SpeakerAudioDestination();
        playerRef.current = player;

        const audioConfig = sdk.AudioConfig.fromSpeakerOutput(player);
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
        synthesizerRef.current = synthesizer;

        await new Promise<void>((resolve, reject) => {
          synthesizer.speakTextAsync(
            text,
            (result) => {
              if (
                result.reason === sdk.ResultReason.SynthesizingAudioCompleted
              ) {
                resolve();
              } else {
                reject(
                  new Error(
                    result.errorDetails || "Speech synthesis failed",
                  ),
                );
              }
              synthesizer.close();
              synthesizerRef.current = null;
            },
            (err) => {
              synthesizer.close();
              synthesizerRef.current = null;
              reject(err);
            },
          );
        });

        // Wait for audio to finish playing
        await new Promise<void>((resolve) => {
          player.onAudioEnd = () => resolve();
          // Fallback in case event already fired
          if (player.isClosed) resolve();
        });

        setState({ isSpeaking: false, error: null });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Speech synthesis error";
        setState({ isSpeaking: false, error: message });
      }
    },
    [voice],
  );

  const stop = useCallback(() => {
    try {
      const player = playerRef.current as { close?: () => void } | null;
      if (player?.close) {
        player.close();
      }
      const synth = synthesizerRef.current as { close?: () => void } | null;
      if (synth?.close) {
        synth.close();
      }
    } catch {
      // ignore cleanup errors
    }
    synthesizerRef.current = null;
    playerRef.current = null;
    setState({ isSpeaking: false, error: null });
  }, []);

  return {
    ...state,
    speak,
    stop,
  };
}
