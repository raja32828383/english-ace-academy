import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Trophy,
  Star,
  Target,
  Flame,
  RotateCcw,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NativeAudioPlayer } from "@/components/speaking/native-audio-player";
import { MicRecorder } from "@/components/speaking/mic-recorder";
import { FeedbackCard } from "@/components/speaking/feedback-card";
import { ScoreRing } from "@/components/speaking/score-ring";
import { useAuth } from "@/lib/auth";
import { useSpeechRecognition } from "@/lib/speech-recognition";
import {
  scoreSpeech,
  averageScores,
  type PronunciationScore,
} from "@/lib/pronunciation";
import {
  completeSpeakingSession,
  type SessionRecordInput,
} from "@/lib/speaking-actions";
import { MODE_META, type SpeakingCourse } from "@/lib/speaking-content";

type Phase = "practice" | "result";

export function SpeakingSessionRunner({ course }: { course: SpeakingCourse }) {
  const { user, stats, refresh } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const recog = useSpeechRecognition("en-US");

  const lines = course.content.practice;
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [phase, setPhase] = useState<Phase>("practice");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{
    scores: ReturnType<typeof averageScores>;
    xp: number;
  } | null>(null);

  const scoresRef = useRef<PronunciationScore[]>([]);
  const recordsRef = useRef<SessionRecordInput[]>([]);
  const wordsRef = useRef(0);
  const startRef = useRef(Date.now());

  const current = lines[index];
  const isLast = index === lines.length - 1;
  const progressPct = Math.round((index / lines.length) * 100);

  const evaluate = () => {
    const heard = recog.transcript.trim();
    const s = scoreSpeech(current.text, heard, recog.confidence);
    setScore(s);
    recog.stop();
  };

  const commitAndAdvance = async () => {
    if (score) {
      scoresRef.current[index] = score;
      recordsRef.current[index] = {
        sentenceIndex: index,
        expected: current.text,
        recognized: recog.transcript.trim(),
        confidence: Math.round(recog.confidence * 100),
        accuracy: score.sentenceAccuracy,
        wordResults: score.wordResults,
      };
      wordsRef.current += score.correctWords.length + score.incorrectWords.length;
    }
    setScore(null);
    recog.reset();
    if (isLast) {
      await finish();
    } else {
      setIndex((i) => i + 1);
    }
  };

  const retry = () => {
    setScore(null);
    recog.reset();
  };

  const finish = async () => {
    const collected = scoresRef.current.filter(Boolean);
    const agg = averageScores(collected);
    const duration = (Date.now() - startRef.current) / 1000;
    if (user) {
      setSaving(true);
      try {
        const res = await completeSpeakingSession({
          userId: user.id,
          stats,
          course,
          mode: course.mode,
          scores: agg,
          durationSeconds: duration,
          wordsSpoken: wordsRef.current,
          sentencesCompleted: collected.length,
          allSentences: collected.length >= lines.length,
          records: recordsRef.current.filter(Boolean),
        });
        setResult({ scores: agg, xp: res.xpAwarded });
        await refresh();
        queryClient.invalidateQueries({ queryKey: ["speaking-progress", user.id] });
        queryClient.invalidateQueries({ queryKey: ["speaking-sessions", user.id] });
        queryClient.invalidateQueries({ queryKey: ["speaking-daily", user.id] });
        if (res.xpAwarded > 0) toast.success(`+${res.xpAwarded} XP earned!`);
      } catch {
        toast.error("Couldn't save your session. Please try again.");
        setResult({ scores: agg, xp: 0 });
      } finally {
        setSaving(false);
      }
    } else {
      setResult({ scores: agg, xp: 0 });
    }
    setPhase("result");
  };

  const restart = () => {
    scoresRef.current = [];
    recordsRef.current = [];
    wordsRef.current = 0;
    startRef.current = Date.now();
    setIndex(0);
    setScore(null);
    setResult(null);
    recog.reset();
    setPhase("practice");
  };

  const modeMeta = MODE_META[course.mode];

  if (phase === "result" && result) {
    return (
      <Card className="pop-in mx-auto max-w-xl p-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gold/15">
          <Trophy className="h-8 w-8 text-gold-foreground" />
        </div>
        <h2 className="mt-3 font-display text-2xl font-extrabold">Session complete!</h2>
        <p className="text-muted-foreground">{course.title}</p>

        <div className="mt-6 flex justify-center">
          <ScoreRing value={result.scores.overall} size={140} label="Overall" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <ResultStat label="Pronunciation" value={result.scores.pronunciation} />
          <ResultStat label="Accuracy" value={result.scores.accuracy} />
          <ResultStat label="Fluency" value={result.scores.fluency} />
          <ResultStat label="Completeness" value={result.scores.completeness} />
          <ResultStat label="Confidence" value={result.scores.confidence} />
          <div className="rounded-xl bg-gold/10 p-3">
            <p className="flex items-center justify-center gap-1 font-display text-xl font-extrabold text-gold-foreground">
              <Star className="h-4 w-4 fill-gold text-gold" /> +{result.xp}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">XP earned</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={restart}>
            <RotateCcw className="h-4 w-4" /> Retry
          </Button>
          <Button
            variant="hero"
            className="flex-1"
            onClick={() => navigate({ to: "/speaking" })}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" className="mt-2 w-full" asChild>
          <Link to="/dashboard">
            <Home className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/speaking/course/$courseId" params={{ courseId: course.slug }}>
            <ArrowLeft className="h-4 w-4" /> Exit
          </Link>
        </Button>
        <span className="text-sm font-bold text-muted-foreground">
          {index + 1} / {lines.length}
        </span>
      </div>
      <Progress value={progressPct} className="mt-2 h-2" />

      {!modeMeta.available && (
        <p className="mt-3 rounded-xl bg-accent/40 p-3 text-center text-xs font-bold text-accent-foreground">
          {modeMeta.label}: {modeMeta.description}
        </p>
      )}

      <Card className="mt-4 p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          {modeMeta.label} · say this sentence
        </p>
        <p className="mt-2 font-display text-xl font-extrabold leading-snug">
          {current.text}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{current.translation}</p>

        <div className="mt-4">
          <NativeAudioPlayer text={current.text} audioUrl={course.audioUrl} />
        </div>
      </Card>

      <div className="mt-4">
        {score ? (
          <FeedbackCard
            score={score}
            expected={current.text}
            onRetry={retry}
            onNext={commitAndAdvance}
            isLast={isLast}
          />
        ) : (
          <Card className="p-6">
            <MicRecorder
              state={recog.state}
              interim={recog.interim}
              transcript={recog.transcript}
              error={recog.error}
              supported={recog.supported}
              onStart={recog.start}
              onStop={() => {
                evaluate();
              }}
              onPause={recog.pause}
              onResume={recog.resume}
            />
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                disabled={index === 0}
                onClick={() => {
                  setIndex((i) => Math.max(0, i - 1));
                  recog.reset();
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={commitAndAdvance}
                disabled={saving}
              >
                Skip <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
        <span className="flex items-center justify-center gap-1"><Target className="h-3.5 w-3.5" /> {lines.length} sentences</span>
        <span className="flex items-center justify-center gap-1"><Star className="h-3.5 w-3.5 text-gold" /> {course.xpReward} XP</span>
        <span className="flex items-center justify-center gap-1"><Flame className="h-3.5 w-3.5 text-coral" /> {course.content.challenge ? "Challenge" : "Practice"}</span>
      </div>
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <p className="font-display text-xl font-extrabold">{value}%</p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
