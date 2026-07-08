import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { lessonsQuery, LEVELS, type Level } from "@/lib/data";
import { categoryMeta, levelMeta } from "@/lib/lesson-meta";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learning Path — TwoMoon Academy" },
      { name: "description", content: "Explore TwoMoon Academy's structured English learning path: Beginner, Intermediate, and Advanced lessons across vocabulary, grammar, listening, speaking, and reading." },
      { property: "og:title", content: "Learning Path — TwoMoon Academy" },
      { property: "og:description", content: "Structured English lessons from beginner to advanced, built for Indonesian students." },
      { property: "og:url", content: "/learn" },
    ],
    links: [{ rel: "canonical", href: "/learn" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(lessonsQuery()),
  component: LearnPage,
  errorComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Couldn't load lessons. Please refresh.</div>
  ),
});

function LearnPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">Learning path</h1>
        <p className="mt-2 text-muted-foreground">
          Follow the path from beginner to advanced. Complete lessons to earn XP and keep your streak.
        </p>
        <Suspense fallback={<PathSkeleton />}>
          <LevelSections />
        </Suspense>
      </main>
    </div>
  );
}

function PathSkeleton() {
  return (
    <div className="mt-8 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
      ))}
    </div>
  );
}

function LevelSections() {
  const { data: lessons } = useSuspenseQuery(lessonsQuery());
  const { user } = useAuth();

  return (
    <div className="mt-8 space-y-10">
      {LEVELS.map((level) => {
        const items = lessons.filter((l) => l.level === level);
        if (items.length === 0) return null;
        return (
          <section key={level}>
            <div className="mb-4 flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${levelMeta[level as Level].tint}`}>
                {levelMeta[level as Level].label}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((lesson) => {
                const meta = categoryMeta[lesson.category];
                const Icon = meta.icon;
                const to = user ? "/lesson/$lessonId" : "/auth";
                return (
                  <Link
                    key={lesson.id}
                    to={to}
                    params={user ? { lessonId: lesson.id } : undefined}
                    search={user ? undefined : { mode: "signup" }}
                    className="group"
                  >
                    <Card className="flex items-center gap-4 p-4 transition-transform group-hover:-translate-y-0.5">
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${meta.tint}`}>
                        <Icon className="h-6 w-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-bold">{lesson.title}</h3>
                        </div>
                        <p className="truncate text-sm text-muted-foreground">{lesson.description}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-sm font-bold text-muted-foreground">
                        <span className="text-gold">+{lesson.xp_reward} XP</span>
                        {user ? <ArrowRight className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
