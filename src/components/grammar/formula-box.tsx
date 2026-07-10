import { Plus } from "lucide-react";
import type { GrammarFormula } from "@/lib/grammar-content";
import { cn } from "@/lib/utils";

/**
 * Highlighted grammar formula box, e.g. Subject + Verb-1 + Object.
 * Each token is rendered as a chip with a "+" connector between them.
 */
export function FormulaBox({ formula, className }: { formula: GrammarFormula; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4",
        className,
      )}
    >
      <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
        {formula.label}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {formula.parts.map((part, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <Plus className="h-3.5 w-3.5 shrink-0 text-primary/60" aria-hidden="true" />}
            <span className="rounded-lg bg-background px-3 py-1.5 text-sm font-bold shadow-sm ring-1 ring-primary/15">
              {part}
            </span>
          </span>
        ))}
      </div>
      {formula.note && (
        <p className="mt-3 text-sm text-muted-foreground">{formula.note}</p>
      )}
    </div>
  );
}
