import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw, Volume2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { vocabularyQuery, type Vocabulary } from "@/lib/data";
import { computeNextReview, REVIEW_GRADES, type ReviewState } from "@/lib/srs";
import { recordActivity, grantAchievement } from "@/lib/gamification";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/vocabulary")({
  component: VocabularyPage,
});

interface ReviewRow {
  vocabulary_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_date: string;
}

function VocabularyPage() {
  const { user, stats, refresh } = useAuth();
  const { data: vocab = [], isLoading } = useQuery(vocabularyQuery());
  const { data: reviews = [], refetch } = useQuery({
    queryKey: ["reviews", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flashcard_reviews")
        .select("vocabulary_id, ease_factor, interval_days, repetitions, due_date")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data as ReviewRow[];
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const reviewMap = useMemo(() => new Map(reviews.map((r) => [r.vocabulary_id, r])), [reviews]);

  const dueCards = useMemo(
    () =>
      vocab.filter((v) => {
        const r = reviewMap.get(v.id);
        return !r || r.due_date <= today;
      }),
    [vocab, reviewMap, today],
  );

  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);

  const card = dueCards[pos];

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  };

  const grade = async (quality: number) => {
    if (!user || !card || !stats) return;
    const existing = reviewMap.get(card.id);
    const state: ReviewState = existing
      ? { ease_factor: existing.ease_factor, interval_days: existing.interval_days, repetitions: existing.repetitions }
      : { ease_factor: 2.5, interval_days: 0, repetitions: 0 };
    const next = computeNextReview(state, quality);

    await supabase.from("flashcard_reviews").upsert(
      {
        user_id: user.id,
        vocabulary_id: card.id,
        ease_factor: next.ease_factor,
        interval_days: next.interval_days,
        repetitions: next.repetitions,
        due_date: next.due_date,
        last_reviewed: new Date().toISOString(),
      },
      { onConflict: "user_id,vocabulary_id" },
    );

    await recordActivity(stats, 2);
    const newDone = done + 1;
    setDone(newDone);

    // Word Collector achievement at 50 total reviews
    if (reviews.length + newDone >= 50) {
      const { data: ach } = await supabase.from("achievements").select("id").eq("code", "vocab_50").maybeSingle();
      if (ach) await grantAchievement(user.id, ach.id);
    }

    setFlipped(false);
    if (pos + 1 < dueCards.length) {
      setPos((p) => p + 1);
    } else {
      await Promise.all([refetch(), refresh()]);
      setPos(0);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-xl px-4 py-8">
        <h1 className="font-display text-3xl font-extrabold">Vocabulary flashcards</h1>
        <p className="mt-1 text-muted-foreground">Spaced repetition remembers what you struggle with.</p>

        {isLoading ? (
          <div className="mt-6 space-y-4" aria-hidden="true">
            <Skeleton className="h-2 rounded-full" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : dueCards.length === 0 ? (
          <Card className="mt-8 p-10 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h2 className="mt-4 font-display text-xl font-extrabold">All caught up! 🎉</h2>
            <p className="mt-1 text-muted-foreground">No cards due right now. Come back later for more reviews.</p>
          </Card>
        ) : (
          <>
            <Progress value={(done / (done + dueCards.length)) * 100} className="mt-6 h-2" />
            <p className="mt-2 text-sm font-bold text-muted-foreground">{dueCards.length - pos} cards left</p>

            <Card
              className="mt-4 flex min-h-[16rem] cursor-pointer flex-col items-center justify-center p-8 text-center transition-transform active:scale-[0.99]"
              onClick={() => setFlipped((f) => !f)}
            >
              {!flipped ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">English</p>
                  <p className="mt-2 font-display text-4xl font-extrabold">{card.word}</p>
                  {card.phonetic && <p className="mt-1 text-muted-foreground">{card.phonetic}</p>}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-3"
                    onClick={(e) => { e.stopPropagation(); speak(card.word); }}
                    aria-label="Play pronunciation"
                  >
                    <Volume2 className="h-5 w-5" />
                  </Button>
                  <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground"><RotateCcw className="h-3 w-3" /> Tap to reveal</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Bahasa Indonesia</p>
                  <p className="mt-2 font-display text-3xl font-extrabold text-primary">{card.translation}</p>
                  {card.example && <p className="mt-3 text-sm italic text-muted-foreground">"{card.example}"</p>}
                </>
              )}
            </Card>

            {flipped && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {REVIEW_GRADES.map((g) => (
                  <Button
                    key={g.label}
                    variant={g.variant === "destructive" ? "destructive" : g.variant === "secondary" ? "secondary" : "hero"}
                    onClick={() => void grade(g.quality)}
                    className={cn(g.variant === "secondary" && "bg-success text-success-foreground")}
                  >
                    {g.label}
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
