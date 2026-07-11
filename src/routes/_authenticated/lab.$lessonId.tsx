import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bookmark,
  Clock,
  Star,
  Target,
  BookOpenText,
  Headphones,
  Maximize2,
  Minimize2,
  Type,
  Eye,
  EyeOff,
  Languages,
  Sparkles,
  ListChecks,
  KeyRound,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AudioPlayer,
  type AudioPlayerHandle,
} from "@/components/reading/audio-player";
import { TranscriptView } from "@/components/reading/transcript-view";
import { ReadingPassage } from "@/components/reading/reading-passage";
import { ReadingQuiz } from "@/components/reading/reading-quiz";
import { useAuth } from "@/lib/auth";
import {
  getReadingLesson,
  nextReadingSlug,
  lessonWordCount,
  LEVEL_META,
  CATEGORY_META,
  type VocabHighlight,
} from "@/lib/reading-content";
import { readingBookmarksQuery, readingProgressQuery } from "@/lib/reading";
import { READING_AI_ACTIONS, READING_AI_ENABLED } from "@/lib/reading-ai";
import {
  completeReadingQuiz,
  toggleReadingBookmark,
  touchReadingProgress,
  addLabTime,
  addReadingNote,
  type LabMode,
} from "@/lib/reading-actions";
import { toggleFavorite, markLearned } from "@/lib/vocab-actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/lab/$lessonId")({
  component: LabLessonPage,
});

type ViewMode = "reading" | "listening";

