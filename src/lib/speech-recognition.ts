import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Speaking Lab — Web Speech API wrapper (browser speech recognition).
 *
 * Provides live + final transcripts, a confidence score, and typed error
 * states (permission denied, no speech, audio failure, unsupported). Recording
 * lifecycle: start / pause / resume / stop. The heavy lifting (scoring) lives
 * in src/lib/pronunciation.ts so this hook stays focused on the browser API.
 */

// Minimal typings for the Web Speech API (absent from the standard DOM libs).
interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
  isFinal: boolean;
  length: number;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
  resultIndex: number;
}
interface SpeechRecognitionErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type RecognitionError =
  | "unsupported"
  | "not-allowed"
  | "no-speech"
  | "audio-capture"
  | "network"
  | "aborted"
  | "unknown";

export const RECOGNITION_ERROR_MESSAGES: Record<RecognitionError, string> = {
  unsupported:
    "Your browser doesn't support speech recognition. Try Chrome or Edge on desktop or Android.",
  "not-allowed":
    "Microphone access was blocked. Allow the microphone in your browser settings and try again.",
  "no-speech": "We didn't hear anything. Tap the mic and speak clearly.",
  "audio-capture":
    "No microphone was found. Please connect a microphone and try again.",
  network: "Speech recognition failed to reach the network. Please try again.",
  aborted: "Recording was stopped. Tap the mic to try again.",
  unknown: "Something went wrong with recording. Please try again.",
};

export type RecordingState = "idle" | "recording" | "paused" | "processing";

export interface UseSpeechRecognitionResult {
  supported: boolean;
  state: RecordingState;
  /** Final transcript for the current attempt. */
  transcript: string;
  /** Live (interim) transcript while speaking. */
  interim: string;
  confidence: number;
  error: RecognitionError | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(
  lang = "en-US",
): UseSpeechRecognitionResult {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<RecognitionError | null>(null);

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef("");
  const pausedRef = useRef(false);
  const wantActiveRef = useRef(false);

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    return () => {
      wantActiveRef.current = false;
      recRef.current?.abort();
    };
  }, []);

  const build = useCallback((): SpeechRecognitionLike | null => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const alt = res[0];
        if (res.isFinal) {
          finalRef.current = (finalRef.current + " " + alt.transcript).trim();
          if (alt.confidence > 0) setConfidence(alt.confidence);
        } else {
          live += alt.transcript;
        }
      }
      setTranscript(finalRef.current);
      setInterim(live);
    };

    rec.onerror = (e) => {
      const code = e.error;
      const map: Record<string, RecognitionError> = {
        "not-allowed": "not-allowed",
        "service-not-allowed": "not-allowed",
        "no-speech": "no-speech",
        "audio-capture": "audio-capture",
        network: "network",
        aborted: "aborted",
      };
      const mapped = map[code] ?? "unknown";
      // 'no-speech' / 'aborted' are soft; don't surface as hard errors mid-flow.
      if (mapped !== "aborted") setError(mapped);
    };

    rec.onend = () => {
      // Auto-restart if the engine ends while we still want to record (Chrome
      // ends after short silences). Respect pause and explicit stop.
      if (wantActiveRef.current && !pausedRef.current) {
        try {
          rec.start();
          return;
        } catch {
          /* already started */
        }
      }
      if (!wantActiveRef.current) setState("idle");
    };

    return rec;
  }, [lang]);

  const start = useCallback(() => {
    if (!getRecognitionCtor()) {
      setSupported(false);
      setError("unsupported");
      return;
    }
    finalRef.current = "";
    pausedRef.current = false;
    wantActiveRef.current = true;
    setTranscript("");
    setInterim("");
    setConfidence(0);
    setError(null);
    const rec = build();
    if (!rec) return;
    recRef.current = rec;
    try {
      rec.start();
      setState("recording");
    } catch {
      setError("unknown");
      setState("idle");
    }
  }, [build]);

  const pause = useCallback(() => {
    if (state !== "recording") return;
    pausedRef.current = true;
    recRef.current?.stop();
    setState("paused");
  }, [state]);

  const resume = useCallback(() => {
    if (state !== "paused") return;
    pausedRef.current = false;
    wantActiveRef.current = true;
    try {
      recRef.current?.start();
      setState("recording");
    } catch {
      // Recogniser instance may be dead after stop — rebuild.
      const rec = build();
      if (rec) {
        recRef.current = rec;
        rec.start();
        setState("recording");
      }
    }
  }, [state, build]);

  const stop = useCallback(() => {
    wantActiveRef.current = false;
    pausedRef.current = false;
    recRef.current?.stop();
    setInterim("");
    setState("idle");
  }, []);

  const reset = useCallback(() => {
    wantActiveRef.current = false;
    pausedRef.current = false;
    recRef.current?.abort();
    finalRef.current = "";
    setTranscript("");
    setInterim("");
    setConfidence(0);
    setError(null);
    setState("idle");
  }, []);

  return {
    supported,
    state,
    transcript,
    interim,
    confidence,
    error,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
