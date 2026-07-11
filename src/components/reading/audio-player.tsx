import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Gauge,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface AudioPlayerHandle {
  jumpTo: (index: number) => void;
}

interface AudioPlayerProps {
  /** Sentences to narrate, in order. */
  lines: string[];
  /** Optional pre-recorded narration (future). Falls back to speech synthesis. */
  src?: string | null;
  onActiveLineChange?: (index: number) => void;
  onPlayingChange?: (playing: boolean) => void;
  onEnded?: () => void;
  className?: string;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function fmt(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/**
 * Premium sentence-synced audio player. Uses the Web Speech API to narrate each
 * transcript sentence, exposing the active sentence for transcript highlighting
 * and jump-to-sentence. Architected so future AI/recorded audio (`src`) can slot
 * in without changing the surrounding UI.
 */
export const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(
  function AudioPlayer(
    { lines, onActiveLineChange, onPlayingChange, onEnded, className },
    ref,
  ) {
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [supported, setSupported] = useState(true);
    const [error, setError] = useState(false);

    const indexRef = useRef(0);
    const playingRef = useRef(false);
    const speedRef = useRef(1);

    // Estimated per-line durations for the progress bar / timecodes.
    const durations = useRef<number[]>([]);
    if (durations.current.length !== lines.length) {
      durations.current = lines.map(
        (l) => Math.max(1.5, l.trim().split(/\s+/).length / 2.6),
      );
    }
    const totalDuration = durations.current.reduce((a, b) => a + b, 0) / speed;
    const elapsed =
      durations.current.slice(0, index).reduce((a, b) => a + b, 0) / speed;

    useEffect(() => {
      setSupported(
        typeof window !== "undefined" && !!window.speechSynthesis,
      );
      return () => {
        if (typeof window !== "undefined" && window.speechSynthesis)
          window.speechSynthesis.cancel();
      };
    }, []);

    const setActive = useCallback(
      (i: number) => {
        indexRef.current = i;
        setIndex(i);
        onActiveLineChange?.(i);
      },
      [onActiveLineChange],
    );

    const setIsPlaying = useCallback(
      (p: boolean) => {
        playingRef.current = p;
        setPlaying(p);
        onPlayingChange?.(p);
      },
      [onPlayingChange],
    );

    const speakFrom = useCallback(
      (start: number) => {
        if (!window.speechSynthesis) {
          setError(true);
          return;
        }
        window.speechSynthesis.cancel();
        setError(false);

        const speakLine = (i: number) => {
          if (i >= lines.length) {
            setIsPlaying(false);
            setActive(0);
            onEnded?.();
            return;
          }
          setActive(i);
          const u = new SpeechSynthesisUtterance(lines[i]);
          u.lang = "en-US";
          u.rate = 0.95 * speedRef.current;
          u.onend = () => {
            if (!playingRef.current) return;
            speakLine(i + 1);
          };
          u.onerror = () => {
            setError(true);
            setIsPlaying(false);
          };
          window.speechSynthesis.speak(u);
        };

        setIsPlaying(true);
        speakLine(start);
      },
      [lines, onEnded, setActive, setIsPlaying],
    );

    const togglePlay = useCallback(() => {
      if (!supported) {
        setError(true);
        return;
      }
      if (playingRef.current) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        speakFrom(indexRef.current);
      }
    }, [supported, speakFrom, setIsPlaying]);

    const jumpTo = useCallback(
      (i: number) => {
        const clamped = Math.max(0, Math.min(lines.length - 1, i));
        setActive(clamped);
        if (playingRef.current) speakFrom(clamped);
      },
      [lines.length, setActive, speakFrom],
    );

    useImperativeHandle(ref, () => ({ jumpTo }), [jumpTo]);

    const replay = useCallback(() => jumpTo(0), [jumpTo]);
    const skipForward = useCallback(
      () => jumpTo(indexRef.current + 1),
      [jumpTo],
    );
    const skipBack = useCallback(() => jumpTo(indexRef.current - 1), [jumpTo]);

    const changeSpeed = (s: number) => {
      speedRef.current = s;
      setSpeed(s);
      if (playingRef.current) speakFrom(indexRef.current);
    };

    return (
      <div
        className={cn(
          "rounded-2xl border bg-card p-4 shadow-soft",
          className,
        )}
        role="group"
        aria-label="Audio player"
      >
        {error && (
          <p className="mb-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Audio failed. Your browser may not support speech — try Chrome or tap play again.
          </p>
        )}

        {/* Progress */}
        <div className="flex items-center gap-3">
          <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-foreground">
            {fmt(elapsed)}
          </span>
          <Slider
            value={[index]}
            min={0}
            max={Math.max(0, lines.length - 1)}
            step={1}
            onValueChange={(v) => jumpTo(v[0])}
            aria-label="Sentence position"
            className="flex-1"
          />
          <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">
            {fmt(totalDuration)}
          </span>
        </div>

        {/* Controls */}
        <div className="mt-3 flex items-center justify-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={replay}
            aria-label="Replay from start"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={skipBack}
            aria-label="Previous sentence"
            disabled={index === 0}
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            variant="hero"
            size="icon"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            className="h-12 w-12 rounded-full"
          >
            {playing ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={skipForward}
            aria-label="Next sentence"
            disabled={index >= lines.length - 1}
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="min-w-14 gap-1 font-bold"
                aria-label={`Playback speed ${speed}x`}
              >
                <Gauge className="h-4 w-4" /> {speed}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SPEEDS.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => changeSpeed(s)}
                  className={cn("font-bold", s === speed && "text-primary")}
                >
                  {s}x
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          Sentence {Math.min(index + 1, lines.length)} of {lines.length}
        </p>
      </div>
    );
  },
);
