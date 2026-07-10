import { useState } from "react";
import { Check, X, RotateCcw, PartyPopper, ArrowRight } from "lucide-react";
import type { QuizItem } from "@/lib/grammar-content";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LessonQuizProps {
  quiz: QuizItem[];
  /** Fired once when the learner finishes a run. */
  onFinish: (result: { score: number; correct: number; total: number }) => void;
  saving?: boolean;
  onContinue?: () => void;
  continueLabel?: string;
}

/** Lesson-ending quiz with instant feedback, explanations, score, and retry. */
export function LessonQuiz({
  quiz,
  onFinish,
  saving,
  onContinue,
  continueLabel = "Continue",
}: LessonQuizProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = quiz.length;
  const q = quiz[index];

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setCorrect(0);
    setFinished(false);
  };

  if (finished) {
    const score = total ? Math.round((correct / total) * 100) : 100;
    const passed = score >= 60;
    return (
      <div className="rounded-2xl border bg-card p-6 text-center">
        <div
          className={cn(
            "mx-auto grid h-16 w-16 place-items-center rounded-full",
            passed ? "bg-gold/20 text-gold-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          <PartyPopper className="h-8 w-8" />
        </div>
        <h3 className="mt-4 font-display text-2xl font-extrabold">
          {passed ? "Quiz complete!" : "Good effort!"}
        </h3>
        <p className="mt-1 text-muted-foreground">
          You scored <span className="font-bold text-foreground">{correct}</span> out of {total}.
        </p>
        <p className={cn("mt-4 font-display text-4xl font-extrabold", passed ? "text-success" : "text-coral")}>
          {score}%
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={restart}>
            <RotateCcw className="h-4 w-4" /> Retry quiz
          </Button>
          {onContinue && (
            <Button variant="hero" onClick={onContinue} disabled={saving}>
              {continueLabel} <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between text-sm font-bold text-muted-foreground">
        <span>Question {index + 1} of {total}</span>
        <span>{Math.round((index / total) * 100)}%</span>
      </div>
      <Progress value={((index + (checked ? 1 : 0)) / total) * 100} className="mt-2 h-2" />

      <h3 className="mt-4 font-display text-lg font-extrabold">{q.question}</h3>
      <div className="mt-3 grid gap-2">
        {q.options.map((opt, i) => {
          const state = checked
            ? i === q.answer
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

      {checked && (
        <div className="mt-3 animate-fade-in rounded-xl border border-border bg-muted/40 p-3 text-sm">
          <p className={cn("font-bold", selected === q.answer ? "text-success" : "text-destructive")}>
            {selected === q.answer ? "Correct!" : `Correct answer: ${q.options[q.answer]}`}
          </p>
          <p className="mt-1 text-muted-foreground">{q.explanation}</p>
        </div>
      )}

      <div className="mt-4">
        {!checked ? (
          <Button
            variant="hero"
            className="w-full"
            disabled={selected === null}
            onClick={() => {
              setChecked(true);
              if (selected === q.answer) setCorrect((c) => c + 1);
            }}
          >
            Check answer
          </Button>
        ) : (
          <Button
            variant="hero"
            className="w-full"
            onClick={() => {
              if (index + 1 < total) {
                setIndex((i) => i + 1);
                setSelected(null);
                setChecked(false);
              } else {
                const finalCorrect = correct;
                setFinished(true);
                onFinish({
                  score: total ? Math.round((finalCorrect / total) * 100) : 100,
                  correct: finalCorrect,
                  total,
                });
              }
            }}
          >
            {index + 1 < total ? "Next question" : "See results"}
          </Button>
        )}
      </div>
    </div>
  );
}
