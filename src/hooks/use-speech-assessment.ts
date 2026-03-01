import { useCallback, useRef, useState } from "react";
import { getSpeechToken } from "@/lib/api/speech";

export interface PronunciationScores {
  accuracy: number;
  fluency: number;
  completeness: number;
  prosody: number;
  overall: number;
}

export interface WordScore {
  word: string;
  accuracy: number;
  errorType: "None" | "Mispronunciation" | "Omission" | "Insertion";
}

interface SpeechAssessmentState {
  isRecording: boolean;
  transcript: string;
  interimTranscript: string;
  scores: PronunciationScores | null;
  wordScores: WordScore[];
  error: string | null;
  duration: number;
}

export function useSpeechAssessment(referenceText?: string) {
  const [state, setState] = useState<SpeechAssessmentState>({
    isRecording: false,
    transcript: "",
    interimTranscript: "",
    scores: null,
    wordScores: [],
    error: null,
    duration: 0,
  });

  const recognizerRef = useRef<unknown>(null) as React.MutableRefObject<unknown>;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null) as React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  const startTimeRef = useRef<number>(0);

  // Accumulate results from continuous recognition
  const allWordsRef = useRef<WordScore[]>([]);
  const allTextsRef = useRef<string[]>([]);
  const allScoresRef = useRef<{
    accuracy: number[];
    fluency: number[];
    completeness: number[];
    prosody: number[];
  }>({ accuracy: [], fluency: [], completeness: [], prosody: [] });

  const reset = useCallback(() => {
    setState({
      isRecording: false,
      transcript: "",
      interimTranscript: "",
      scores: null,
      wordScores: [],
      error: null,
      duration: 0,
    });
    allWordsRef.current = [];
    allTextsRef.current = [];
    allScoresRef.current = { accuracy: [], fluency: [], completeness: [], prosody: [] };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      reset();
      setState((s) => ({ ...s, isRecording: true, error: null }));

      // 1. Get token
      const { token, region } = await getSpeechToken();

      // 2. Dynamic import SDK
      const sdk = await import("microsoft-cognitiveservices-speech-sdk");

      // 3. Configure speech
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechRecognitionLanguage = "fr-CA";

      // 4. Pronunciation assessment config
      const pronConfig = new sdk.PronunciationAssessmentConfig(
        referenceText || "",
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Word,
        true, // enable miscue
      );
      pronConfig.enableProsodyAssessment = true;

      // 5. Audio from microphone
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

      // 6. Create recognizer
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      pronConfig.applyTo(recognizer);
      recognizerRef.current = recognizer;

      // Start duration timer
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setState((s) => ({
          ...s,
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
        }));
      }, 1000);

      // 7. Recognizing event → interim transcript
      recognizer.recognizing = (_: unknown, e: { result?: { text?: string } }) => {
        if (e.result?.text) {
          setState((s) => ({ ...s, interimTranscript: e.result!.text! }));
        }
      };

      // 8. Recognized event → final transcript + scores
      recognizer.recognized = (_: unknown, e: { result?: { text?: string; properties?: { getProperty(key: string): string } } }) => {
        const result = e.result;
        if (!result?.text) return;

        allTextsRef.current.push(result.text);
        setState((s) => ({
          ...s,
          transcript: allTextsRef.current.join(" "),
          interimTranscript: "",
        }));

        // Extract pronunciation assessment from result
        try {
          const jsonStr = result.properties?.getProperty(
            "SpeechServiceResponse_JsonResult",
          );
          if (!jsonStr) return;

          const json = JSON.parse(jsonStr);
          const nBest = json?.NBest?.[0];
          if (!nBest) return;

          const pronAssessment = nBest.PronunciationAssessment;
          if (pronAssessment) {
            if (pronAssessment.AccuracyScore !== undefined)
              allScoresRef.current.accuracy.push(pronAssessment.AccuracyScore);
            if (pronAssessment.FluencyScore !== undefined)
              allScoresRef.current.fluency.push(pronAssessment.FluencyScore);
            if (pronAssessment.CompletenessScore !== undefined)
              allScoresRef.current.completeness.push(pronAssessment.CompletenessScore);
            if (pronAssessment.PronScore !== undefined)
              allScoresRef.current.prosody.push(pronAssessment.PronScore);
          }

          // Word-level scores
          const words = nBest.Words;
          if (Array.isArray(words)) {
            for (const w of words) {
              const pa = w.PronunciationAssessment;
              allWordsRef.current.push({
                word: w.Word || "",
                accuracy: pa?.AccuracyScore ?? 0,
                errorType: pa?.ErrorType || "None",
              });
            }
            setState((s) => ({ ...s, wordScores: [...allWordsRef.current] }));
          }
        } catch {
          // JSON parsing error — ignore, transcript is still valid
        }
      };

      // 9. Canceled / session stopped
      recognizer.canceled = (_: unknown, e: { errorDetails?: string }) => {
        if (e.errorDetails) {
          setState((s) => ({ ...s, error: e.errorDetails ?? null }));
        }
      };

      // 10. Start continuous recognition
      recognizer.startContinuousRecognitionAsync(
        () => {},
        (err: string) => {
          setState((s) => ({ ...s, isRecording: false, error: err }));
        },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState((s) => ({ ...s, isRecording: false, error: message }));
    }
  }, [referenceText, reset]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recognizer = recognizerRef.current as {
      stopContinuousRecognitionAsync?: (cb?: () => void, errCb?: (e: string) => void) => void;
      close?: () => void;
    } | null;

    if (recognizer?.stopContinuousRecognitionAsync) {
      recognizer.stopContinuousRecognitionAsync(
        () => {
          recognizer.close?.();
          recognizerRef.current = null;
        },
        () => {
          recognizer.close?.();
          recognizerRef.current = null;
        },
      );
    }

    // Compute aggregate scores
    const avg = (arr: number[]) =>
      arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    const s = allScoresRef.current;
    const accuracy = avg(s.accuracy);
    const fluency = avg(s.fluency);
    const completeness = avg(s.completeness);
    const prosody = avg(s.prosody);
    const overall = Math.round(accuracy * 0.3 + fluency * 0.3 + completeness * 0.2 + prosody * 0.2);

    const hasScores = s.accuracy.length > 0;
    setState((prev) => ({
      ...prev,
      isRecording: false,
      scores: hasScores ? { accuracy, fluency, completeness, prosody, overall } : null,
    }));
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    reset,
  };
}
