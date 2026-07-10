import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bookmark,
  Clock,
  Star,
  Target,
  ListChecks,
  Lightbulb,
  AlertTriangle,
  Dumbbell,
  ScrollText,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FormulaBox } from "@/components/grammar/formula-box";
import { ExampleCard } from "@/components/grammar/example-card";
import { MistakeCard } from "@/components/grammar/mistake-card";
import { PracticeRunner } from "@/components/grammar/practice-runner";
import { LessonQuiz } from "@/components/grammar/lesson-quiz";
import { useAuth } from "@/lib/auth";
import { getGrammarLesson, nextLessonSlug, LEVEL_META } from "@/lib/grammar-content";
import {
  grammarBookmarksQuery,
  grammarProgressQuery,
  type GrammarProgressRow,
} from "@/lib/grammar";
import {
  completeGrammarLesson,
  toggleGrammarBookmark,
  touchLessonProgress,
  addStudyTime,
} from "@/lib/grammar-actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/grammar/$lessonId")({
  component: GrammarLessonPage,
});

function GrammarLessonPage() {
  const { lessonId } = Route.useParams();
  const lesson = getGrammarLesson(lessonId);
  const { user, stats, refresh } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: progress = [] } = useQuery(grammarProgressQuery(user?.id));
  const { data: bookmarks = [] } = useQuery(grammarBookmarksQuery(user?.id));

  const openedAt = useRef(Date.now());
  const [saving, setSaving] = useState(false);

  // Record that the lesson was opened + log study time on unmount.
  useEffect(() => {
    if (!user || !lesson) return;
    void touchLessonProgress(user.id, lesson.slug).then(() =>
      queryClient.invalidateQueries({ queryKey: ["grammar-progress", user.id] }),
    );
    const started = openedAt.current;
    return () => {
      const seconds = Math.min(3600, (Date.now() - started) / 1000);
      void addStudyTime(user.id, lesson.slug, seconds);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, lesson?.slug]);

  if (!lesson) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="p-10 text-center">
          <p className="text-muted-foreground">Lesson not found.</p>
          <Button asChild variant="hero" className="mt-4">
            <Link to="/grammar">Back to grammar</Link>
          </Button>
        </div>
      </div>
    );
  }

  const record = progress.find((p) => p.lesson_slug === lesson.slug) as
    | GrammarProgressRow
    | undefined;
  const bookmarked = bookmarks.some((b) => b.lesson_slug === lesson.slug);
  const level = LEVEL_META[lesson.level];
  const c = lesson.content;
  const nextSlug = nextLessonSlug(lesson.slug);

  const handleBookmark = async () => {
    if (!user) return;
    try {
      await toggleGrammarBookmark(user.id, lesson.slug, !bookmarked);
      await queryClient.invalidateQueries({ queryKey: ["grammar-bookmarks", user.id] });
      toast.success(!bookmarked ? "Lesson bookmarked" : "Bookmark removed");
    } catch {
      toast.error("Couldn't update bookmark.");
    }
  };

  const handleFinish = async (result: { score: number; correct: number; total: number }) => {
    if (!user) return;
    setSaving(true);
    try {
      const { xpAwarded } = await completeGrammarLesson({
        userId: user.id,
        stats,
        lesson,
        ...result,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["grammar-progress", user.id] }),
        refresh(),
      ]);
      toast.success(xpAwarded > 0 ? `Lesson complete! +${xpAwarded} XP` : "Progress saved!");
    } catch {
      toast.error("Couldn't save your progress. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="flex items-center justify-between">
          <Link
            to="/grammar"
            className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Grammar
          </Link>
          <button
            type="button"
            onClick={handleBookmark}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark lesson"}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-bold text-muted-foreground hover:text-primary"
          >
            <Bookmark className={cn("h-4 w-4", bookmarked && "fill-primary text-primary")} />
            {bookmarked ? "Saved" : "Save"}
          </button>
        </div>

        {/* Header */}
        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-extrabold", level.tint)}>
              {level.label}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {lesson.estimatedMinutes} min
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-gold">
              <Star className="h-3.5 w-3.5 fill-gold" /> +{lesson.xpReward} XP
            </span>
            {record?.status === "completed" && (
              <span className="text-xs font-bold text-success">Completed · {record.best_score}%</span>
            )}
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight">{lesson.title}</h1>
          <p className="mt-1 text-muted-foreground">{lesson.summary}</p>
          <Progress value={record?.status === "completed" ? 100 : record ? 40 : 0} className="mt-4 h-2" />
        </header>

        {/* Objectives */}
        <Section icon={<Target className="h-5 w-5 text-primary" />} title="Learning objectives">
          <ul className="space-y-2">
            {c.objectives.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Formulas */}
        <Section icon={<ScrollText className="h-5 w-5 text-primary" />} title="Grammar formula">
          <div className="grid gap-3 sm:grid-cols-2">
            {c.formulas.map((f, i) => (
              <FormulaBox key={i} formula={f} />
            ))}
          </div>
        </Section>

        {/* Explanation */}
        <Section icon={<Lightbulb className="h-5 w-5 text-primary" />} title="Explanation">
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-primary">English</p>
              <p className="mt-2 text-sm leading-relaxed">{c.explanationEnglish}</p>
            </Card>
            <Card className="border-l-4 border-l-coral p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-coral">Penjelasan (Bahasa Indonesia)</p>
              <p className="mt-2 text-sm leading-relaxed">{c.explanationIndonesian}</p>
            </Card>
          </div>
          {c.explanationCards.length > 0 && (
            <div className="mt-3 space-y-2">
              {c.explanationCards.map((card, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl border-l-4 p-3",
                    card.kind === "warning" && "border-l-destructive bg-destructive/5",
                    card.kind === "tip" && "border-l-success bg-success/5",
                    card.kind === "note" && "border-l-primary bg-primary/5",
                  )}
                >
                  <p className="text-sm font-bold">
                    {card.kind === "warning" ? "⚠️ " : card.kind === "tip" ? "💡 " : "📌 "}
                    {card.title}
                  </p>
                  <p className="mt-1 text-sm">{card.english}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{card.indonesian}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Examples */}
        <Section icon={<ScrollText className="h-5 w-5 text-primary" />} title="Examples" subtitle="Tap any example to see the breakdown">
          <div className="space-y-2">
            {c.examples.map((ex, i) => (
              <ExampleCard key={i} example={ex} />
            ))}
          </div>
        </Section>

        {/* Common mistakes */}
        <Section icon={<AlertTriangle className="h-5 w-5 text-destructive" />} title="Common mistakes">
          <div className="space-y-3">
            {c.mistakes.map((m, i) => (
              <MistakeCard key={i} mistake={m} />
            ))}
          </div>
        </Section>

        {/* Tips + summary */}
        <Section icon={<Lightbulb className="h-5 w-5 text-gold" />} title="Tips & summary">
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="bg-gold/5 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-gold-foreground">Tips</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {c.tips.map((t, i) => (
                  <li key={i}>💡 {t}</li>
                ))}
              </ul>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-primary">Summary</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {c.summary.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-success">✓</span> {s}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>

        {/* Practice (interactive, collapsible) */}
        <Section icon={<Dumbbell className="h-5 w-5 text-primary" />} title="Practice">
          <Accordion type="single" collapsible defaultValue="practice">
            <AccordionItem value="practice" className="border-none">
              <AccordionTrigger className="rounded-xl bg-muted/50 px-4 font-bold hover:no-underline">
                Interactive exercises ({c.practice.length})
              </AccordionTrigger>
              <AccordionContent className="pt-3">
                <PracticeRunner exercises={c.practice} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Section>

        {/* Quiz */}
        <Section icon={<Target className="h-5 w-5 text-primary" />} title="Mini quiz" subtitle={`${c.quiz.length} questions · pass with 60%`}>
          <LessonQuiz
            quiz={c.quiz}
            saving={saving}
            onFinish={handleFinish}
            continueLabel={nextSlug ? "Next lesson" : "Back to grammar"}
            onContinue={() =>
              nextSlug
                ? navigate({ to: "/grammar/$lessonId", params: { lessonId: nextSlug } })
                : navigate({ to: "/grammar" })
            }
          />
        </Section>

        {nextSlug && (
          <div className="mt-8 flex justify-end">
            <Button asChild variant="outline">
              <Link to="/grammar/$lessonId" params={{ lessonId: nextSlug }}>
                Next lesson <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="font-display text-xl font-extrabold">{title}</h2>
      </div>
      {subtitle && <p className="mb-3 -mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      {children}
    </section>
  );
}
