import { Check, X } from "lucide-react";
import type { GrammarMistake } from "@/lib/grammar-content";

/** Common-mistake card contrasting a wrong and correct sentence with reasons. */
export function MistakeCard({ mistake }: { mistake: GrammarMistake }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-destructive">
            <X className="h-3.5 w-3.5" /> Wrong
          </p>
          <p className="mt-1 font-semibold text-foreground line-through decoration-destructive/50">
            {mistake.wrong}
          </p>
        </div>
        <div className="rounded-xl border border-success/20 bg-success/5 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-success">
            <Check className="h-3.5 w-3.5" /> Correct
          </p>
          <p className="mt-1 font-semibold text-foreground">{mistake.correct}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{mistake.explanation}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        <span className="font-bold text-foreground">Why: </span>
        {mistake.reason}
      </p>
    </div>
  );
}
