import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  X,
  Mic,
  CheckCircle2,
  Clock,
  ArrowRight,
  Target,
  Sparkles,
  Flame,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StatCard } from "@/components/stat-card";
import { SpeakingCourseCard } from "@/components/speaking/speaking-course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import {
  SPEAKING_COURSES,
  SPEAKING_LEVELS,
  LEVEL_META,
  CATEGORY_META,
  coursesForLevel,
  usedSpeakingCategories,
  type SpeakingCourse,
  type SpeakingLevel,
  type SpeakingCategory,
} from "@/lib/speaking-content";
import {
  speakingProgressQuery,
  speakingDailyQuery,
  computeSpeakingStats,
  recommendedSpeakingCourse,
  challengeForToday,
  isDailyDone,
  dailyStreak,
  DAILY_CHALLENGE_META,
} from "@/lib/speaking";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/speaking/")({
  head: () => ({
    meta: [
      { title: "Speaking Lab — TwoMoon Academy" },
      {
        name: "description",
        content:
          "Practise English speaking with pronunciation scoring, native audio, and speaking challenges built for Indonesian learners.",
      },
    ],
  }),
  component: SpeakingHub,
});

function SpeakingHub() {
  const { user } = useAuth();
  const { data: progress = [] } = useQuery(speakingProgressQuery(user?.id));
  const { data: daily = [] } = useQuery(speakingDailyQuery(user?.id));

  const progressMap = useMemo(
    () => new Map(progress.map((p) => [p.course_slug, p])),
    [progress],
  );

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<SpeakingLevel | "all">("all");
  const [category, setCategory] = useState<SpeakingCategory | "all">("all");

  const stats = computeSpeakingStats(progress);
  const recommended = recommendedSpeakingCourse(progress);
  const todayChallenge = challengeForToday();
  const challengeDone = isDailyDone(daily, todayChallenge);
  const streak = dailyStreak(daily);

  const q = search.trim().toLowerCase();
  const matches = (c: SpeakingCourse) => {
    if (level !== "all" && c.level !== level) return false;
    if (category !== "all" && c.category !== category) return false;
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.topic.toLowerCase().includes(q) ||
      CATEGORY_META[c.category].label.toLowerCase().includes(q)
    );
  };

  const filtered = SPEAKING_COURSES.filter(matches);
  const visibleLevels = level === "all" ? SPEAKING_LEVELS : [level];
  const cats = usedSpeakingCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold sm:text-3xl">
            <Mic className="h-7 w-7 text-primary" /> Speaking Lab
          </h1>
          <p className="text-muted-foreground">
            Speak out loud, get instant pronunciation feedback, and build real confidence.
          </p>
        </div>

        {/* Continue banner */}
        <Card className="mt-6 flex flex-col gap-4 overflow-hidden p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              {stats.completed > 0 ? "Continue speaking" : "Start speaking"}
            </p>
            <h2 className="mt-1 truncate font-display text-xl font-extrabold">
              {recommended.title}
            </h2>
            <p className="truncate text-sm text-muted-foreground">{recommended.summary}</p>
          </div>
          <Button asChild variant="hero" className="shrink-0">
            <Link to="/speaking/course/$courseId" params={{ courseId: recommended.slug }}>
              {stats.completed > 0 ? "Continue" : "Start"} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>

        {/* Daily challenge */}
        <Card className="mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-coral/10 text-coral">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="flex items-center gap-2 font-bold">
                {DAILY_CHALLENGE_META[todayChallenge].label}
                {challengeDone && <CheckCircle2 className="h-4 w-4 text-success" />}
              </p>
              <p className="text-sm text-muted-foreground">
                {DAILY_CHALLENGE_META[todayChallenge].description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm font-bold text-coral">
              <Flame className="h-4 w-4 fill-coral" /> {streak} day{streak === 1 ? "" : "s"}
            </span>
            <Button asChild variant={challengeDone ? "outline" : "hero"} size="sm">
              <Link to="/speaking/course/$courseId" params={{ courseId: recommended.slug }}>
                {challengeDone ? "Done" : "Start"}
              </Link>
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<CheckCircle2 className="h-5 w-5 text-success" />} label="Completed" value={`${stats.completed}/${stats.totalCourses}`} />
          <StatCard icon={<Mic className="h-5 w-5 text-primary" />} label="Pronunciation" value={stats.pronunciationAvg != null ? `${stats.pronunciationAvg}%` : "—"} />
          <StatCard icon={<Target className="h-5 w-5 text-coral" />} label="Confidence" value={stats.confidenceAvg != null ? `${stats.confidenceAvg}%` : "—"} />
          <StatCard icon={<Clock className="h-5 w-5 text-gold" />} label="Speaking" value={`${stats.speakingMinutes}m`} />
        </div>

        <Card className="mt-4 p-5">
          <div className="flex items-center justify-between text-sm font-bold">
            <span>Speaking progress</span>
            <span className="text-muted-foreground">{stats.completionPct}%</span>
          </div>
          <Progress value={stats.completionPct} className="mt-2 h-3" />
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span>Words spoken: <strong className="text-foreground">{stats.wordsSpoken}</strong></span>
            <span>Sentences: <strong className="text-foreground">{stats.sentencesCompleted}</strong></span>
            <span>Accuracy: <strong className="text-foreground">{stats.accuracyAvg != null ? `${stats.accuracyAvg}%` : "—"}</strong></span>
          </div>
        </Card>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search speaking courses, topics, or categories…"
            aria-label="Search speaking courses"
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

        <Tabs defaultValue="courses" className="mt-6">
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="in-progress">
              In progress {stats.inProgress > 0 && `(${stats.inProgress})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-4">
            <div className="mb-3 flex flex-wrap gap-2">
              <Chip active={level === "all"} onClick={() => setLevel("all")} label="All levels" />
              {SPEAKING_LEVELS.map((lv) => (
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
                title="No courses found"
                description="Try a different level, topic, or search term."
              />
            ) : (
              <div className="space-y-8">
                {visibleLevels.map((lv) => {
                  const courses = coursesForLevel(lv).filter(matches);
                  if (courses.length === 0) return null;
                  return (
                    <section key={lv}>
                      <div className="mb-3 flex items-center gap-3">
                        <span className={cn("rounded-full px-3 py-1 text-sm font-extrabold", LEVEL_META[lv].tint)}>
                          {LEVEL_META[lv].label}
                        </span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((c) => (
                          <SpeakingCourseCard key={c.slug} course={c} progress={progressMap.get(c.slug)} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="mt-4">
            {stats.inProgress === 0 && stats.completed === 0 ? (
              <EmptyState
                icon={<Mic className="h-6 w-6" />}
                title="No progress yet"
                description="Start a course to track your speaking progress here."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SPEAKING_COURSES.filter((c) => progressMap.has(c.slug)).map((c) => (
                  <SpeakingCourseCard key={c.slug} course={c} progress={progressMap.get(c.slug)} />
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