function LabLessonPage() {
  const { lessonId } = Route.useParams();
  const lesson = getReadingLesson(lessonId);
  const { user, stats, refresh } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: progress = [] } = useQuery(readingProgressQuery(user?.id));
  const { data: bookmarks = [] } = useQuery(readingBookmarksQuery(user?.id));

  const playerRef = useRef<AudioPlayerHandle>(null);
  const [activeLine, setActiveLine] = useState(0);
  const [mode, setMode] = useState<ViewMode>("reading");
  const [immersive, setImmersive] = useState(false);
  const [fontScale, setFontScale] = useState(1.05);
  const [showTranscript, setShowTranscript] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [saving, setSaving] = useState(false);

  const openedAt = useRef(Date.now());
  const modeRef = useRef<LabMode>("reading");
  modeRef.current = mode;

  useEffect(() => {
    if (!user || !lesson) return;
    void touchReadingProgress(user.id, lesson.slug).then(() =>
      queryClient.invalidateQueries({ queryKey: ["reading-progress", user.id] }),
    );
    const started = openedAt.current;
    return () => {
      const seconds = Math.min(3600, (Date.now() - started) / 1000);
      void addLabTime(user.id, lesson.slug, modeRef.current, seconds);
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
            <Link to="/lab">Back to the Lab</Link>
          </Button>
        </div>
      </div>
    );
  }

  const c = lesson.content;
  const record = progress.find((p) => p.lesson_slug === lesson.slug);
  const bookmarked = bookmarks.some((b) => b.lesson_slug === lesson.slug);
  const level = LEVEL_META[lesson.level];
  const cat = CATEGORY_META[lesson.category];
  const CatIcon = cat.icon;
  const nextSlug = nextReadingSlug(lesson.slug);
  const lines = c.transcript.map((t) => t.text);
  const words = useMemo(() => lessonWordCount(lesson), [lesson]);
  const readMinutes = Math.max(1, Math.round(words / 180));

  // Listening mode hides transcript & translation until quiz is passed.
  const transcriptVisible =
    mode === "reading" ? showTranscript : quizPassed && showTranscript;

  const handleBookmark = async () => {
    if (!user) return;
    try {
      await toggleReadingBookmark(user.id, lesson.slug, !bookmarked);
      await queryClient.invalidateQueries({ queryKey: ["reading-bookmarks", user.id] });
      toast.success(!bookmarked ? "Lesson bookmarked" : "Bookmark removed");
    } catch {
      toast.error("Couldn't update bookmark.");
    }
  };

  const findVocabRow = async (word: string) => {
    const { data } = await supabase
      .from("vocabulary")
      .select("id")
      .ilike("word", word)
      .maybeSingle();
    return data?.id ?? null;
  };

  const handleSaveWord = async (v: VocabHighlight) => {
    if (!user) return;
    const id = await findVocabRow(v.word);
    if (id) {
      try {
        await toggleFavorite(user.id, id, true);
        await queryClient.invalidateQueries({ queryKey: ["user-vocab", user.id] });
        toast.success(`"${v.word}" saved to your vocabulary`);
        return;
      } catch {
        /* fall through */
      }
    }
    // Fallback: keep it as a note so nothing is lost.
    try {
      await addReadingNote({
        userId: user.id,
        lessonSlug: lesson.slug,
        quote: v.word,
        note: `${v.meaning}${v.definition ? ` — ${v.definition}` : ""}`,
      });
      await queryClient.invalidateQueries({ queryKey: ["reading-notes", user.id] });
      toast.success(`"${v.word}" saved to your notes`);
    } catch {
      toast.error("Couldn't save the word.");
    }
  };

  const handleFavoriteWord = async (v: VocabHighlight) => {
    if (!user) return;
    const id = await findVocabRow(v.word);
    if (!id) return handleSaveWord(v);
    try {
      await toggleFavorite(user.id, id, true);
      await queryClient.invalidateQueries({ queryKey: ["user-vocab", user.id] });
      toast.success(`Added "${v.word}" to favorites`);
    } catch {
      toast.error("Couldn't favorite the word.");
    }
  };

  const handleLearnWord = async (v: VocabHighlight) => {
    if (!user) return;
    const id = await findVocabRow(v.word);
    if (!id) return handleSaveWord(v);
    try {
      await markLearned(user.id, id);
      await queryClient.invalidateQueries({ queryKey: ["user-vocab", user.id] });
      toast.success(`Marked "${v.word}" as learned`);
    } catch {
      toast.error("Couldn't update the word.");
    }
  };

  const handleQuote = async (quote: string) => {
    if (!user) return;
    try {
      await addReadingNote({ userId: user.id, lessonSlug: lesson.slug, quote });
      await queryClient.invalidateQueries({ queryKey: ["reading-notes", user.id] });
      toast.success("Highlight saved to your notes");
    } catch {
      toast.error("Couldn't save the highlight.");
    }
  };

  const handleFinishQuiz =
    (quizMode: LabMode) =>
    async (result: { score: number; correct: number; total: number }) => {
      if (quizMode === "listening") setQuizPassed(true);
      if (!user) return;
      setSaving(true);
      try {
        const { xpAwarded } = await completeReadingQuiz({
          userId: user.id,
          stats,
          lesson,
          mode: quizMode,
          ...result,
        });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["reading-progress", user.id] }),
          queryClient.invalidateQueries({ queryKey: ["user-achievements", user.id] }),
          refresh(),
        ]);
        toast.success(
          xpAwarded > 0 ? `Lesson complete! +${xpAwarded} XP` : "Progress saved!",
        );
      } catch {
        toast.error("Couldn't save your progress.");
      } finally {
        setSaving(false);
      }
    };

  const fontControls = (
    <div className="flex items-center gap-1" role="group" aria-label="Font size">
      <Type className="h-4 w-4 text-muted-foreground" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label="Decrease font size"
        onClick={() => setFontScale((f) => Math.max(0.9, +(f - 0.1).toFixed(2)))}
      >
        <span className="text-xs font-bold">A-</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label="Increase font size"
        onClick={() => setFontScale((f) => Math.min(1.6, +(f + 0.1).toFixed(2)))}
      >
        <span className="text-base font-bold">A+</span>
      </Button>
    </div>
  );

  const passage = (
    <ReadingPassage
      lines={c.transcript}
      vocab={c.vocab}
      grammar={c.grammar}
      fontScale={fontScale}
      activeIndex={activeLine}
      onSaveWord={handleSaveWord}
      onFavoriteWord={handleFavoriteWord}
      onLearnWord={handleLearnWord}
      onQuote={handleQuote}
    />
  );

  // Immersive: distraction-free reading with only the passage + controls.
  if (immersive) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-lg font-extrabold">{lesson.title}</h1>
            <div className="flex items-center gap-2">
              {fontControls}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImmersive(false)}
              >
                <Minimize2 className="h-4 w-4" /> Exit
              </Button>
            </div>
          </div>
          <div className="mt-6">{passage}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto w-full max-w-3xl flex-1 px-4 py-8"
      >
        <div className="flex items-center justify-between">
          <Link
            to="/lab"
            className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Lab
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setImmersive(true)}>
              <Maximize2 className="h-4 w-4" /> Immersive
            </Button>
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
        </div>

        {/* Header */}
        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-extrabold", level.tint)}>
              {level.label}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
              <CatIcon className="h-3.5 w-3.5" /> {cat.label}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {readMinutes} min read
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-gold">
              <Star className="h-3.5 w-3.5 fill-gold" /> +{lesson.xpReward} XP
            </span>
            {record?.status === "completed" && (
              <span className="text-xs font-bold text-success">
                Completed · {record.best_score}%
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight">
            {lesson.title}
          </h1>
          <p className="mt-1 text-muted-foreground">{lesson.summary}</p>
          <Progress
            value={record?.status === "completed" ? 100 : record ? 40 : 5}
            className="mt-4 h-2"
          />
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

        {/* Mode switch */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-xl border p-1" role="tablist" aria-label="Study mode">
            <ModeTab active={mode === "reading"} onClick={() => setMode("reading")} icon={<BookOpenText className="h-4 w-4" />} label="Reading" />
            <ModeTab active={mode === "listening"} onClick={() => setMode("listening")} icon={<Headphones className="h-4 w-4" />} label="Listening" />
          </div>
          <div className="flex items-center gap-2">{fontControls}</div>
        </div>

        {mode === "listening" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Listening mode hides the transcript and translation. Play the audio, answer the
            listening quiz, then reveal the transcript.
          </p>
        )}

        {/* Audio player */}
        <div className="mt-4">
          <AudioPlayer
            ref={playerRef}
            lines={lines}
            src={lesson.audioUrl}
            onActiveLineChange={setActiveLine}
          />
        </div>

        {/* Reading passage (reading mode only) */}
        {mode === "reading" && (
          <Section
            icon={<BookOpenText className="h-5 w-5 text-primary" />}
            title="Reading text"
            subtitle="Tap highlighted words for meaning, or select any text to save a note."
          >
            <Card className="p-5">{passage}</Card>
          </Section>
        )}

        {/* Transcript */}
        <Section
          icon={<Languages className="h-5 w-5 text-primary" />}
          title="Transcript"
          action={
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTranslation((s) => !s)}
                disabled={!transcriptVisible}
              >
                <Languages className="h-4 w-4" />
                {showTranslation ? "Hide ID" : "Show ID"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowTranscript((s) => !s)}>
                {transcriptVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {transcriptVisible ? "Hide" : "Show"}
              </Button>
            </div>
          }
        >
          {transcriptVisible ? (
            <TranscriptView
              lines={c.transcript}
              activeIndex={activeLine}
              onJump={(i) => playerRef.current?.jumpTo(i)}
              showTranslation={showTranslation}
            />
          ) : (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              {mode === "listening" && !quizPassed
                ? "Complete the listening quiz to reveal the transcript."
                : "Transcript hidden."}
            </Card>
          )}
        </Section>

        {/* Key expressions */}
        <Section icon={<KeyRound className="h-5 w-5 text-primary" />} title="Key expressions">
          <div className="grid gap-2 sm:grid-cols-2">
            {c.keyExpressions.map((k, i) => (
              <Card key={i} className="p-3">
                <p className="font-bold">{k.expression}</p>
                <p className="text-sm text-primary">{k.meaning}</p>
                <p className="mt-1 text-xs text-muted-foreground">{k.usage}</p>
              </Card>
            ))}
          </div>
        </Section>

        {/* Notes */}
        <Section icon={<StickyNote className="h-5 w-5 text-gold" />} title="Reading & listening notes">
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-primary">Reading notes</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {c.readingNotes.map((n, i) => (
                  <li key={i}>📖 {n}</li>
                ))}
              </ul>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-coral">Listening notes</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {c.listeningNotes.map((n, i) => (
                  <li key={i}>🎧 {n}</li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>

        {/* Summary */}
        <Section icon={<Sparkles className="h-5 w-5 text-gold" />} title="Summary">
          <Card className="p-4">
            <ul className="space-y-1.5 text-sm">
              {c.summary.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-success">✓</span> {s}
                </li>
              ))}
            </ul>
          </Card>
        </Section>

        {/* Quizzes */}
        <Section icon={<Target className="h-5 w-5 text-primary" />} title="Practice & quiz" subtitle="Pass with 60% to complete the lesson.">
          <Tabs defaultValue="reading">
            <TabsList>
              <TabsTrigger value="reading">Reading quiz</TabsTrigger>
              <TabsTrigger value="listening">Listening quiz</TabsTrigger>
            </TabsList>
            <TabsContent value="reading" className="mt-4">
              <ReadingQuiz
                items={c.readingQuiz}
                saving={saving}
                onFinish={handleFinishQuiz("reading")}
                continueLabel={nextSlug ? "Next lesson" : "Back to Lab"}
                onContinue={() =>
                  nextSlug
                    ? navigate({ to: "/lab/$lessonId", params: { lessonId: nextSlug } })
                    : navigate({ to: "/lab" })
                }
              />
            </TabsContent>
            <TabsContent value="listening" className="mt-4">
              <ReadingQuiz
                items={c.listeningQuiz}
                saving={saving}
                onFinish={handleFinishQuiz("listening")}
                continueLabel="Reveal transcript"
                onContinue={() => {
                  setQuizPassed(true);
                  setShowTranscript(true);
                }}
              />
            </TabsContent>
          </Tabs>
        </Section>

        {/* AI (architecture only) */}
        <Section icon={<Sparkles className="h-5 w-5 text-primary" />} title="AI tutor" subtitle="Coming soon">
          <Card className="border-primary/20 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground">
              Future AI features for this passage:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {READING_AI_ACTIONS.map((a) => (
                <span
                  key={a.key}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold text-muted-foreground"
                >
                  <Sparkles className="h-3.5 w-3.5" /> {a.label}
                </span>
              ))}
            </div>
            {!READING_AI_ENABLED && (
              <p className="mt-3 text-xs font-bold text-primary">
                These will be enabled in a future update.
              </p>
            )}
          </Card>
        </Section>

        {nextSlug && (
          <div className="mt-8 flex justify-end">
            <Button asChild variant="outline">
              <Link to="/lab/$lessonId" params={{ lessonId: nextSlug }}>
                Next lesson <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </Button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon} {label}
    </button>
  );
}

function Section({
  icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-display text-xl font-extrabold">{title}</h2>
        </div>
        {action}
      </div>
      {subtitle && <p className="mb-3 -mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      {children}
    </section>
  );
}
