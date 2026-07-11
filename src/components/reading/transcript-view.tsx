import { AudioButton } from "@/components/vocab/audio-button";
import type { TranscriptLine } from "@/lib/reading-content";
import { cn } from "@/lib/utils";

interface TranscriptViewProps {
  lines: TranscriptLine[];
  activeIndex: number;
  onJump: (index: number) => void;
  showTranslation: boolean;
}

/**
 * Transcript with auto-highlight of the current sentence, click-to-jump, and
 * optional Indonesian translation. Syncs with the audio player via activeIndex.
 */
export function TranscriptView({
  lines,
  activeIndex,
  onJump,
  showTranslation,
}: TranscriptViewProps) {
  return (
    <ol className="space-y-1.5">
      {lines.map((line, i) => {
        const active = i === activeIndex;
        return (
          <li key={i}>
            <div
              className={cn(
                "group flex items-start gap-2 rounded-xl border p-2.5 transition-colors",
                active
                  ? "border-primary/40 bg-primary/10"
                  : "border-transparent hover:bg-muted/60",
              )}
            >
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-label={`Jump to sentence ${i + 1}`}
                aria-current={active ? "true" : undefined}
                className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
              >
                {line.speaker && (
                  <span className="mr-1.5 text-xs font-extrabold text-primary">
                    {line.speaker}:
                  </span>
                )}
                <span
                  className={cn(
                    "text-[0.95rem] leading-relaxed",
                    active && "font-bold",
                  )}
                >
                  {line.text}
                </span>
                {showTranslation && (
                  <span className="mt-0.5 block text-sm italic text-muted-foreground">
                    {line.translation}
                  </span>
                )}
              </button>
              <AudioButton
                text={line.text}
                size="sm"
                className="shrink-0 opacity-60 group-hover:opacity-100"
                label={`Play sentence ${i + 1}`}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
