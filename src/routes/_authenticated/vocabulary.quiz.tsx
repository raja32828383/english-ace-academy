import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Star, Target, Volume2, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { AudioButton } from "@/components/vocab/audio-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/auth";
import { vocabularyQuery, type Vocabulary } from "@/lib/data";
import { recordActivity, grantAchievement } from "@/lib/gamification";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/vocabulary/quiz")({
  component: VocabQuizPage,
});

type QuizType = "meaning" | "reverse" | "fill" | "listening";

interface QuizQuestion {
  type: QuizType;
  word: Vocabulary;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

const XP_PER_CORRECT = 5;
const PERFECT_BONUS = 10;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuiz(vocab: Vocabulary[], count: number): QuizQuestion[] {
  const usable = vocab.filter((v) => v.translation && v.word);
  const picks = shuffle(usable).slice(0, count);
  return picks.map((word) => {
    const distractorPool = usable.filter((v) => v.id !== word.id);
    const types: QuizType[] = ["meaning", "reverse", "listening"];
    if (word.example && word.example.toLowerCase().includes(word.word.toLowerCase())) types.push("fill");
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === "reverse") {
      const wrong = shuffle(distractorPool).slice(0, 3).map((v) => v.word);
      const options = shuffle([word.word, ...wrong]);
      return {
        type,
        word,
        prompt: `Which English word means "${word.translation}"?`,
        options,
        answer: options.indexOf(word.word),
        explanation: `"${word.word}" means "${word.translation}".`,
      };
    }
    if (type === "fill") {
      const blanked = word.example!.replace(new RegExp(word.word, "i"), "____");
      const wrong = shuffle(distractorPool).slice(0, 3).map((v) => v.word);
      const options = shuffle([word.word, ...wrong]);
      return {
        type,
        word,
        prompt: `Fill in the blank: "${blanked}"`,
        options,
        answer: options.indexOf(word.word),
        explanation: `The full sentence is "${word.example}".`,
      };
    }
    if (type === "listening") {
      const wrong = shuffle(distractorPool).slice(0, 3).map((v) => v.translation);
      const options = shuffle([word.translation, ...wrong]);
      return {
        type,
        word,
        prompt: `Listen and choose the correct meaning.`,
        options,
        answer: options.indexOf(word.translation),
        explanation: `"${word.word}" means "${word.translation}".`,
      };
    }
    // meaning
    const wrong = shuffle(distractorPool).slice(0, 3).map((v) => v.translation);
    const options = shuffle([word.translation, ...wrong]);
    return {
      type,
      word,
      prompt: `What does "${word.word}" mean?`,
      options,
      answer: options.indexOf(word.translation),
      explanation: `"${word.word}" means "${word.translation}".`,
    };
  });
}

