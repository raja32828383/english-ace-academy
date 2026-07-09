import { useMemo } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Heart,
  BookOpen,
  Quote,
  ArrowLeftRight,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AudioButton } from "@/components/vocab/audio-button";
import { WordCard } from "@/components/vocab/word-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { vocabularyWordQuery, vocabularyQuery, type Vocabulary } from "@/lib/data";
import {
  categoryInfo,
  DIFFICULTY_META,
  STATUS_META,
  userVocabQuery,
  type UserVocabState,
} from "@/lib/vocab";
import { toggleFavorite } from "@/lib/vocab-actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/vocabulary/$wordId")({
  component: WordDetail,
});

function WordDetail() {
  const { wordId } = Route.useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: word, isLoading, isError, refetch } = useQuery(vocabularyWordQuery(wordId));
  const { data: allVocab = [] } = useQuery(vocabularyQuery());
  const { data: userVocab = [] } = useQuery(userVocabQuery(user?.id));

  const state = userVocab.find((s) => s.vocabulary_id === wordId);
  const related = useMemo(
    () =>
      word
        ? allVocab.filter((w) => w.id !== word.id && w.category === word.category).slice(0, 4)
        : [],
    [allVocab, word],
  );
  const stateMap = useMemo(() => new Map(userVocab.map((s) => [s.vocabulary_id, s])), [userVocab]);

  const favMutation = useMutation({
    mutationFn: ({ next }: { next: boolean }) =>
      toggleFavorite(user!.id, wordId, next, state),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-vocab", user?.id] }),
    onError: () => toast.error("Couldn't update favorite. Please try again."),
  });

  const handleFav = (next: boolean) => {
    favMutation.mutate({ next });
    toast.success(next ? "Added to favorites" : "Removed from favorites");
  };

  const handleRelatedFav = (w: Vocabulary, next: boolean) => {
    toggleFavorite(user!.id, w.id, next, stateMap.get(w.id))
      .then(() => queryClient.invalidateQueries({ queryKey: ["user-vocab", user?.id] }))
      .catch(() => toast.error("Couldn't update favorite."));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => router.history.back()} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        ) : isError ? (
          <Card className="p-4">
            <EmptyState
              icon={<AlertTriangle className="h-6 w-6" />}
              title="Couldn't load this word"
              description="There was a problem reaching the server."
              action={<Button onClick={() => void refetch()}>Retry</Button>}
            />
          </Card>
        ) : !word ? (
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="Word not found"
            description="This word may have been removed."
            action={
              <Button asChild variant="hero">
                <Link to="/vocabulary">Browse vocabulary</Link>
              </Button>
            }
          />
        ) : (
          <>
            <Card className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className={cn("border-0", DIFFICULTY_META[word.level].tint)}>
                      {DIFFICULTY_META[word.level].label}
                    </Badge>
                    <Badge variant="secondary" className={cn("border-0", categoryInfo(word.category).tint)}>
                      {categoryInfo(word.category).label}
                    </Badge>
                    {state && state.status !== "new" && (
                      <Badge variant="secondary" className={cn("border-0", STATUS_META[state.status].tint)}>
                        {STATUS_META[state.status].label}
                      </Badge>
                    )}
                  </div>
                  <h1 className="mt-3 font-display text-4xl font-extrabold">{word.word}</h1>
                  {word.pronunciation && (
                    <p className="mt-1 text-muted-foreground">/{word.pronunciation}/</p>
                  )}
                  {word.part_of_speech && (
                    <p className="text-sm italic text-muted-foreground">{word.part_of_speech}</p>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <AudioButton text={word.word} src={word.audio_url} variant="outline" size={"icon" as never} className="h-11 w-11" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFav(!(state?.is_favorite ?? false))}
                    aria-pressed={state?.is_favorite ?? false}
                    aria-label={state?.is_favorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={cn("h-5 w-5", state?.is_favorite && "fill-coral text-coral")} />
                  </Button>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-primary/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">Bahasa Indonesia</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-primary">{word.translation}</p>
              </div>

              {word.english_definition && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Definition</p>
                  <p className="mt-1">{word.english_definition}</p>
                </div>
              )}

              {word.example && (
                <div className="mt-4 rounded-xl border border-border/60 p-4">
                  <Quote className="h-4 w-4 text-muted-foreground" />
                  <p className="mt-1 italic">"{word.example}"</p>
                  {word.example_translation && (
                    <p className="mt-1 text-sm text-muted-foreground">{word.example_translation}</p>
                  )}
                </div>
              )}
            </Card>

            {/* Synonyms / antonyms */}
            {(word.synonyms.length > 0 || word.antonyms.length > 0) && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {word.synonyms.length > 0 && (
                  <Card className="p-4">
                    <p className="flex items-center gap-1.5 text-sm font-bold">
                      <ArrowLeftRight className="h-4 w-4 text-success" /> Synonyms
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {word.synonyms.map((s) => (
                        <Badge key={s} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </Card>
                )}
                {word.antonyms.length > 0 && (
                  <Card className="p-4">
                    <p className="flex items-center gap-1.5 text-sm font-bold">
                      <Ban className="h-4 w-4 text-destructive" /> Antonyms
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {word.antonyms.map((a) => (
                        <Badge key={a} variant="secondary">{a}</Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Learning progress */}
            <Card className="mt-4 p-5">
              <p className="text-sm font-bold">Your progress</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Mastery</span>
                <span className="font-bold">{state?.mastery_score ?? 0}%</span>
              </div>
              <Progress value={state?.mastery_score ?? 0} className="mt-2 h-3" />
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="font-display text-lg font-extrabold">{state?.review_count ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="font-display text-lg font-extrabold">{state?.repetitions ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="font-display text-lg font-extrabold">
                    {STATUS_META[state?.status ?? "new"].label}
                  </p>
                  <p className="text-xs text-muted-foreground">Status</p>
                </div>
              </div>
              <Button asChild variant="hero" className="mt-4 w-full">
                <Link to="/vocabulary/flashcards">Practice with flashcards</Link>
              </Button>
            </Card>

            {/* Related words */}
            {related.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-xl font-extrabold">Related words</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {related.map((w) => (
                    <WordCard key={w.id} word={w} state={stateMap.get(w.id)} onToggleFavorite={handleRelatedFav} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
