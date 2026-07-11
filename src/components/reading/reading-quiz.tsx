import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { ReadingQuizItem } from "@/lib/reading-content";
import { cn } from "@/lib/utils";

interface ReadingQuizProps {
  items: ReadingQuizItem[];
  saving?: boolean;
  onFinish: (result: { score: number; correct: number; total: number }) => void;
  onContinue: () => void;
  continueLabel: string;
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/[.,!?;:]/g, "");
}

export function ReadingQuiz({
  items,
  saving,
  onFinish,
  onContinue,
  continueLabel,
}: ReadingQuizProps) {
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  // Per-question working state.
  const [choice, setChoice] = useState<number | null>(null);
  const [boolChoice, setBoolChoice] = useState<boolean | null>(null);
  const [textValue, setTextValue] = useState("");
  const [order, setOrder] = useState<string[]>([]);

  const item = items[step];

  const shuffled = useMemo(() => {
    if (item.kind === "order")
      return [...item.items].sort(() => Math.random() - 0.5);
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const isCorrect = (): boolean => {
    switch (item.kind) {
      case "mcq":
        return choice === item.answer;
      case "true-false":
        return boolChoice === item.answer;
      case "fill-blank":
      case "short-answer": {
        const accepted = [item.answer, ...(item.accept ?? [])].map(normalize);
        return accepted.includes(normalize(textValue));
      }
      case "order":
        return JSON.stringify(order) === JSON.stringify(item.answer);
    }
  };

  const canCheck = (() => {
    switch (item.kind) {
      case "mcq":
        return choice !== null;
      case "true-false":
        return boolChoice !== null;
      case "fill-blank":
      case "short-answer":
        return textValue.trim().length > 0;
      case "order":
        return order.length === item.items.length;
    }
  })();

  const handleCheck = () => {
    if (checked) return;
    setChecked(true);
    if (isCorrect()) setCorrectCount((c) => c + 1);
  };

  const handleNext = () => {
    if (step + 1 >= items.length) {
      setDone(true);
      const score = Math.round((correctCount / items.length) * 100);
      onFinish({ score, correct: correctCount, total: items.length });
      return;
    }
    setStep((s) => s + 1);
    setChecked(false);
    setChoice(null);
    setBoolChoice(null);
    setTextValue("");
    setOrder([]);
  };

  const restart = () => {
    setStep(0);
    setChecked(false);
    setCorrectCount(0);
    setDone(false);
    setChoice(null);
    setBoolChoice(null);
    setTextValue("");
    setOrder([]);
  };

  if (done) {
    const score = Math.round((correctCount / items.length) * 100);
    const passed = score >= 60;
    return (
      <div className="rounded-2xl border bg-card p-6 text-center animate-in fade-in zoom-in-95">
        <span
          className={cn(
            "mx-auto grid h-16 w-16 place-items-center rounded-full",
            passed ? "bg-success/15 text-success" : "bg-coral/15 text-coral",
          )}
        >
          <Trophy className="h-8 w-8" />
        </span>
        <h3 className="mt-3 font-display text-2xl font-extrabold">{score}%</h3>
        <p className="text-muted-foreground">
          {correctCount} of {items.length} correct
          {passed ? " — well done!" : " — keep practising!"}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" onClick={restart} disabled={saving}>
            <RotateCcw className="h-4 w-4" /> Retry
          </Button>
          <Button variant="hero" onClick={onContinue} disabled={saving}>
            {continueLabel}
          </Button>
        </div>
      </div>
    );
  }

  const correct = checked && isCorrect();

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-3 flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span>
          Question {step + 1} / {items.length}
        </span>
        {item.tag && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
            {item.tag}
          </span>
        )}
      </div>
      <Progress value={(step / items.length) * 100} className="mb-4 h-2" />

      <p className="font-bold">{item.question}</p>

      <div className="mt-3 space-y-2">
        {item.kind === "mcq" &&
          item.options.map((opt, i) => (
            <OptionButton
              key={i}
              label={opt}
              selected={choice === i}
              state={
                checked
                  ? i === item.answer
                    ? "correct"
                    : choice === i
                      ? "wrong"
                      : "idle"
                  : "idle"
              }
              disabled={checked}
              onClick={() => setChoice(i)}
            />
          ))}

        {item.kind === "true-false" &&
          [
            { label: "True", val: true },
            { label: "False", val: false },
          ].map(({ label, val }) => (
            <OptionButton
              key={label}
              label={label}
              selected={boolChoice === val}
              state={
                checked
                  ? val === item.answer
                    ? "correct"
                    : boolChoice === val
                      ? "wrong"
                      : "idle"
                  : "idle"
              }
              disabled={checked}
              onClick={() => setBoolChoice(val)}
            />
          ))}

        {(item.kind === "fill-blank" || item.kind === "short-answer") && (
          <Input
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Type your answer…"
            disabled={checked}
            aria-label="Your answer"
            className={cn(
              checked && (correct ? "border-success" : "border-destructive"),
            )}
          />
        )}

        {item.kind === "order" && (
          <OrderPicker
            pool={shuffled}
            order={order}
            disabled={checked}
            onChange={setOrder}
          />
        )}
      </div>

      {checked && (
        <div
          className={cn(
            "mt-3 flex items-start gap-2 rounded-xl p-3 text-sm",
            correct
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {correct ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span className="text-foreground">{item.explanation}</span>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        {checked ? (
          <Button variant="hero" onClick={handleNext} disabled={saving}>
            {step + 1 >= items.length ? "Finish" : "Next"}
          </Button>
        ) : (
          <Button variant="hero" onClick={handleCheck} disabled={!canCheck}>
            Check
          </Button>
        )}
      </div>
    </div>
  );
}

function OptionButton({
  label,
  selected,
  state,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  state: "idle" | "correct" | "wrong";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border-2 px-4 py-2.5 text-left text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        state === "correct" && "border-success bg-success/10 text-success",
        state === "wrong" && "border-destructive bg-destructive/10 text-destructive",
        state === "idle" && selected && "border-primary bg-primary/5",
        state === "idle" && !selected && "border-border hover:border-primary/40",
      )}
    >
      {label}
      {state === "correct" && <CheckCircle2 className="h-4 w-4" />}
      {state === "wrong" && <XCircle className="h-4 w-4" />}
    </button>
  );
}

function OrderPicker({
  pool,
  order,
  disabled,
  onChange,
}: {
  pool: string[];
  order: string[];
  disabled: boolean;
  onChange: (next: string[]) => void;
}) {
  const remaining = pool.filter((p) => !order.includes(p));
  return (
    <div className="space-y-2">
      <div className="min-h-11 rounded-xl border-2 border-dashed border-border p-2">
        <div className="flex flex-wrap gap-1.5">
          {order.length === 0 && (
            <span className="px-1 text-xs text-muted-foreground">
              Tap the sentences below in the correct order.
            </span>
          )}
          {order.map((o, i) => (
            <button
              key={o}
              type="button"
              disabled={disabled}
              onClick={() => onChange(order.filter((x) => x !== o))}
              className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary"
            >
              {i + 1}. {o}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {remaining.map((r) => (
          <button
            key={r}
            type="button"
            disabled={disabled}
            onClick={() => onChange([...order, r])}
            className="rounded-lg border px-2.5 py-1 text-xs font-bold hover:border-primary/40"
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
