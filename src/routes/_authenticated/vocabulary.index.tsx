import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Layers,
  Sparkles,
  Star,
  Heart,
  CheckCircle2,
  BookOpen,
  Filter,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StatCard } from "@/components/stat-card";
import { WordCard } from "@/components/vocab/word-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { useAuth } from "@/lib/auth";
import { vocabularyQuery, type Vocabulary } from "@/lib/data";
import {
  VOCAB_CATEGORIES,
  categoryInfo,
  fuzzyMatch,
  userVocabQuery,
  type UserVocabState,
} from "@/lib/vocab";
import { toggleFavorite } from "@/lib/vocab-actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/vocabulary/")({
  component: VocabularyBrowse,
});

const PAGE_SIZE = 24;
type SortKey = "az" | "za" | "difficulty" | "mastery";

function VocabularyBrowse() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: vocab = [], isLoading, isError, refetch } = useQuery(vocabularyQuery());
  const { data: userVocab = [] } = useQuery(userVocabQuery(user?.id));

  const stateMap = useMemo(
    () => new Map(userVocab.map((s) => [s.vocabulary_id, s])),
    [userVocab],
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [favOnly, setFavOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("az");
  const [page, setPage] = useState(0);

  const favMutation = useMutation({
    mutationFn: ({ word, next }: { word: Vocabulary; next: boolean }) =>
      toggleFavorite(user!.id, word.id, next, stateMap.get(word.id)),
    onMutate: async ({ word, next }) => {
      const key = ["user-vocab", user?.id];
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<UserVocabState[]>(key);
      queryClient.setQueryData<UserVocabState[]>(key, (old = []) => {
        const found = old.find((s) => s.vocabulary_id === word.id);
        if (found) return old.map((s) => (s.vocabulary_id === word.id ? { ...s, is_favorite: next } : s));
        return [
          ...old,
          {
            vocabulary_id: word.id,
            ease_factor: 2.5,
            interval_days: 0,
            repetitions: 0,
            due_date: new Date().toISOString().slice(0, 10),
            status: "new",
            is_favorite: next,
            mastery_score: 0,
            review_count: 0,
            correct_count: 0,
          },
        ];
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["user-vocab", user?.id], ctx.prev);
      toast.error("Couldn't update favorite. Please try again.");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["user-vocab", user?.id] }),
  });

  const handleToggleFavorite = (word: Vocabulary, next: boolean) => {
    if (!user) return;
    favMutation.mutate({ word, next });
    toast.success(next ? `Added "${word.word}" to favorites` : `Removed "${word.word}" from favorites`);
  };

  const filtered = useMemo(() => {
    let list = vocab.filter((w) => {
      if (category !== "all" && w.category !== category) return false;
      if (difficulty !== "all" && w.level !== difficulty) return false;
      const st = stateMap.get(w.id);
      if (favOnly && !st?.is_favorite) return false;
      if (status !== "all" && (st?.status ?? "new") !== status) return false;
      if (search.trim()) {
        return (
          fuzzyMatch(w.word, search) ||
          fuzzyMatch(w.translation, search) ||
          w.tags.some((t) => fuzzyMatch(t, search))
        );
      }
      return true;
    });

    const diffRank = { beginner: 0, intermediate: 1, advanced: 2 } as const;
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "az":
          return a.word.localeCompare(b.word);
        case "za":
          return b.word.localeCompare(a.word);
        case "difficulty":
          return diffRank[a.level] - diffRank[b.level] || a.word.localeCompare(b.word);
        case "mastery":
          return (stateMap.get(b.id)?.mastery_score ?? 0) - (stateMap.get(a.id)?.mastery_score ?? 0);
        default:
          return 0;
      }
    });
    return list;
  }, [vocab, category, difficulty, status, favOnly, search, sort, stateMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const learned = userVocab.filter((s) => s.status !== "new").length;
  const mastered = userVocab.filter((s) => s.status === "mastered").length;
  const favorites = userVocab.filter((s) => s.is_favorite).length;

  const resetPage = () => setPage(0);
  const hasActiveFilters = category !== "all" || difficulty !== "all" || status !== "all" || favOnly || !!search.trim();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Vocabulary</h1>
            <p className="text-muted-foreground">
              Master English words with spaced repetition, built for Indonesian learners.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="hero">
              <Link to="/vocabulary/flashcards">
                <Layers className="h-4 w-4" /> Flashcards
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/vocabulary/quiz">
                <Sparkles className="h-4 w-4" /> Quiz
              </Link>
            </Button>
          </div>
        </div>

        {/* Progress stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<BookOpen className="h-5 w-5 text-primary" />} label="Total words" value={vocab.length} />
          <StatCard icon={<Star className="h-5 w-5 text-gold" />} label="Learned" value={learned} />
          <StatCard icon={<CheckCircle2 className="h-5 w-5 text-success" />} label="Mastered" value={mastered} />
          <StatCard icon={<Heart className="h-5 w-5 text-coral" />} label="Favorites" value={favorites} />
        </div>

        {/* Search + filters */}
        <div className="mt-6 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              placeholder="Search words, meanings, or tags…"
              aria-label="Search vocabulary"
              className="pl-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <CategoryChip active={category === "all"} onClick={() => { setCategory("all"); resetPage(); }} label="All" />
            {VOCAB_CATEGORIES.map((c) => (
              <CategoryChip
                key={c.id}
                active={category === c.id}
                onClick={() => { setCategory(c.id); resetPage(); }}
                label={c.label}
                icon={<c.icon className="h-3.5 w-3.5" />}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={difficulty} onValueChange={(v) => { setDifficulty(v); resetPage(); }}>
              <SelectTrigger className="w-[150px]" aria-label="Filter by difficulty">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={(v) => { setStatus(v); resetPage(); }}>
              <SelectTrigger className="w-[150px]" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="mastered">Mastered</SelectItem>
                <SelectItem value="forgotten">Forgotten</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[150px]" aria-label="Sort words">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="az">A → Z</SelectItem>
                <SelectItem value="za">Z → A</SelectItem>
                <SelectItem value="difficulty">By difficulty</SelectItem>
                <SelectItem value="mastery">By mastery</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant={favOnly ? "hero" : "outline"}
              onClick={() => { setFavOnly((f) => !f); resetPage(); }}
              aria-pressed={favOnly}
            >
              <Heart className={cn("h-4 w-4", favOnly && "fill-current")} /> Favorites
            </Button>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setDifficulty("all");
                  setStatus("all");
                  setFavOnly(false);
                  resetPage();
                }}
              >
                <Filter className="h-4 w-4" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : isError ? (
            <Card className="p-4">
              <EmptyState
                icon={<AlertTriangle className="h-6 w-6" />}
                title="Couldn't load vocabulary"
                description="There was a problem reaching the server. Check your connection and try again."
                action={<Button onClick={() => void refetch()}>Retry</Button>}
              />
            </Card>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={favOnly ? <Heart className="h-6 w-6" /> : <Search className="h-6 w-6" />}
              title={favOnly ? "No favorites yet" : "No words found"}
              description={
                favOnly
                  ? "Tap the heart on any word to save it here for quick review."
                  : "Try a different search term, category, or filter."
              }
            />
          ) : (
            <>
              <p className="mb-3 text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "word" : "words"}
                {category !== "all" && ` in ${categoryInfo(category).label}`}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {pageItems.map((w) => (
                  <WordCard
                    key={w.id}
                    word={w}
                    state={stateMap.get(w.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={safePage === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                      >
                        Previous
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <span className="px-3 text-sm font-bold text-muted-foreground">
                        Page {safePage + 1} of {totalPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={safePage >= totalPages - 1}
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      >
                        Next
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
