import { Check, X, Minus, Plus, RotateCcw, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { encouragementFor, type PronunciationScore } from "@/lib/pronunciation";

/** Per-sentence feedback: word breakdown, missing/extra words, suggestions. */
export function FeedbackCard({
  score,
  expected,
  onRetry,
  onNext,
  isLast,
}: {
  score: PronunciationScore;
  expected: string;
  onRetry: () => void;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <Card className="pop-in p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Feedback
        </p>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-sm font-extrabold",
            score.overall >= 75
              ? "bg-success/15 text-success"
              : score.overall >= 50
                ? "bg-gold/15 text-gold-foreground"
                : "bg-coral/15 text-coral",
          )}
        >
          {score.overall}%
        </span>
      </div>

      {/* Word-by-word comparison */}
      <p className="mt-3 flex flex-wrap gap-x-1.5 gap-y-1 text-base leading-relaxed">
        {score.wordResults
          .filter((w) => w.status !== "extra")
          .map((w, i) => (
            <span
              key={i}
              className={cn(
                "font-bold",
                w.status === "correct" && "text-success",
                w.status === "incorrect" && "text-coral underline decoration-wavy",
                w.status === "missing" && "text-muted-foreground line-through",
              )}
              title={w.heard ? `You said: ${w.heard}` : undefined}
            >
              {w.word}
            </span>
          ))}
      </p>

      {/* Sub-scores */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="Pronunciation" value={score.pronunciation} />
        <Metric label="Accuracy" value={score.sentenceAccuracy} />
        <Metric label="Fluency" value={score.fluency} />
        <Metric label="Completeness" value={score.completeness} />
      </div>

      {/* Word buckets */}
      <div className="mt-4 space-y-1.5 text-sm">
        {score.correctWords.length > 0 && (
          <WordRow icon={<Check className="h-4 w-4 text-success" />} label="Correct" words={score.correctWords} />
        )}
        {score.incorrectWords.length > 0 && (
          <WordRow icon={<X className="h-4 w-4 text-coral" />} label="Improve" words={score.incorrectWords} />
        )}
        {score.missingWords.length > 0 && (
          <WordRow icon={<Minus className="h-4 w-4 text-muted-foreground" />} label="Missing" words={score.missingWords} />
        )}
        {score.extraWords.length > 0 && (
          <WordRow icon={<Plus className="h-4 w-4 text-muted-foreground" />} label="Extra" words={score.extraWords} />
        )}
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-sm font-medium text-foreground">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        {encouragementFor(score.overall)}
      </p>

      <div className="mt-4 flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>
        <Button type="button" variant="hero" className="flex-1" onClick={onNext}>
          {isLast ? "Finish" : "Next"}
        </Button>
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-muted/50 p-2 text-center">
      <p className="font-display text-lg font-extrabold">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function WordRow({ icon, label, words }: { icon: React.ReactNode; label: string; words: string[] }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p>
        <span className="font-bold">{label}: </span>
        <span className="text-muted-foreground">{words.join(", ")}</span>
      </p>
    </div>
  );
}
