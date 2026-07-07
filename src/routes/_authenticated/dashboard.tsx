import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Star, Heart, Trophy, ArrowRight, Sparkles, BookMarked } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { lessonsQuery } from "@/lib/data";
import { categoryMeta } from "@/lib/lesson-meta";
import { levelFromXp } from "@/lib/gamification";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user, profile, stats } = useAuth();
  const { data: lessons = [] } = useQuery(lessonsQuery());
  const { data: progress = [] } = useQuery({
    queryKey: ["progress", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id, status, score")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const completedIds = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.lesson_id),
  );
  const nextLesson = lessons.find((l) => !completedIds.has(l.id));
  const lvl = levelFromXp(stats?.xp ?? 0);
  const completionPct = lessons.length ? Math.round((completedIds.size / lessons.length) * 100) : 0;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-display text-3xl font-extrabold">
          Selamat datang, {profile?.display_name ?? "Learner"}! 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Let's keep your streak alive today.</p>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<Star className="h-5 w-5 text-gold" />} label="Total XP" value={stats?.xp ?? 0} />
          <StatCard icon={<Flame className="h-5 w-5 text-coral" />} label="Day streak" value={stats?.current_streak ?? 0} />
          <StatCard icon={<Trophy className="h-5 w-5 text-primary" />} label="Level" value={lvl.level} />
          <StatCard icon={<Heart className="h-5 w-5 text-destructive" />} label="Hearts" value={stats?.hearts ?? 0} />
        </div>

        {/* Level progress */}
        <Card className="mt-4 p-5">
          <div className="flex items-center justify-between text-sm font-bold">
            <span>Level {lvl.level}</span>
            <span className="text-muted-foreground">{lvl.intoLevel} / 100 XP</span>
          </div>
          <Progress value={lvl.progress} className="mt-2 h-3" />
          <p className="mt-2 text-xs text-muted-foreground">{lvl.toNext} XP to level {lvl.level + 1}</p>
        </Card>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Continue learning */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="font-display text-xl font-extrabold">Continue learning</h2>
            {nextLesson ? (
              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-muted/50 p-4">
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${categoryMeta[nextLesson.category].tint}`}>
                  {(() => {
                    const Icon = categoryMeta[nextLesson.category].icon;
                    return <Icon className="h-7 w-7" />;
                  })()}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold">{nextLesson.title}</h3>
                  <p className="truncate text-sm text-muted-foreground">{nextLesson.description}</p>
                </div>
                <Button asChild variant="hero">
                  <Link to="/lesson/$lessonId" params={{ lessonId: nextLesson.id }}>
                    Start <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-muted-foreground">🎉 You've completed every lesson! More coming soon.</p>
            )}
            <div className="mt-4 flex items-center justify-between text-sm font-bold">
              <span>Course progress</span>
              <span className="text-muted-foreground">{completionPct}%</span>
            </div>
            <Progress value={completionPct} className="mt-2 h-3" />
          </Card>

          {/* Quick actions */}
          <div className="space-y-3">
            <QuickLink to="/vocabulary" icon={<BookMarked className="h-5 w-5" />} title="Flashcards" desc="Review vocabulary" />
            <QuickLink to="/leaderboard" icon={<Trophy className="h-5 w-5" />} title="Leaderboard" desc="See your rank" />
            <QuickLink to="/achievements" icon={<Sparkles className="h-5 w-5" />} title="Achievements" desc="Your badges" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">{icon}<span className="text-xs font-bold text-muted-foreground">{label}</span></div>
      <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
    </Card>
  );
}

function QuickLink({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link to={to}>
      <Card className="flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</span>
        <div>
          <h3 className="font-bold leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </Card>
    </Link>
  );
}
