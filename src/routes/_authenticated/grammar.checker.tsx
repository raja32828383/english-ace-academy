import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, WandSparkles, Check, X, Sparkles, Info } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/auth";
import {
  checkGrammar,
  saveGrammarCheck,
  type GrammarCheckResult,
} from "@/lib/grammar-checker";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/grammar/checker")({
  component: GrammarCheckerPage,
});

const SEVERITY_TINT: Record<string, string> = {
  error: "border-l-destructive bg-destructive/5",
  warning: "border-l-coral bg-coral/5",
  style: "border-l-primary bg-primary/5",
};

function GrammarCheckerPage() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [result, setResult] = useState<GrammarCheckResult | null>(null);
  const [checking, setChecking] = useState(false);

  const run = async () => {
    if (!text.trim()) return;
    setChecking(true);
    try {
      const res = await checkGrammar(text);
      setResult(res);
      if (user) void saveGrammarCheck(user.id, res).catch(() => {});
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link
          to="/grammar"
          className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Grammar
        </Link>

        <header className="mt-4 flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <WandSparkles className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Grammar Checker</h1>
            <p className="text-muted-foreground">
              Write an English sentence and get instant feedback on common mistakes.
            </p>
          </div>
        </header>

        <Card className="mt-6 p-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a sentence, e.g. she dont like a apple"
            aria-label="Sentence to check"
            className="min-h-28 resize-y"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{text.length} characters</span>
            <Button variant="hero" disabled={!text.trim() || checking} onClick={run}>
              <Sparkles className="h-4 w-4" /> {checking ? "Checking…" : "Check grammar"}
            </Button>
          </div>
        </Card>

        {result && (
          <div className="mt-6 animate-fade-in space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <p className="font-bold">Overall feedback</p>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-extrabold",
                    result.score >= 80
                      ? "bg-success/15 text-success"
                      : result.score >= 50
                        ? "bg-coral/10 text-coral"
                        : "bg-destructive/10 text-destructive",
                  )}
                >
                  {result.score}%
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{result.overallFeedback}</p>
            </Card>

            {result.corrections.length === 0 ? (
              <EmptyState
                icon={<Check className="h-6 w-6" />}
                title="No mistakes found"
                description="Your sentence looks good. Keep practicing to build fluency!"
              />
            ) : (
              <div className="space-y-2">
                {result.corrections.map((c, i) => (
                  <div key={i} className={cn("rounded-xl border-l-4 p-4", SEVERITY_TINT[c.severity])}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                        {c.rule}
                      </span>
                      <span className="text-[11px] font-bold uppercase text-muted-foreground">{c.severity}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 font-semibold text-destructive line-through">
                        <X className="h-3.5 w-3.5" /> {c.original}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-0.5 font-semibold text-success">
                        <Check className="h-3.5 w-3.5" /> {c.suggestion}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{c.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Card className="mt-8 flex items-start gap-3 border-primary/20 bg-primary/5 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            This checker uses fast rule-based analysis today. The architecture is ready for an
            upcoming AI tutor that will explain mistakes in depth and suggest natural rewrites.
          </p>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