function VocabQuizPage() {
  const { user, stats, refresh } = useAuth();
  const { data: vocab = [], isLoading } = useQuery(vocabularyQuery());

  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [pos, setPos] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [finished, setFinished] = useState(false);

  const canPlay = vocab.length >= 4;
  const q = questions?.[pos];

  const start = () => {
    setQuestions(buildQuiz(vocab, Math.min(10, vocab.length)));
    setPos(0);
    setSelected(null);
    setScore(0);
    setXp(0);
    setFinished(false);
  };

  const answer = async (idx: number) => {
    if (selected !== null || !q) return;
    setSelected(idx);
    const isCorrect = idx === q.answer;
    if (isCorrect) {
      setScore((s) => s + 1);
      setXp((x) => x + XP_PER_CORRECT);
    }
  };

  const next = async () => {
    if (!questions) return;
    if (pos + 1 < questions.length) {
      setPos((p) => p + 1);
      setSelected(null);
    } else {
      // finish: award XP + achievements
      const perfect = score === questions.length;
      const totalXp = xp + (perfect ? PERFECT_BONUS : 0);
      if (user && stats && totalXp > 0) {
        try {
          await recordActivity(stats, totalXp);
          if (perfect) {
            const { data: ach } = await supabase
              .from("achievements")
              .select("id")
              .eq("code", "perfect_quiz")
              .maybeSingle();
            if (ach) await grantAchievement(user.id, ach.id);
          }
          await refresh();
        } catch {
          /* non-blocking */
        }
      }
      setXp(totalXp);
      setFinished(true);
    }
  };

  const accuracy = questions?.length ? Math.round((score / questions.length) * 100) : 0;

  const quizMeta: Record<QuizType, string> = {
    meaning: "Choose the meaning",
    reverse: "Choose the word",
    fill: "Complete the sentence",
    listening: "Listening",
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold">Vocabulary Quiz</h1>
            <p className="text-sm text-muted-foreground">Test yourself with instant feedback.</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/vocabulary">
              <ArrowLeft className="h-4 w-4" /> Browse
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <Skeleton className="mt-6 h-72 rounded-2xl" />
        ) : !canPlay ? (
          <EmptyState
            className="mt-6"
            icon={<Sparkles className="h-6 w-6" />}
            title="Not enough words yet"
            description="You need at least 4 vocabulary words to start a quiz."
          />
        ) : !questions ? (
          <Card className="mt-6 p-8 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 font-display text-xl font-extrabold">Ready to test your vocabulary?</h2>
            <p className="mt-1 text-muted-foreground">
              10 questions · meaning, matching, listening & fill-in-the-blank.
            </p>
            <Button variant="hero" className="mt-5 w-full" onClick={start}>
              Start quiz
            </Button>
          </Card>
        ) : finished ? (
          <Card className="mt-6 animate-scale-in p-8 text-center">
            <Trophy className="mx-auto h-14 w-14 text-gold" />
            <h2 className="mt-4 font-display text-2xl font-extrabold">
              {accuracy === 100 ? "Perfect score! 🏆" : accuracy >= 70 ? "Well done! 🎉" : "Keep practising! 💪"}
            </h2>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <SummaryStat icon={<CheckCircle2 className="h-4 w-4 text-success" />} label="Score" value={`${score}/${questions.length}`} />
              <SummaryStat icon={<Target className="h-4 w-4 text-primary" />} label="Accuracy" value={`${accuracy}%`} />
              <SummaryStat icon={<Star className="h-4 w-4 text-gold" />} label="XP" value={`+${xp}`} />
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button variant="hero" className="flex-1" onClick={start}>
                Try again
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/vocabulary/flashcards">Practice flashcards</Link>
              </Button>
            </div>
          </Card>
        ) : q ? (
          <>
            <div className="mt-6 flex items-center justify-between text-sm font-bold text-muted-foreground">
              <span>
                Question {pos + 1} of {questions.length}
              </span>
              <span className="flex items-center gap-1 text-gold">
                <Star className="h-4 w-4" /> +{xp} XP
              </span>
            </div>
            <Progress value={(pos / questions.length) * 100} className="mt-2 h-2" />

            <Card className="mt-4 p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">{quizMeta[q.type]}</p>
              {q.type === "listening" ? (
                <div className="mt-3 flex flex-col items-center gap-2 py-4">
                  <AudioButton text={q.word.word} src={q.word.audio_url} variant="outline" size={"icon" as never} className="h-16 w-16" />
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Volume2 className="h-4 w-4" /> Tap to listen
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-lg font-bold">{q.prompt}</p>
              )}

              <div className="mt-4 grid gap-2">
                {q.options.map((opt, idx) => {
                  const isAnswer = idx === q.answer;
                  const isPicked = idx === selected;
                  const revealed = selected !== null;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={revealed}
                      onClick={() => void answer(idx)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left font-bold transition-colors disabled:cursor-default",
                        !revealed && "border-border hover:border-primary hover:bg-primary/5",
                        revealed && isAnswer && "border-success bg-success/10 text-success",
                        revealed && isPicked && !isAnswer && "border-destructive bg-destructive/10 text-destructive",
                        revealed && !isAnswer && !isPicked && "border-border opacity-60",
                      )}
                    >
                      {opt}
                      {revealed && isAnswer && <CheckCircle2 className="h-5 w-5 shrink-0" />}
                      {revealed && isPicked && !isAnswer && <XCircle className="h-5 w-5 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <div className="mt-4 animate-fade-in rounded-xl bg-muted/50 p-4">
                  <p className="text-sm font-bold">
                    {selected === q.answer ? "Correct! ✅" : "Not quite."}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{q.explanation}</p>
                  <Button variant="hero" className="mt-3 w-full" onClick={() => void next()}>
                    {pos + 1 < questions.length ? "Next question" : "See results"}
                  </Button>
                </div>
              )}
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
}

function SummaryStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-1 font-display text-xl font-extrabold">{value}</p>
    </div>
  );
}
