import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Flame,
  Headphones,
  Star,
  Heart,
  Trophy,
  ArrowRight,
  Sparkles,
  BookMarked,
  Target,
  CheckCircle2,
  History,
  BarChart3,
  Layers,
  PencilRuler,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { lessonsQuery, vocabularyQuery } from "@/lib/data";
import { userVocabQuery } from "@/lib/vocab";
import { categoryMeta } from "@/lib/lesson-meta";
import { levelFromXp } from "@/lib/gamification";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const DAILY_XP_GOAL = 50;

function Dashboard() {
  const { user, profile, stats } = useAuth();
  const { data: lessons = [], isPending: lessonsPending } = useQuery(lessonsQuery());
  const { data: progress = [], isPending: progressPending } = useQuery({
    queryKey: ["progress", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id, status, score, completed_at, created_at")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });
  const { data: vocab = [] } = useQuery(vocabularyQuery());
  const { data: userVocab = [] } = useQuery(userVocabQuery(user?.id));

  const loading = lessonsPending || progressPending;

  // Vocabulary progress
  const vocabToday = new Date().toISOString().slice(0, 10);
  const vocabLearned = userVocab.filter((s) => s.status !== "new").length;
  const vocabMastered = userVocab.filter((s) => s.status === "mastered").length;
  const vocabDue = vocab.filter((v) => {
    const s = userVocab.find((u) => u.vocabulary_id === v.id);
    return !s || s.due_date <= vocabToday;
  }).length;
  const vocabPct = vocab.length ? Math.round((vocabMastered / vocab.length) * 100) : 0;

  const completedIds = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.lesson_id),
  );
  const nextLesson = lessons.find((l) => !completedIds.has(l.id));
  const lvl = levelFromXp(stats?.xp ?? 0);
  const completionPct = lessons.length ? Math.round((completedIds.size / lessons.length) * 100) : 0;

  // Today's goal — XP earned today (approximated by lessons completed today × reward).
  const today = new Date().toISOString().slice(0, 10);
  const completedToday = progress.filter(
    (p) => p.status === "completed" && (p.completed_at ?? p.created_at)?.slice(0, 10) === today,
  );
  const lessonXpById = new Map(lessons.map((l) => [l.id, l.xp_reward]));
  const xpToday = completedToday.reduce((sum, p) => sum + (lessonXpById.get(p.lesson_id) ?? 0), 0);
  const goalPct = Math.min(100, Math.round((xpToday / DAILY_XP_GOAL) * 100));

  // Recent activity — last completed lessons.
  const recent = [...progress]
    .filter((p) => p.status === "completed")
    .sort((a, b) =>
      (b.completed_at ?? b.created_at ?? "").localeCompare(a.completed_at ?? a.created_at ?? ""),
    )
    .slice(0, 4)
    .map((p) => ({ ...p, lesson: lessons.find((l) => l.id === p.lesson_id) }))
    .filter((p) => p.lesson);

  // Recommended lesson — next in current level, otherwise the next lesson.
  const recommended = nextLesson;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <header className="grid grid-cols-[minmax(0,1fr)] gap-1">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
            Selamat datang, {profile?.display_name ?? "Learner"}! 👋
          </h1>
          <p className="text-muted-foreground">Let's keep your streak alive today.</p>
        </header>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[76px] rounded-xl" />)
          ) : (
            <>
              <StatCard icon={<Star className="h-5 w-5 text-gold" />} label="Total XP" value={stats?.xp ?? 0} />
              <StatCard icon={<Flame className="h-5 w-5 text-coral" />} label="Day streak" value={stats?.current_streak ?? 0} />
              <StatCard icon={<Trophy className="h-5 w-5 text-primary" />} label="Level" value={lvl.level} />
              <StatCard icon={<Heart className="h-5 w-5 text-destructive" />} label="Hearts" value={stats?.hearts ?? 0} />
            </>
          )}
        </div>

        {/* Today's goal + level progress */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Target className="h-4 w-4 text-primary" /> Today's goal
            </div>
            <div className="mt-3 flex items-center justify-between text-sm font-bold">
              <span>{xpToday} / {DAILY_XP_GOAL} XP</span>
              <span className="text-muted-foreground">{goalPct}%</span>
            </div>
            <Progress value={goalPct} className="mt-2 h-3" />
            <p className="mt-2 text-xs text-muted-foreground">
              {goalPct >= 100 ? "🎉 Goal smashed — great work today!" : "Finish a lesson to hit your daily goal."}
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Trophy className="h-4 w-4 text-gold" /> Level {lvl.level}
            </div>
            <div className="mt-3 flex items-center justify-between text-sm font-bold">
              <span>{lvl.intoLevel} / 100 XP</span>
              <span className="text-muted-foreground">{lvl.toNext} XP to go</span>
            </div>
            <Progress value={lvl.progress} className="mt-2 h-3" />
            <p className="mt-2 text-xs text-muted-foreground">Keep going to reach level {lvl.level + 1}.</p>
          </Card>
        </div>

        {/* Vocabulary spotlight */}
        <Card className="mt-4 overflow-hidden p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-display text-xl font-extrabold">
                <BookMarked className="h-5 w-5 text-primary" /> Vocabulary
              </h2>
              <p className="text-sm text-muted-foreground">
                {vocabDue > 0
                  ? `${vocabDue} ${vocabDue === 1 ? "word is" : "words are"} due for review today.`
                  : "You're all caught up — learn some new words!"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="hero">
                <Link to="/vocabulary/flashcards">
                  <Layers className="h-4 w-4" /> Continue learning
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/vocabulary">Browse words</Link>
              </Button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="font-display text-2xl font-extrabold">{vocabLearned}</p>
              <p className="text-xs text-muted-foreground">Learned</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="font-display text-2xl font-extrabold text-success">{vocabMastered}</p>
              <p className="text-xs text-muted-foreground">Mastered</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="font-display text-2xl font-extrabold text-coral">{vocabDue}</p>
              <p className="text-xs text-muted-foreground">Due today</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm font-bold">
            <span>Vocabulary mastery</span>
            <span className="text-muted-foreground">{vocabPct}%</span>
          </div>
          <Progress value={vocabPct} className="mt-2 h-3" />
        </Card>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Continue / recommended learning */}

          <Card className="p-6 lg:col-span-2">
            <h2 className="font-display text-xl font-extrabold">Continue learning</h2>
            {loading ? (
              <Skeleton className="mt-4 h-24 rounded-2xl" />
            ) : recommended ? (
              <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-muted/50 p-4 sm:flex-row sm:items-center">
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${categoryMeta[recommended.category].tint}`}>
                  {(() => {
                    const Icon = categoryMeta[recommended.category].icon;
                    return <Icon className="h-7 w-7" aria-hidden="true" />;
                  })()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">Recommended next</p>
                  <h3 className="truncate font-bold">{recommended.title}</h3>
                  <p className="truncate text-sm text-muted-foreground">{recommended.description}</p>
                </div>
                <Button asChild variant="hero" className="w-full sm:w-auto">
                  <Link to="/lesson/$lessonId" params={{ lessonId: recommended.id }}>
                    Start <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : lessons.length === 0 ? (
              <EmptyState
                className="mt-4"
                icon={<BookMarked className="h-6 w-6" />}
                title="No lessons yet"
                description="New lessons are on the way. Check back soon!"
              />
            ) : (
              <EmptyState
                className="mt-4"
                icon={<CheckCircle2 className="h-6 w-6" />}
                title="You've completed every lesson!"
                description="Amazing work. More content is coming soon."
                action={
                  <Button asChild variant="outline">
                    <Link to="/vocabulary/flashcards">Review flashcards</Link>
                  </Button>
                }
              />
            )}
            <div className="mt-4 flex items-center justify-between text-sm font-bold">
              <span>Course progress</span>
              <span className="text-muted-foreground">{completionPct}%</span>
            </div>
            <Progress value={completionPct} className="mt-2 h-3" />
            <p className="mt-2 text-xs text-muted-foreground">
              {completedIds.size} of {lessons.length} lessons complete
            </p>
          </Card>

          {/* Quick actions */}
          <nav aria-label="Quick actions" className="space-y-3">
            <QuickLink to="/grammar" icon={<PencilRuler className="h-5 w-5" />} title="Grammar" desc="Lessons & quizzes" />
            <QuickLink to="/lab" icon={<Headphones className="h-5 w-5" />} title="Reading & Listening" desc="Read, listen & practise" />
            <QuickLink to="/speaking" icon={<Mic className="h-5 w-5" />} title="Speaking Lab" desc="Speak & get feedback" />
            <QuickLink to="/vocabulary/flashcards" icon={<BookMarked className="h-5 w-5" />} title="Flashcards" desc="Review vocabulary" />
            <QuickLink to="/leaderboard" icon={<Trophy className="h-5 w-5" />} title="Leaderboard" desc="See your rank" />
          </nav>
        </div>

        {/* Recent activity + learning statistics */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <h2 className="flex items-center gap-2 font-display text-xl font-extrabold">
              <History className="h-5 w-5 text-primary" /> Recent activity
            </h2>
            {loading ? (
              <div className="mt-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            ) : recent.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {recent.map((p) => (
                  <li
                    key={p.lesson_id}
                    className="flex items-center gap-3 rounded-xl border border-border/60 p-3"
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${categoryMeta[p.lesson!.category].tint}`}>
                      {(() => {
                        const Icon = categoryMeta[p.lesson!.category].icon;
                        return <Icon className="h-4 w-4" aria-hidden="true" />;
                      })()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{p.lesson!.title}</p>
                      <p className="text-xs text-muted-foreground">Completed · {p.score}% score</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                className="mt-4"
                icon={<History className="h-6 w-6" />}
                title="No activity yet"
                description="Complete your first lesson to see your progress here."
                action={
                  <Button asChild variant="hero">
                    <Link to="/learn">Browse lessons</Link>
                  </Button>
                }
              />
            )}
          </Card>

          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-extrabold">
              <BarChart3 className="h-5 w-5 text-primary" /> Statistics
            </h2>
            <dl className="mt-4 space-y-3">
              <StatRow label="Lessons completed" value={loading ? "—" : `${completedIds.size}`} />
              <StatRow label="Longest streak" value={loading ? "—" : `${stats?.longest_streak ?? 0} days`} />
              <StatRow label="Course completion" value={loading ? "—" : `${completionPct}%`} />
              <StatRow label="XP today" value={loading ? "—" : `${xpToday} XP`} />
            </dl>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
}

function QuickLink({
  to,
  icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
          {icon}
        </span>
        <div>
          <h3 className="font-bold leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </Card>
    </Link>
  );
}
