import { Mic, Square, Pause, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  RecordingState,
  RecognitionError,
} from "@/lib/speech-recognition";
import { RECOGNITION_ERROR_MESSAGES } from "@/lib/speech-recognition";

/** Animated waveform shown while recording. */
export function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-8 items-center justify-center gap-1" aria-hidden="true">
      {Array.from({ length: 7 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-1 rounded-full bg-primary",
            active ? "waveform-bar" : "opacity-30",
          )}
          style={{ height: "100%", animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  );
}

interface Props {
  state: RecordingState;
  interim: string;
  transcript: string;
  error: RecognitionError | null;
  supported: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}

/** Microphone control with recording / paused / processing states + live text. */
export function MicRecorder({
  state,
  interim,
  transcript,
  error,
  supported,
  onStart,
  onStop,
  onPause,
  onResume,
}: Props) {
  const recording = state === "recording";
  const paused = state === "paused";
  const processing = state === "processing";

  if (!supported) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {RECOGNITION_ERROR_MESSAGES.unsupported}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative grid place-items-center">
        {recording && (
          <>
            <span className="mic-ring absolute h-24 w-24 rounded-full bg-coral/40" />
            <span
              className="mic-ring absolute h-24 w-24 rounded-full bg-coral/30"
              style={{ animationDelay: "0.6s" }}
            />
          </>
        )}
        <button
          type="button"
          onClick={recording ? onStop : paused ? onResume : onStart}
          disabled={processing}
          aria-label={
            recording ? "Stop recording" : paused ? "Resume recording" : "Start recording"
          }
          className={cn(
            "relative grid h-20 w-20 place-items-center rounded-full text-primary-foreground shadow-pop transition-transform active:scale-95 disabled:opacity-60",
            recording ? "bg-coral" : "bg-primary",
          )}
        >
          {processing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : recording ? (
            <Square className="h-7 w-7" />
          ) : paused ? (
            <Play className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </button>
      </div>

      {recording ? <Waveform active /> : <div className="h-8" />}

      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-muted-foreground">
          {processing
            ? "Scoring…"
            : recording
              ? "Listening… speak now"
              : paused
                ? "Paused"
                : "Tap the mic and speak"}
        </p>
        {recording && (
          <button
            type="button"
            onClick={onPause}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-muted"
          >
            <Pause className="h-3.5 w-3.5" /> Pause
          </button>
        )}
      </div>

      {(interim || transcript) && (
        <div className="min-h-[2.5rem] w-full rounded-xl bg-muted/50 p-3 text-center text-sm">
          <span className="font-medium">{transcript}</span>{" "}
          <span className="text-muted-foreground">{interim}</span>
        </div>
      )}

      {error && error !== "no-speech" && (
        <p className="w-full rounded-xl bg-destructive/10 p-3 text-center text-sm font-medium text-destructive">
          {RECOGNITION_ERROR_MESSAGES[error]}
        </p>
      )}
    </div>
  );
}
