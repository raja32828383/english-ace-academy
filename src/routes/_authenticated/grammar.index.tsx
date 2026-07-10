import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  X,
  BookOpen,
  CheckCircle2,
  Target,
  Clock,
  Bookmark,
  ArrowRight,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StatCard } from "@/components/stat-card";
import { GrammarLessonCard } from "@/components/grammar/grammar-lesson-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import {
  GRAMMAR_LESSONS,
  GRAMMAR_LEVELS,
  GRAMMAR_UNITS,
  LEVEL_META,
  lessonsForUnit,
  type GrammarLesson,
  type GrammarLevel,
} from "@/lib/grammar-content";
import {
  grammarBookmarksQuery,
  grammarProgressQuery,
  computeGrammarStats,
  recommendedGrammarLesson,
  type GrammarBookmarkRow,
} from "@/lib/grammar";
import { toggleGrammarBookmark } from "@/lib/grammar-actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/grammar/")({
  component: GrammarHub,
});

function GrammarHub() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: progress = [] } = useQuery(grammarProgressQuery(user?.id));
  const { data: bookmarks = [] } = useQuery(grammarBookmarksQuery(user?.id));

  const progressMap = useMemo(
    () => new Map(progress.map((p) => [p.lesson_slug, p])),
    [progress],
  );
  const bookmarkSet = useMemo(
    () => new Set(bookmarks.map((b) => b.lesson_slug)),
    [bookmarks],
  );

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<GrammarLevel | "all">("all");

  const stats = computeGrammarStats(progress);
  const recommended = recommendedGrammarLesson(progress);

  const bookmarkMutation = useMutation({
    mutationFn: ({ lesson, next }: { lesson: GrammarLesson; next: boolean }) =>
      toggleGrammarBookmark(user!.id, lesson.slug, next),
    onMutate: async ({ lesson, next }) => {
      const key = ["grammar-bookmarks", user?.id];
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<GrammarBookmarkRow[]>(key);
      queryClient.setQueryData<GrammarBookmarkRow[]>(key, (old = []) =>
        next
          ? [{ lesson_slug: lesson.slug, created_at: new Date().toISOString() }, ...old]
          : old.filter((b) => b.lesson_slug !== lesson.slug),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["grammar-bookmarks", user?.id], ctx.prev);
      toast.error("Couldn't update bookmark. Please try again.");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["grammar-bookmarks", user?.id] }),
  });

  const handleToggleBookmark = (lesson: GrammarLesson, next: boolean) => {
    if (!user) return;
    bookmarkMutation.mutate({ lesson, next });
    toast.success(next ? `Bookmarked "${lesson.title}"` : `Removed "${lesson.title}"`);
  };

  const q = search.trim().toLowerCase();
  const matches = (l: GrammarLesson) =>
    !q ||
    l.title.toLowerCase().includes(q) ||
    l.summary.toLowerCase().includes(q) ||
    l.content.objectives.some((o) => o.toLowerCase().includes(q));

  const searchResults = q ? GRAMMAR_LESSONS.filter(matches) : [];
  const bookmarkedLessons = GRAMMAR_LESSONS.filter((l) => bookmarkSet.has(l.slug));

  const visibleLevels = level === "all" ? GRAMMAR_LEVELS : [level];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Grammar</h1>
            <p className="text-muted-foreground">
              Clear, structured English grammar — explained in English and Indonesian.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/grammar/checker">
              <WandSparkles className="h-4 w-4" /> Grammar Checker
            </Link>
          </Button>
        </div>

        {/* Continue banner */}
        <Card className="mt-6 flex flex-col gap-4 overflow-hidden p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              {stats.completed > 0 ? "Continue where you left off" : "Start learning"}
            </p>
            <h2 className="mt-1 truncate font-display text-xl font-extrabold">{recommended.title}</h2>
            <p className="truncate text-sm text-muted-foreground">{recommended.summary}</p>
          </div>
          <Button asChild variant="hero" className="shrink-0">
            <Link to="/grammar/$lessonId" params={{ lessonId: recommended.slug }}>
              {stats.completed > 0 ? "Continue" : "Start"} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<BookOpen className="h-5 w-5 text-primary" />} label="Lessons" value={stats.totalLessons} />
          <StatCard icon={<CheckCircle2 className="h-5 w-5 text-success" />} label="Completed" value={stats.completed} />
          <StatCard icon={<Target className="h-5 w-5 text-coral" />} label="Avg. score" value={stats.averageScore != null ? `${stats.averageScore}%` : "—"} />
          <StatCard icon={<Clock className="h-5 w-5 text-gold" />} label="Time" value={`${stats.totalMinutes}m`} />
        </div>

        <Card className="mt-4 p-5">
          <div className="flex items-center justify-between text-sm font-bold">
            <span>Grammar mastery</span>
            <span className="text-muted-foreground">{stats.masteryPct}%</span>
          </div>
          <Progress value={stats.masteryPct} className="mt-2 h-3" />
        </Card>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons, topics, or grammar rules…"
            aria-label="Search grammar lessons"
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

        {q ? (
          <div className="mt-6">
            <p className="mb-3 text-sm text-muted-foreground">
              {searchResults.length} result{searchResults.length === 1 ? "" : "s"} for "{search}"
            </p>
            {searchResults.length === 0 ? (
              <EmptyState
                icon={<Search className="h-6 w-6" />}
                title="No lessons found"
                description="Try a different topic, tense, or grammar term."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((l) => (
                  <GrammarLessonCard
                    key={l.slug}
                    lesson={l}
                    progress={progressMap.get(l.slug)}
                    bookmarked={bookmarkSet.has(l.slug)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <Tabs defaultValue="curriculum" className="mt-6">
            <TabsList>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="bookmarks">
                Bookmarks {bookmarkedLessons.length > 0 && `(${bookmarkedLessons.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum" className="mt-4">
              {/* Level filter */}
              <div className="mb-5 flex flex-wrap gap-2">
                <LevelChip active={level === "all"} onClick={() => setLevel("all")} label="All levels" />
                {GRAMMAR_LEVELS.map((lv) => (
                  <LevelChip key={lv} active={level === lv} onClick={() => setLevel(lv)} label={LEVEL_META[lv].label} />
                ))}
              </div>

              <div className="space-y-8">
                {visibleLevels.map((lv) => {
                  const units = GRAMMAR_UNITS.filter((u) => u.level === lv);
                  if (units.length === 0) return null;
                  return (
                    <section key={lv}>
                      <div className="mb-3 flex items-center gap-3">
                        <span className={cn("rounded-full px-3 py-1 text-sm font-extrabold", LEVEL_META[lv].tint)}>
                          {LEVEL_META[lv].label}
                        </span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="space-y-6">
                        {units.map((unit) => {
                          const lessons = lessonsForUnit(unit.slug);
                          if (lessons.length === 0) return null;
                          const UnitIcon = unit.icon;
                          return (
                            <div key={unit.slug}>
                              <div className="mb-3 flex items-start gap-3">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                                  <UnitIcon className="h-5 w-5" />
                                </span>
                                <div>
                                  <h3 className="font-display text-lg font-extrabold leading-tight">{unit.title}</h3>
                                  <p className="text-sm text-muted-foreground">{unit.description}</p>
                                </div>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {lessons.map((l) => (
                                  <GrammarLessonCard
                                    key={l.slug}
                                    lesson={l}
                                    progress={progressMap.get(l.slug)}
                                    bookmarked={bookmarkSet.has(l.slug)}
                                    onToggleBookmark={handleToggleBookmark}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="bookmarks" className="mt-4">
              {bookmarkedLessons.length === 0 ? (
                <EmptyState
                  icon={<Bookmark className="h-6 w-6" />}
                  title="No bookmarks yet"
                  description="Tap the bookmark icon on any lesson to save it here for later."
                  action={
                    <Button asChild variant="hero">
                      <Link to="/grammar/$lessonId" params={{ lessonId: recommended.slug }}>Browse lessons</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {bookmarkedLessons.map((l) => (
                    <GrammarLessonCard
                      key={l.slug}
                      lesson={l}
                      progress={progressMap.get(l.slug)}
                      bookmarked
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        <Card className="mt-8 flex flex-col gap-3 border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h3 className="font-bold">Practice with the Grammar Checker</h3>
              <p className="text-sm text-muted-foreground">
                Type any sentence and get instant feedback on common mistakes.
              </p>
            </div>
          </div>
          <Button asChild variant="hero" className="shrink-0">
            <Link to="/grammar/checker">Try it</Link>
          </Button>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}

function LevelChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
