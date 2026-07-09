import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Shuffle,
  Heart,
  CheckCircle2,
  RotateCcw,
  Layers,
  Clock,
  Target,
  Star,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { AudioButton } from "@/components/vocab/audio-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { vocabularyQuery, type Vocabulary } from "@/lib/data";
import { REVIEW_GRADES } from "@/lib/srs";
import {
  userVocabQuery,
  categoryInfo,
  DIFFICULTY_META,
  type UserVocabState,
} from "@/lib/vocab";
import { gradeWord, toggleFavorite } from "@/lib/vocab-actions";
import { recordActivity, grantAchievement } from "@/lib/gamification";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/vocabulary/flashcards")({
  component: FlashcardsPage,
});

type Scope = "due" | "new" | "favorites" | "all";
type Phase = "setup" | "running" | "summary";
const XP_PER_CARD = 2;

function FlashcardsPage() {
  const { user, stats, refresh } = useAuth();
  const queryClient = useQueryClient();
  const { data: vocab = [], isLoading } = useQuery(vocabularyQuery());
  const { data: userVocab = [] } = useQuery(userVocabQuery(user?.id));

  const stateMap = useMemo(() => new Map(userVocab.map((s) => [s.vocabulary_id, s])), [userVocab]);
  const today = new Date().toISOString().slice(0, 10);

  const [phase, setPhase] = useState<Phase>("setup");
  const [scope, setScope] = useState<Scope>("due");
  const [size, setSize] = useState(10);
  const [deck, setDeck] = useState<Vocabulary[]>([]);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [xp, setXp] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [favState, setFavState] = useState(false);

  const pool = useMemo(() => {
    return vocab.filter((v) => {
      const s = stateMap.get(v.id);
      if (scope === "favorites") return s?.is_favorite;
      if (scope === "new") return !s || s.status === "new";
      if (scope === "due") return !s || s.due_date <= today;
      return true;
    });
  }, [vocab, stateMap, scope, today]);

  const card = deck[pos];

  useEffect(() => {
    if (card) setFavState(stateMap.get(card.id)?.is_favorite ?? false);
  }, [card, stateMap]);

  const start = () => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, size);
    if (shuffled.length === 0) {
      toast.error("No cards available for this selection.");
      return;
    }
    setDeck(shuffled);
    setPos(0);
    setFlipped(false);
    setCorrect(0);
    setReviewed(0);
    setXp(0);
    setStartedAt(Date.now());
    setPhase("running");
  };

  const advance = async () => {
    setFlipped(false);
    if (pos + 1 < deck.length) {
      setPos((p) => p + 1);
    } else {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user-vocab", user?.id] }),
        refresh(),
      ]);
      setPhase("summary");
    }
  };

  const grade = async (quality: number) => {
    if (!user || !card || !stats) return;
    try {
      await gradeWord(user.id, card.id, quality, stateMap.get(card.id));
      await recordActivity(stats, XP_PER_CARD);
      const nextReviewed = reviewed + 1;
      setReviewed(nextReviewed);
      setXp((x) => x + XP_PER_CARD);
      if (quality >= 3) setCorrect((c) => c + 1);

      if (userVocab.length + nextReviewed >= 50) {
        const { data: ach } = await supabase
          .from("achievements")
          .select("id")
          .eq("code", "vocab_50")
          .maybeSingle();
        if (ach) await grantAchievement(user.id, ach.id);
      }
      await advance();
    } catch {
      toast.error("Couldn't save your review. Please try again.");
    }
  };

  const handleFavorite = async () => {
    if (!user || !card) return;
    const next = !favState;
    setFavState(next);
    try {
      await toggleFavorite(user.id, card.id, next, stateMap.get(card.id));
      queryClient.invalidateQueries({ queryKey: ["user-vocab", user?.id] });
    } catch {
      setFavState(!next);
      toast.error("Couldn't update favorite.");
    }
  };

  const shuffleDeck = () => {
    setDeck((d) => [...d].sort(() => Math.random() - 0.5));
    setPos(0);
    setFlipped(false);
    toast.success("Deck shuffled");
  };

  const elapsed = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
  const accuracy = reviewed ? Math.round((correct / reviewed) * 100) : 0;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold">Flashcards</h1>
            <p className="text-sm text-muted-foreground">Spaced repetition remembers what you struggle with.</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/vocabulary">
              <ArrowLeft className="h-4 w-4" /> Browse
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : phase === "setup" ? (
          <Card className="mt-6 p-6">
            <p className="text-sm font-bold">What would you like to study?</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(
                [
                  { id: "due", label: "Due for review" },
                  { id: "new", label: "New words" },
                  { id: "favorites", label: "Favorites" },
                  { id: "all", label: "All words" },
                ] as { id: Scope; label: string }[]
              ).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setScope(o.id)}
                  aria-pressed={scope === o.id}
                  className={cn(
                    "rounded-xl border p-3 text-left text-sm font-bold transition-colors",
                    scope === o.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <p className="mt-5 text-sm font-bold">Session size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[10, 20, 50].map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={size === n ? "hero" : "outline"}
                  onClick={() => setSize(n)}
                >
                  {n} words
                </Button>
              ))}
              <input
                type="number"
                min={1}
                max={200}
                value={size}
                onChange={(e) => setSize(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
                aria-label="Custom session size"
                className="w-24 rounded-lg border border-border bg-background px-3 text-sm"
              />
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {pool.length} words match this selection.
            </p>
            <Button variant="hero" className="mt-4 w-full" onClick={start} disabled={pool.length === 0}>
              <Layers className="h-4 w-4" /> Start session
            </Button>
          </Card>
        ) : phase === "summary" ? (
          <Card className="mt-6 animate-scale-in p-8 text-center">
            <Trophy className="mx-auto h-14 w-14 text-gold" />
            <h2 className="mt-4 font-display text-2xl font-extrabold">Session complete! 🎉</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
              <SummaryStat icon={<CheckCircle2 className="h-4 w-4 text-success" />} label="Words" value={`${reviewed}`} />
              <SummaryStat icon={<Target className="h-4 w-4 text-primary" />} label="Accuracy" value={`${accuracy}%`} />
              <SummaryStat icon={<Clock className="h-4 w-4 text-coral" />} label="Time" value={`${elapsed}s`} />
              <SummaryStat icon={<Star className="h-4 w-4 text-gold" />} label="XP" value={`+${xp}`} />
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button variant="hero" className="flex-1" onClick={() => setPhase("setup")}>
                Study again
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/vocabulary">Back to vocabulary</Link>
              </Button>
            </div>
          </Card>
        ) : card ? (
          <>
            <div className="mt-6 flex items-center justify-between text-sm font-bold text-muted-foreground">
              <span>
                Card {pos + 1} of {deck.length}
              </span>
              <span className="flex items-center gap-1 text-gold">
                <Star className="h-4 w-4" /> +{xp} XP
              </span>
            </div>
            <Progress value={((pos + (flipped ? 0.5 : 0)) / deck.length) * 100} className="mt-2 h-2" />

            {/* Flip card */}
            <div className="mt-4 flip-perspective">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setFlipped((f) => !f)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setFlipped((f) => !f);
                  }
                }}
                aria-label="Flip card"
                className={cn(
                  "flip-inner min-h-[18rem] cursor-pointer",
                  flipped && "flip-inner-flipped",
                )}
              >
                {/* Front */}
                <Card className="flip-face flex min-h-[18rem] flex-col items-center justify-center p-8 text-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn("border-0", DIFFICULTY_META[card.level].tint)}>
                      {DIFFICULTY_META[card.level].label}
                    </Badge>
                    <Badge variant="secondary" className={cn("border-0", categoryInfo(card.category).tint)}>
                      {categoryInfo(card.category).label}
                    </Badge>
                  </div>
                  <p className="mt-4 font-display text-4xl font-extrabold">{card.word}</p>
                  {card.pronunciation && <p className="mt-1 text-muted-foreground">/{card.pronunciation}/</p>}
                  <AudioButton text={card.word} src={card.audio_url} size={"icon" as never} className="mt-3" />
                  <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                    <RotateCcw className="h-3 w-3" /> Tap to reveal
                  </p>
                </Card>
                {/* Back */}
                <Card className="flip-face flip-face-back flex min-h-[18rem] flex-col items-center justify-center p-8 text-center">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Bahasa Indonesia</p>
                  <p className="mt-2 font-display text-3xl font-extrabold text-primary">{card.translation}</p>
                  {card.part_of_speech && <p className="mt-1 text-sm italic text-muted-foreground">{card.part_of_speech}</p>}
                  {card.example && <p className="mt-3 text-sm italic text-muted-foreground">"{card.example}"</p>}
                  {card.example_translation && (
                    <p className="mt-1 text-xs text-muted-foreground">{card.example_translation}</p>
                  )}
                </Card>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setFlipped(false);
                  setPos((p) => Math.max(0, p - 1));
                }}
                disabled={pos === 0}
                aria-label="Previous card"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={handleFavorite} aria-label="Toggle favorite" aria-pressed={favState}>
                  <Heart className={cn("h-5 w-5", favState && "fill-coral text-coral")} />
                </Button>
                <Button variant="ghost" size="icon" onClick={shuffleDeck} aria-label="Shuffle deck">
                  <Shuffle className="h-5 w-5" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={advance}
                aria-label="Skip to next card"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Grade buttons (after flip) */}
            {flipped ? (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {REVIEW_GRADES.map((g) => (
                  <Button
                    key={g.label}
                    variant={g.variant === "destructive" ? "destructive" : g.variant === "secondary" ? "secondary" : "hero"}
                    onClick={() => void grade(g.quality)}
                    className={cn(g.variant === "secondary" && "bg-success text-success-foreground hover:bg-success/90")}
                  >
                    {g.label}
                  </Button>
                ))}
              </div>
            ) : (
              <Button variant="secondary" className="mt-4 w-full" onClick={() => void grade(4)}>
                <CheckCircle2 className="h-4 w-4" /> Mark learned
              </Button>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}

function SummaryStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-1 font-display text-xl font-extrabold">{value}</p>
    </div>
  );
}
