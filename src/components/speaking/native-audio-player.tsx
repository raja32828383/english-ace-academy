import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

/**
 * Native audio player. Uses the browser SpeechSynthesis API to read the target
 * sentence at a chosen speed. When a course provides a recorded `audioUrl`, an
 * <audio> element is used instead (future AI-generated narration).
 */
export function NativeAudioPlayer({
  text,
  audioUrl,
  className,
  compact,
}: {
  text: string;
  audioUrl?: string;
  className?: string;
  compact?: boolean;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const play = () => {
    if (audioUrl) {
      const el = audioRef.current;
      if (!el) return;
      el.playbackRate = rate;
      void el.play();
      setSpeaking(true);
      return;
    }
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = rate;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    if (audioUrl) {
      audioRef.current?.pause();
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} onEnded={() => setSpeaking(false)} />
      )}
      <Button
        type="button"
        variant={speaking ? "secondary" : "hero"}
        size={compact ? "sm" : "default"}
        onClick={speaking ? stop : play}
        aria-label={speaking ? "Pause native audio" : "Play native audio"}
      >
        {speaking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {compact ? null : speaking ? "Pause" : "Play native audio"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size={compact ? "sm" : "default"}
        onClick={() => {
          stop();
          play();
        }}
        aria-label="Replay native audio"
      >
        <RotateCcw className="h-4 w-4" />
        {compact ? null : "Replay"}
      </Button>

      <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
        <Volume2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRate(s)}
            aria-pressed={rate === s}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              rate === s
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
