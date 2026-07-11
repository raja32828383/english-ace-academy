import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  X,
  BookOpenText,
  CheckCircle2,
  Headphones,
  Clock,
  Bookmark,
  ArrowRight,
  StickyNote,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StatCard } from "@/components/stat-card";
import { ReadingLessonCard } from "@/components/reading/reading-lesson-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import {
  READING_LESSONS,
  READING_LEVELS,
  LEVEL_META,
  CATEGORY_META,
  lessonsForLevel,
  usedCategories,
  type ReadingLesson,
  type ReadingLevel,
  type ReadingCategory,
} from "@/lib/reading-content";
import {
  readingBookmarksQuery,
  readingProgressQuery,
  readingNotesQuery,
  computeReadingStats,
  recommendedReadingLesson,
  type ReadingBookmarkRow,
} from "@/lib/reading";
import { toggleReadingBookmark, deleteReadingNote } from "@/lib/reading-actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/lab/")({
  component: LabHub,
});

function LabHub() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: progress = [] } = useQuery(readingProgressQuery(user?.id));
  const { data: bookmarks = [] } = useQuery(readingBookmarksQuery(user?.id));
  const { data: notes = [] } = useQuery(readingNotesQuery(user?.id));

  const progressMap = useMemo(
    () => new Map(progress.map((p) => [p.lesson_slug, p])),
    [progress],
  );
  const bookmarkSet = useMemo(
    () => new Set(bookmarks.map((b) => b.lesson_slug)),
    [bookmarks],
  );
  const lessonTitle = useMemo(
    () => new Map(READING_LESSONS.map((l) => [l.slug, l.title])),
    [],
  );

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<ReadingLevel | "all">("all");
  const [category, setCategory] = useState<ReadingCategory | "all">("all");

  const stats = computeReadingStats(progress);
  const recommended = recommendedReadingLesson(progress);

  const bookmarkMutation = useMutation({
    mutationFn: ({ lesson, next }: { lesson: ReadingLesson; next: boolean }) =>
      toggleReadingBookmark(user!.id, lesson.slug, next),
    onMutate: async ({ lesson, next }) => {
      const key = ["reading-bookmarks", user?.id];
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<ReadingBookmarkRow[]>(key);
      queryClient.setQueryData<ReadingBookmarkRow[]>(key, (old = []) =>
        next
          ? [{ lesson_slug: lesson.slug, created_at: new Date().toISOString() }, ...old]
          : old.filter((b) => b.lesson_slug !== lesson.slug),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(["reading-bookmarks", user?.id], ctx.prev);
      toast.error("Couldn't update bookmark. Please try again.");
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["reading-bookmarks", user?.id] }),
  });

  const handleToggleBookmark = (lesson: ReadingLesson, next: boolean) => {
    if (!user) return;
    bookmarkMutation.mutate({ lesson, next });
    toast.success(next ? `Bookmarked "${lesson.title}"` : `Removed "${lesson.title}"`);
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteReadingNote(id);
      await queryClient.invalidateQueries({ queryKey: ["reading-notes", user?.id] });
    } catch {
      toast.error("Couldn't delete note.");
    }
  };

  const q = search.trim().toLowerCase();
  const matches = (l: ReadingLesson) => {
    if (level !== "all" && l.level !== level) return false;
    if (category !== "all" && l.category !== category) return false;
    if (!q) return true;
    return (
      l.title.toLowerCase().includes(q) ||
      l.summary.toLowerCase().includes(q) ||
      l.topic.toLowerCase().includes(q) ||
      CATEGORY_META[l.category].label.toLowerCase().includes(q)
    );
  };

  const filtered = READING_LESSONS.filter(matches);
  const bookmarkedLessons = READING_LESSONS.filter((l) => bookmarkSet.has(l.slug));
  const visibleLevels = level === "all" ? READING_LEVELS : [level];
  const cats = usedCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
            Reading &amp; Listening Lab
          </h1>
          <p className="text-muted-foreground">
            Read, listen, and learn with synced audio, vocabulary, and grammar highlights.
          </p>
        </div>

        {/* Continue banner */}
        <Card className="mt-6 flex flex-col gap-4 overflow-hidden p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              {stats.completed > 0 ? "Continue where you left off" : "Start learning"}
            </p>
            <h2 className="mt-1 truncate font-display text-xl font-extrabold">
              {recommended.title}
            </h2>
            <p className="truncate text-sm text-muted-foreground">{recommended.summary}</p>
          </div>
          <Button asChild variant="hero" className="shrink-0">
            <Link to="/lab/$lessonId" params={{ lessonId: recommended.slug }}>
              {stats.completed > 0 ? "Continue" : "Start"} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<CheckCircle2 className="h-5 w-5 text-success" />} label="Completed" value={`${stats.completed}/${stats.totalLessons}`} />
          <StatCard icon={<BookOpenText className="h-5 w-5 text-primary" />} label="Reading" value={`${stats.readingMinutes}m`} />
          <StatCard icon={<Headphones className="h-5 w-5 text-coral" />} label="Listening" value={`${stats.listeningMinutes}m`} />
          <StatCard icon={<Clock className="h-5 w-5 text-gold" />} label="Avg. score" value={stats.averageScore != null ? `${stats.averageScore}%` : "—"} />
        </div>

        <Card className="mt-4 p-5">
          <div className="flex items-center justify-between text-sm font-bold">
            <span>Lab progress</span>
            <span className="text-muted-foreground">{stats.completionPct}%</span>
          </div>
          <Progress value={stats.completionPct} className="mt-2 h-3" />
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span>Reading accuracy: <strong className="text-foreground">{stats.readingAccuracy != null ? `${stats.readingAccuracy}%` : "—"}</strong></span>
            <span>Listening accuracy: <strong className="text-foreground">{stats.listeningAccuracy != null ? `${stats.listeningAccuracy}%` : "—"}</strong></span>
          </div>
        </Card>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons, topics, or categories…"
            aria-label="Search Lab lessons"
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

        <Tabs defaultValue="lessons" className="mt-6">
          <TabsList>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="bookmarks">
              Bookmarks {bookmarkedLessons.length > 0 && `(${bookmarkedLessons.length})`}
            </TabsTrigger>
            <TabsTrigger value="notes">
              Notes {notes.length > 0 && `(${notes.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="mt-4">
            {/* Filters */}
            <div className="mb-3 flex flex-wrap gap-2">
              <Chip active={level === "all"} onClick={() => setLevel("all")} label="All levels" />
              {READING_LEVELS.map((lv) => (
                <Chip key={lv} active={level === lv} onClick={() => setLevel(lv)} label={LEVEL_META[lv].label} />
              ))}
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              <Chip active={category === "all"} onClick={() => setCategory("all")} label="All topics" />
              {cats.map((c) => (
                <Chip key={c} active={category === c} onClick={() => setCategory(c)} label={CATEGORY_META[c].label} />
              ))}
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon={<Search className="h-6 w-6" />}
                title="No lessons found"
                description="Try a different level, topic, or search term."
              />
            ) : (
              <div className="space-y-8">
                {visibleLevels.map((lv) => {
                  const lessons = lessonsForLevel(lv).filter(matches);
                  if (lessons.length === 0) return null;
                  return (
                    <section key={lv}>
                      <div className="mb-3 flex items-center gap-3">
                        <span className={cn("rounded-full px-3 py-1 text-sm font-extrabold", LEVEL_META[lv].tint)}>
                          {LEVEL_META[lv].label}
                        </span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {lessons.map((l) => (
                          <ReadingLessonCard
                            key={l.slug}
                            lesson={l}
                            progress={progressMap.get(l.slug)}
                            bookmarked={bookmarkSet.has(l.slug)}
                            onToggleBookmark={handleToggleBookmark}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-4">
            {bookmarkedLessons.length === 0 ? (
              <EmptyState
                icon={<Bookmark className="h-6 w-6" />}
                title="No bookmarks yet"
                description="Tap the bookmark icon on any lesson to save it here for later."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {bookmarkedLessons.map((l) => (
                  <ReadingLessonCard
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

          <TabsContent value="notes" className="mt-4">
            {notes.length === 0 ? (
              <EmptyState
                icon={<StickyNote className="h-6 w-6" />}
                title="No notes yet"
                description="Highlight text while reading a lesson to save notes here."
              />
            ) : (
              <div className="space-y-2">
                {notes.map((n) => (
                  <Card key={n.id} className="flex items-start gap-3 p-4">
                    <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <div className="min-w-0 flex-1">
                      {n.quote && <p className="text-sm font-bold">“{n.quote}”</p>}
                      {n.note && <p className="text-sm text-muted-foreground">{n.note}</p>}
                      <Link
                        to="/lab/$lessonId"
                        params={{ lessonId: n.lesson_slug }}
                        className="mt-1 inline-block text-xs font-bold text-primary hover:underline"
                      >
                        {lessonTitle.get(n.lesson_slug) ?? n.lesson_slug}
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(n.id)}
                      aria-label="Delete note"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
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
