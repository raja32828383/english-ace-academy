import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Check, X, Trophy, PartyPopper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { lessonQuery, type Lesson } from "@/lib/data";
import { categoryMeta } from "@/lib/lesson-meta";
import { useAuth } from "@/lib/auth";
import { recordActivity, grantAchievement } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { SpeakingPractice } from "@/components/speaking-practice";

export const Route = createFileRoute("/_authenticated/lesson/$lessonId")({
  component: LessonPage,
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  const { data: lesson, isLoading } = useQuery(lessonQuery(lessonId));

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="p-10 text-center text-muted-foreground">Loading lesson…</div>
      </div>
    );
  }
  if (!lesson) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="p-10 text-center">
          <p className="text-muted-foreground">Lesson not found.</p>
          <Button asChild variant="hero" className="mt-4"><Link to="/learn">Back to lessons</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <LessonRunner lesson={lesson} />
    </div>
  );
}

function LessonRunner({ lesson }: { lesson: Lesson }) {
  const { user, stats, refresh } = useAuth();
  const navigate = useNavigate();
  const meta = categoryMeta[lesson.category];
  const Icon = meta.icon;

  const quiz = lesson.content.quiz ?? [];
  const isSpeaking = lesson.category === "speaking" || !!lesson.content.prompt;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  const complete = async (scorePct: number) => {
    if (!user || !stats) return;
    setSaving(true);
    try {
      await supabase.from("lesson_progress").upsert(
        { user_id: user.id, lesson_id: lesson.id, status: "completed", score: scorePct, completed_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id" },
      );
      await recordActivity(stats, lesson.xp_reward);

      // Achievements
      const { data: ach } = await supabase.from("achievements").select("id, code");
      const map = new Map((ach ?? []).map((a) => [a.code, a.id]));
      if (map.get("first_lesson")) await grantAchievement(user.id, map.get("first_lesson")!);
      if (scorePct === 100 && map.get("perfect_quiz")) await grantAchievement(user.id, map.get("perfect_quiz")!);

      await refresh();
      setFinished(true);
    } catch {
      toast.error("Couldn't save progress. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (finished) {
    const scorePct = quiz.length ? Math.round((correct / quiz.length) * 100) : 100;
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold/20 text-gold-foreground">
          <PartyPopper className="h-10 w-10" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold">Lesson complete!</h1>
        <p className="mt-2 text-muted-foreground">Great work — you earned rewards.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Card className="px-6 py-4"><p className="text-xs font-bold text-muted-foreground">XP EARNED</p><p className="font-display text-2xl font-extrabold text-gold">+{lesson.xp_reward}</p></Card>
          {quiz.length > 0 && (
            <Card className="px-6 py-4"><p className="text-xs font-bold text-muted-foreground">SCORE</p><p className="font-display text-2xl font-extrabold text-primary">{scorePct}%</p></Card>
          )}
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" asChild><Link to="/learn">More lessons</Link></Button>
          <Button variant="hero" onClick={() => navigate({ to: "/dashboard" })}>
            <Trophy className="h-4 w-4" /> Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/learn" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Exit lesson
      </Link>

      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${meta.tint}`}><Icon className="h-5 w-5" /></span>
        <div>
          <h1 className="font-display text-xl font-extrabold leading-tight">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">{meta.label} · +{lesson.xp_reward} XP</p>
        </div>
      </div>

      {lesson.content.intro && (
        <Card className="mt-5 p-5"><p>{lesson.content.intro}</p></Card>
      )}

      {lesson.content.passage && (
        <Card className="mt-4 border-l-4 border-l-primary p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Reading passage</p>
          <p className="mt-2 leading-relaxed">{lesson.content.passage}</p>
        </Card>
      )}

      {isSpeaking && lesson.content.prompt && (
        <div className="mt-4">
          <SpeakingPractice prompt={lesson.content.prompt} onComplete={() => complete(100)} saving={saving} />
        </div>
      )}

      {quiz.length > 0 && (
        <div className="mt-5">
          <Progress value={((index + (checked ? 1 : 0)) / quiz.length) * 100} className="h-2" />
          <Card className="mt-4 p-6">
            <p className="text-sm font-bold text-muted-foreground">Question {index + 1} of {quiz.length}</p>
            <h2 className="mt-2 font-display text-xl font-extrabold">{quiz[index].question}</h2>
            <div className="mt-4 space-y-2">
              {quiz[index].options.map((opt, i) => {
                const isAnswer = i === quiz[index].answer;
                const state = checked
                  ? isAnswer
                    ? "correct"
                    : i === selected
                      ? "wrong"
                      : "idle"
                  : i === selected
                    ? "selected"
                    : "idle";
                return (
                  <button
                    key={i}
                    disabled={checked}
                    onClick={() => setSelected(i)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left font-semibold transition-colors",
                      state === "idle" && "border-border hover:border-primary/50",
                      state === "selected" && "border-primary bg-primary/5",
                      state === "correct" && "border-success bg-success/10 text-success",
                      state === "wrong" && "border-destructive bg-destructive/10 text-destructive",
                    )}
                  >
                    {opt}
                    {state === "correct" && <Check className="h-5 w-5" />}
                    {state === "wrong" && <X className="h-5 w-5" />}
                  </button>
                );
              })}
            </div>

            {!checked ? (
              <Button
                variant="hero"
                className="mt-5 w-full"
                disabled={selected === null}
                onClick={() => {
                  setChecked(true);
                  if (selected === quiz[index].answer) setCorrect((c) => c + 1);
                }}
              >
                Check answer
              </Button>
            ) : (
              <Button
                variant="hero"
                className="mt-5 w-full"
                disabled={saving}
                onClick={() => {
                  if (index + 1 < quiz.length) {
                    setIndex((i) => i + 1);
                    setSelected(null);
                    setChecked(false);
                  } else {
                    const finalCorrect = correct;
                    void complete(Math.round((finalCorrect / quiz.length) * 100));
                  }
                }}
              >
                {index + 1 < quiz.length ? "Next question" : "Finish lesson"}
              </Button>
            )}
          </Card>
        </div>
      )}

      {quiz.length === 0 && !isSpeaking && (
        <Button variant="hero" className="mt-5 w-full" disabled={saving} onClick={() => complete(100)}>
          Mark as complete · +{lesson.xp_reward} XP
        </Button>
      )}
    </div>
  );
}
