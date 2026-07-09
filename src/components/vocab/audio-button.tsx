import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, Loader2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AudioState = "idle" | "loading" | "playing" | "error";

interface AudioButtonProps {
  /** Text spoken via the Web Speech API when no audio file exists. */
  text: string;
  /** Optional pre-recorded / future AI-generated audio file URL. */
  src?: string | null;
  size?: "sm" | "default" | "lg";
  variant?: "ghost" | "outline" | "secondary";
  className?: string;
  label?: string;
}

/**
 * Pronunciation player with loading, playback animation, and error handling.
 * Prefers a real audio file (`src`) and falls back to browser speech synthesis.
 * Architected so future AI-generated pronunciation just fills in `src`.
 */
export function AudioButton({
  text,
  src,
  size = "icon" as never,
  variant = "ghost",
  className,
  label,
}: AudioButtonProps & { size?: "sm" | "default" | "lg" | "icon" }) {
  const [state, setState] = useState<AudioState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
      audioRef.current?.pause();
    };
  }, []);

  const play = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (src) {
        setState("loading");
        const audio = new Audio(src);
        audioRef.current = audio;
        audio.onplaying = () => setState("playing");
        audio.onended = () => setState("idle");
        audio.onerror = () => setState("error");
        audio.play().catch(() => setState("error"));
        return;
      }

      if (typeof window === "undefined" || !window.speechSynthesis) {
        setState("error");
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "en-US";
        u.rate = 0.95;
        u.onstart = () => setState("playing");
        u.onend = () => setState("idle");
        u.onerror = () => setState("error");
        setState("loading");
        window.speechSynthesis.speak(u);
      } catch {
        setState("error");
      }
    },
    [src, text],
  );

  const Icon = state === "loading" ? Loader2 : state === "error" ? VolumeX : Volume2;

  return (
    <Button
      type="button"
      variant={variant}
      size={size as never}
      onClick={play}
      aria-label={label ?? `Play pronunciation of ${text}`}
      title={state === "error" ? "Audio unavailable — tap to retry" : "Play pronunciation"}
      className={cn(
        state === "playing" && "text-primary",
        state === "error" && "text-destructive",
        className,
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5",
          state === "loading" && "animate-spin",
          state === "playing" && "animate-pulse",
        )}
      />
      {size !== ("icon" as never) && <span className="ml-1">{label ?? "Listen"}</span>}
    </Button>
  );
}
