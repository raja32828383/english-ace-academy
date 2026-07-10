import { useMemo, useState } from "react";
import { Check, X, RotateCcw, Lightbulb } from "lucide-react";
import type { PracticeExercise } from "@/lib/grammar-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function normalize(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "");
}

function isTextCorrect(value: string, answer: string, accept?: string[]) {
  const v = normalize(value);
  return v === normalize(answer) || (accept ?? []).some((a) => normalize(a) === v);
}

const TYPE_LABEL: Record<PracticeExercise["type"], string> = {
  "multiple-choice": "Multiple Choice",
  "fill-blank": "Fill in the Blank",
  arrange: "Arrange the Words",
  correction: "Correct the Sentence",
  translate: "Translate",
};

/** A single interactive practice exercise with instant feedback. */
function PracticeItem({ ex, index }: { ex: PracticeExercise; index: number }) {
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // multiple choice
  const [selected, setSelected] = useState<number | null>(null);
  // text inputs
  const [text, setText] = useState("");
  // arrange
  const [order, setOrder] = useState<number[]>([]);

  const shuffled = useMemo(() => {
    if (ex.type !== "arrange") return [];
    return ex.words
      .map((w, i) => ({ w, i }))
      .sort(() => Math.random() - 0.5);
  }, [ex]);

  const reset = () => {
    setChecked(false);
    setCorrect(false);
    setSelected(null);
    setText("");
    setOrder([]);
    setShowHint(false);
  };

  const check = () => {
    let ok = false;
    if (ex.type === "multiple-choice") {
      ok = selected === ex.answer;
    } else if (ex.type === "arrange") {
      const built = order.map((i) => ex.words[i]).join(" ");
      ok = normalize(built) === normalize(ex.answer.join(" "));
    } else {
      ok = isTextCorrect(text, ex.answer, "accept" in ex ? ex.accept : undefined);
    }
    setCorrect(ok);
    setChecked(true);
  };

  const canCheck =
    ex.type === "multiple-choice"
      ? selected !== null
      : ex.type === "arrange"
        ? order.length === ex.words.length
        : text.trim().length > 0;

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-primary">
          {index + 1}. {TYPE_LABEL[ex.type]}
        </span>
        {"hint" in ex && ex.hint && !checked && (
          <button
            type="button"
            onClick={() => setShowHint((s) => !s)}
            className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <Lightbulb className="h-3.5 w-3.5" /> Hint
          </button>
        )}
      </div>
      <p className="mt-2 font-semibold">{ex.prompt}</p>
      {showHint && "hint" in ex && ex.hint && (
        <p className="mt-1 text-sm text-muted-foreground">💡 {ex.hint}</p>
      )}

      {/* Answer surface */}
      <div className="mt-3">
        {ex.type === "multiple-choice" && (
          <div className="grid gap-2">
            {ex.options.map((opt, i) => {
              const state = checked
                ? i === ex.answer
                  ? "correct"
                  : i === selected
                    ? "wrong"
                    : "idle"
                : i === selected
                  ? "selected"
                  : "idle";
              return (
                <button
                  key={i}
                  type="button"
                  disabled={checked}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border-2 px-4 py-2.5 text-left font-semibold transition-colors",
                    state === "idle" && "border-border hover:border-primary/50",
                    state === "selected" && "border-primary bg-primary/5",
                    state === "correct" && "border-success bg-success/10 text-success",
                    state === "wrong" && "border-destructive bg-destructive/10 text-destructive",
                  )}
                >
                  {opt}
                  {state === "correct" && <Check className="h-4 w-4" />}
                  {state === "wrong" && <X className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        )}

        {ex.type === "arrange" && (
          <div className="space-y-3">
            <div className="flex min-h-[3rem] flex-wrap gap-2 rounded-xl border-2 border-dashed border-border p-2">
              {order.length === 0 && (
                <span className="px-2 py-1 text-sm text-muted-foreground">Tap the words in order…</span>
              )}
              {order.map((wi, pos) => (
                <button
                  key={`${wi}-${pos}`}
                  type="button"
                  disabled={checked}
                  onClick={() => setOrder((o) => o.filter((_, p) => p !== pos))}
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground"
                >
                  {ex.words[wi]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {shuffled.map(({ w, i }) => (
                <button
                  key={i}
                  type="button"
                  disabled={checked || order.includes(i)}
                  onClick={() => setOrder((o) => [...o, i])}
                  className={cn(
                    "rounded-lg border-2 px-3 py-1.5 text-sm font-bold transition-colors",
                    order.includes(i)
                      ? "border-border/50 bg-muted text-muted-foreground/40"
                      : "border-border bg-background hover:border-primary/50",
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {(ex.type === "fill-blank" || ex.type === "correction" || ex.type === "translate") && (
          <Input
            value={text}
            disabled={checked}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canCheck && !checked) check();
            }}
            placeholder="Type your answer…"
            aria-label="Your answer"
          />
        )}
      </div>

      {/* Feedback */}
      {checked && (
        <div
          className={cn(
            "mt-3 animate-fade-in rounded-xl border p-3 text-sm",
            correct
              ? "border-success/30 bg-success/5"
              : "border-destructive/30 bg-destructive/5",
          )}
        >
          <p className={cn("flex items-center gap-1.5 font-bold", correct ? "text-success" : "text-destructive")}>
            {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {correct ? "Correct!" : "Not quite."}
          </p>
          {!correct && (
            <p className="mt-1 text-muted-foreground">
              <span className="font-bold text-foreground">Answer: </span>
              {ex.type === "arrange" ? ex.answer.join(" ") : ex.answer}
            </p>
          )}
          <p className="mt-1 text-muted-foreground">{ex.explanation}</p>
        </div>
      )}

      <div className="mt-3">
        {!checked ? (
          <Button variant="hero" size="sm" disabled={!canCheck} onClick={check}>
            Check
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Try again
          </Button>
        )}
      </div>
    </div>
  );
}

export function PracticeRunner({ exercises }: { exercises: PracticeExercise[] }) {
  return (
    <div className="space-y-3">
      {exercises.map((ex, i) => (
        <PracticeItem key={i} ex={ex} index={i} />
      ))}
    </div>
  );
}
