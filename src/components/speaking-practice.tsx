import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Minimal typing for the Web Speech API (not in standard TS DOM libs).
interface SpeechRecognitionResultLike {
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
}

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function SpeakingPractice({
  prompt,
  onComplete,
  saving,
}: {
  prompt: string;
  onComplete: () => void;
  saving: boolean;
}) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(getRecognition() !== null);
  }, []);

  const start = () => {
    const rec = getRecognition();
    if (!rec) {
      setSupported(false);
      return;
    }
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = Array.from({ length: e.results.length }, (_, i) => e.results[i][0].transcript).join(" ");
      setTranscript(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setTranscript("");
    setListening(true);
    rec.start();
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <Card className="p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Speaking practice</p>
      <p className="mt-2 text-lg font-semibold">{prompt}</p>

      {!supported ? (
        <p className="mt-4 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          Your browser doesn't support speech recognition. You can still practice out loud, then
          mark this lesson complete.
        </p>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-3">
          <button
            onClick={listening ? stop : start}
            className={`grid h-20 w-20 place-items-center rounded-full text-primary-foreground transition-transform active:scale-95 ${
              listening ? "animate-pulse bg-coral" : "bg-primary"
            }`}
            aria-label={listening ? "Stop recording" : "Start recording"}
          >
            {listening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </button>
          <p className="text-sm font-bold text-muted-foreground">
            {listening ? "Listening… speak now" : "Tap to speak"}
          </p>
        </div>
      )}

      {transcript && (
        <div className="mt-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">You said</p>
          <p className="mt-1 flex items-start gap-2 font-medium">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {transcript}
          </p>
        </div>
      )}

      <Button variant="hero" className="mt-5 w-full" onClick={onComplete} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Complete speaking practice
      </Button>
    </Card>
  );
}
