import { useEffect } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Star,
  Mic,
  Target,
  BookOpen,
  Volume2,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NativeAudioPlayer } from "@/components/speaking/native-audio-player";
import { useAuth } from "@/lib/auth";
import {
  getSpeakingCourse,
  CATEGORY_META,
  LEVEL_META,
  MODE_META,
} from "@/lib/speaking-content";
import { touchSpeakingProgress } from "@/lib/speaking-actions";
import {
  SPEAKING_AI_ACTIONS,
  SPEAKING_AI_ENABLED,
} from "@/lib/speaking-ai";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/speaking/course/$courseId")({
  component: SpeakingCoursePage,
});

function SpeakingCoursePage() {
  const { courseId } = useParams({ from: "/_authenticated/speaking/course/$courseId" });
  const { user } = useAuth();
  const course = getSpeakingCourse(courseId);

  useEffect(() => {
    if (user && course) void touchSpeakingProgress(user.id, course.slug);
  }, [user, course]);

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          <EmptyState
            icon={<Mic className="h-6 w-6" />}
            title="Course not found"
            description="This speaking course doesn't exist or has moved."
            action={
              <Button asChild variant="hero">
                <Link to="/speaking">Back to Speaking Lab</Link>
              </Button>
            }
          />
        </main>
        <SiteFooter />
      </div>
    );
  }

  const level = LEVEL_META[course.level];
  const cat = CATEGORY_META[course.category];
  const CatIcon = cat.icon;
  const mode = MODE_META[course.mode];
  const c = course.content;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-3">
          <Link to="/speaking">
            <ArrowLeft className="h-4 w-4" /> Speaking Lab
          </Link>
        </Button>

        {/* Cover */}
        <Card className="overflow-hidden p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-extrabold", level.tint)}>
              {level.label}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
              <CatIcon className="h-3.5 w-3.5" /> {cat.label}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-primary">
              <Mic className="h-3.5 w-3.5" /> {mode.label}
            </span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">{course.title}</h1>
          <p className="mt-1 text-muted-foreground">{course.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-bold text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.estimatedMinutes} min</span>
            <span className="flex items-center gap-1 text-gold"><Star className="h-4 w-4 fill-gold" /> {course.xpReward} XP</span>
            <span className="flex items-center gap-1"><Target className="h-4 w-4" /> {c.practice.length} sentences</span>
          </div>
          <Button asChild variant="hero" className="mt-4 w-full sm:w-auto">
            <Link to="/speaking/session/$courseId" params={{ courseId: course.slug }}>
              Start speaking session <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>

        {/* Objectives */}
        <Section title="Objectives" icon={<Target className="h-5 w-5 text-primary" />}>
          <ul className="space-y-1.5">
            {c.objectives.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> {o}
              </li>
            ))}
          </ul>
        </Section>

        {/* Conversation */}
        <Section title="Conversation" icon={<MessageSquare className="h-5 w-5 text-primary" />}>
          <div className="space-y-2">
            {c.conversation.map((line, i) => (
              <div key={i} className="rounded-xl bg-muted/50 p-3">
                {line.speaker && (
                  <p className="text-[11px] font-bold uppercase tracking-wide text-primary">{line.speaker}</p>
                )}
                <p className="font-medium">{line.text}</p>
                <p className="text-sm text-muted-foreground">{line.translation}</p>
                <div className="mt-2">
                  <NativeAudioPlayer text={line.text} compact />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Vocabulary */}
        <Section title="Vocabulary" icon={<BookOpen className="h-5 w-5 text-primary" />}>
          <div className="grid gap-2 sm:grid-cols-2">
            {c.vocab.map((v, i) => (
              <div key={i} className="rounded-xl border border-border/60 p-3">
                <p className="font-bold">
                  {v.word} {v.phonetic && <span className="font-normal text-muted-foreground">{v.phonetic}</span>}
                </p>
                <p className="text-sm text-muted-foreground">{v.meaning}</p>
                <p className="mt-1 text-sm italic">{v.example}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Grammar focus */}
        <Section title="Grammar Focus" icon={<Sparkles className="h-5 w-5 text-primary" />}>
          <div className="space-y-2">
            {c.grammarFocus.map((g, i) => (
              <div key={i} className="rounded-xl border border-border/60 p-3">
                <p className="font-bold">{g.name}</p>
                <p className="mt-1 rounded-lg bg-primary/5 px-2 py-1 font-mono text-sm text-primary">{g.formula}</p>
                <p className="mt-1 text-sm text-muted-foreground">{g.explanation}</p>
                <p className="mt-1 text-sm italic">{g.example}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Pronunciation tips */}
        <Section title="Pronunciation Tips" icon={<Volume2 className="h-5 w-5 text-primary" />}>
          <div className="space-y-2">
            {c.pronunciationTips.map((t, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                <span className="shrink-0 rounded-lg bg-coral/10 px-2 py-1 font-mono text-sm font-bold text-coral">{t.sound}</span>
                <div>
                  <p className="text-sm">{t.tip}</p>
                  <p className="text-sm font-bold">{t.example}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Speaking challenge */}
        <Section title="Speaking Challenge" icon={<Star className="h-5 w-5 text-gold" />}>
          <div className="rounded-xl bg-gold/10 p-4">
            <p className="font-display text-lg font-extrabold">{c.challenge}</p>
            <div className="mt-2">
              <NativeAudioPlayer text={c.challenge} compact />
            </div>
          </div>
        </Section>

        {/* AI (architecture only) */}
        <Section title="AI Speaking Coach" icon={<Sparkles className="h-5 w-5 text-primary" />}>
          <div className="rounded-xl border border-dashed border-border p-4">
            <p className="text-sm text-muted-foreground">
              {SPEAKING_AI_ENABLED
                ? "AI speaking features are enabled."
                : "Coming soon — an AI partner will talk with you, correct your pronunciation, and roleplay real scenarios."}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SPEAKING_AI_ACTIONS.map((a) => (
                <span
                  key={a.key}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground"
                >
                  {a.label}
                </span>
              ))}
            </div>
          </div>
        </Section>

        <Button asChild variant="hero" className="mt-6 w-full">
          <Link to="/speaking/session/$courseId" params={{ courseId: course.slug }}>
            Start speaking session <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="mt-4 p-5">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold">
        {icon} {title}
      </h2>
      {children}
    </Card>
  );
}
