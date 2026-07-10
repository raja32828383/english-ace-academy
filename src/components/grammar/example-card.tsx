import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CONTEXT_META, type GrammarExample } from "@/lib/grammar-content";
import { cn } from "@/lib/utils";

/**
 * Clickable, expandable example card: shows the English + Indonesian sentence,
 * and reveals the grammar breakdown + highlighted pattern on click.
 */
export function ExampleCard({ example }: { example: GrammarExample }) {
  const [open, setOpen] = useState(false);
  const ctx = CONTEXT_META[example.context];

  return (
    <div className="overflow-hidden rounded-2xl border bg-card transition-colors hover:border-primary/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="mt-0.5 shrink-0 text-lg" aria-hidden="true">
          {ctx.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            {ctx.label}
          </span>
          <p className="font-bold leading-snug">{example.english}</p>
          <p className="text-sm text-muted-foreground">{example.indonesian}</p>
        </div>
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="animate-fade-in border-t bg-muted/40 px-4 py-3">
          {example.pattern && (
            <p className="mb-2 inline-block rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              {example.pattern}
            </p>
          )}
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-bold text-foreground">Breakdown: </span>
            {example.breakdown}
          </p>
        </div>
      )}
    </div>
  );
}
