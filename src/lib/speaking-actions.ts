import { supabase } from "@/integrations/supabase/client";
import { recordActivity, grantAchievement } from "@/lib/gamification";
import type { UserStats } from "@/lib/auth";
import type { SpeakingCourse, SpeakingMode } from "@/lib/speaking-content";
import {
  challengeForToday,
  dailyStreak,
  todayStr,
  type DailyChallengeType,
} from "@/lib/speaking";
import type { WordResult } from "@/lib/pronunciation";

/** Grant an achievement by its human code (looks up the row id). */
async function grantByCode(userId: string, code: string) {
  const { data } = await supabase
    .from("achievements")
    .select("id")
    .eq("code", code)
    .maybeSingle();
  if (data?.id) await grantAchievement(userId, data.id);
}

/** Save/refresh a learner's position in a course (called on open). */
export async function touchSpeakingProgress(
  userId: string,
  courseSlug: string,
) {
  const { data: existing } = await supabase
    .from("speaking_progress")
    .select("status")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug)
    .maybeSingle();

  await supabase.from("speaking_progress").upsert(
    {
      user_id: userId,
      course_slug: courseSlug,
      status: existing?.status === "completed" ? "completed" : "in_progress",
      last_viewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_slug" },
  );
}

export interface SessionRecordInput {
  sentenceIndex: number;
  expected: string;
  recognized: string;
  confidence: number;
  accuracy: number;
  wordResults: WordResult[];
}

export interface SessionScores {
  overall: number;
  pronunciation: number;
  accuracy: number;
  fluency: number;
  completeness: number;
  confidence: number;
}

export interface CompleteSpeakingSessionInput {
  userId: string;
  stats: UserStats | null;
  course: SpeakingCourse;
  mode: SpeakingMode;
  scores: SessionScores;
  durationSeconds: number;
  wordsSpoken: number;
  sentencesCompleted: number;
  /** True if the learner attempted every practice sentence in the course. */
  allSentences: boolean;
  records: SessionRecordInput[];
}

export interface CompleteSpeakingSessionResult {
  sessionId: string | null;
  xpAwarded: number;
  bestScore: number;
  firstCompletion: boolean;
  dailyCompleted: DailyChallengeType | null;
}

/**
 * Persist a finished speaking session: store the session + per-sentence
 * records, update per-course progress (best scores + lifetime tallies), award
 * XP once, grant badges, and record the daily challenge + streak.
 */
export async function completeSpeakingSession(
  input: CompleteSpeakingSessionInput,
): Promise<CompleteSpeakingSessionResult> {
  const {
    userId,
    stats,
    course,
    mode,
    scores,
    durationSeconds,
    wordsSpoken,
    sentencesCompleted,
    allSentences,
    records,
  } = input;

  // 1) Previous progress (for best-score merge + first-completion XP) --------
  const { data: prev } = await supabase
    .from("speaking_progress")
    .select(
      "status, best_score, pronunciation_avg, fluency_avg, confidence_avg, accuracy_avg, sentences_completed, words_spoken, speaking_seconds",
    )
    .eq("user_id", userId)
    .eq("course_slug", course.slug)
    .maybeSingle();

  const alreadyCompleted = prev?.status === "completed";

  // 2) XP is awarded once per course, plus a bonus for a perfect session -----
  let xpAwarded = 0;
  let perfectBonus = 0;
  if (scores.pronunciation >= 100 || scores.accuracy >= 100) perfectBonus = 15;
  if (stats) {
    const base = alreadyCompleted ? 0 : course.xpReward;
    const total = base + perfectBonus;
    if (total > 0) {
      await recordActivity(stats, total);
      xpAwarded = total;
    }
  }

  // 3) Insert the session row ------------------------------------------------
  const { data: session } = await supabase
    .from("speaking_sessions")
    .insert({
      user_id: userId,
      course_slug: course.slug,
      mode,
      overall_score: scores.overall,
      pronunciation: scores.pronunciation,
      fluency: scores.fluency,
      accuracy: scores.accuracy,
      completeness: scores.completeness,
      confidence: scores.confidence,
      sentences_completed: sentencesCompleted,
      words_spoken: wordsSpoken,
      duration_seconds: Math.round(durationSeconds),
      xp_earned: xpAwarded,
    })
    .select("id")
    .single();

  const sessionId = session?.id ?? null;

  // 4) Insert per-sentence recognition records -------------------------------
  if (records.length > 0) {
    await supabase.from("speaking_records").insert(
      records.map((r) => ({
        user_id: userId,
        session_id: sessionId,
        course_slug: course.slug,
        sentence_index: r.sentenceIndex,
        expected_text: r.expected,
        recognized_text: r.recognized,
        confidence: r.confidence,
        accuracy: r.accuracy,
        word_results: r.wordResults,
      })),
    );
  }

  // 5) Merge progress (keep best sub-scores, accumulate lifetime tallies) -----
  const bestScore = Math.max(prev?.best_score ?? 0, scores.overall);
  await supabase.from("speaking_progress").upsert(
    {
      user_id: userId,
      course_slug: course.slug,
      status: "completed",
      best_score: bestScore,
      pronunciation_avg: Math.max(
        prev?.pronunciation_avg ?? 0,
        scores.pronunciation,
      ),
      fluency_avg: Math.max(prev?.fluency_avg ?? 0, scores.fluency),
      confidence_avg: Math.max(prev?.confidence_avg ?? 0, scores.confidence),
      accuracy_avg: Math.max(prev?.accuracy_avg ?? 0, scores.accuracy),
      sentences_completed: Math.max(
        prev?.sentences_completed ?? 0,
        sentencesCompleted,
      ),
      words_spoken: (prev?.words_spoken ?? 0) + wordsSpoken,
      speaking_seconds:
        (prev?.speaking_seconds ?? 0) + Math.round(durationSeconds),
      completed_at: new Date().toISOString(),
      last_viewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_slug" },
  );

  // 6) Achievements ----------------------------------------------------------
  await grantByCode(userId, "speaking_first");
  if (scores.pronunciation >= 100)
    await grantByCode(userId, "speaking_perfect_pron");
  if (scores.accuracy >= 100) await grantByCode(userId, "speaking_perfect_acc");

  const { count: sessionCount } = await supabase
    .from("speaking_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if ((sessionCount ?? 0) >= 10) await grantByCode(userId, "speaking_10");

  const { data: durations } = await supabase
    .from("speaking_sessions")
    .select("duration_seconds")
    .eq("user_id", userId);
  const totalSeconds = (durations ?? []).reduce(
    (s, r) => s + (r.duration_seconds ?? 0),
    0,
  );
  if (totalSeconds >= 100 * 60) await grantByCode(userId, "speaking_100min");

  // 7) Daily challenge + streak ---------------------------------------------
  const dailyCompleted = await recordDailyChallenge({
    userId,
    scores,
    course,
    allSentences,
  });

  return {
    sessionId,
    xpAwarded,
    bestScore,
    firstCompletion: !alreadyCompleted,
    dailyCompleted,
  };
}

/** Record today's challenge if this session satisfies it; grant streak badge. */
async function recordDailyChallenge(input: {
  userId: string;
  scores: SessionScores;
  course: SpeakingCourse;
  allSentences: boolean;
}): Promise<DailyChallengeType | null> {
  const { userId, scores, course, allSentences } = input;
  const type = challengeForToday();

  const satisfied =
    type === "speaking"
      ? true
      : type === "pronunciation"
        ? scores.pronunciation >= 80
        : type === "conversation"
          ? course.content.conversation.length > 0
          : /* confidence */ allSentences;

  if (!satisfied) return null;

  await supabase.from("speaking_daily").upsert(
    {
      user_id: userId,
      challenge_date: todayStr(),
      challenge_type: type,
      score: scores.overall,
      completed: true,
    },
    { onConflict: "user_id,challenge_date,challenge_type" },
  );

  // Streak badge (7 days in a row).
  const { data: daily } = await supabase
    .from("speaking_daily")
    .select("challenge_date, challenge_type, score, completed")
    .eq("user_id", userId)
    .order("challenge_date", { ascending: false })
    .limit(60);
  if (dailyStreak(daily ?? []) >= 7)
    await grantByCode(userId, "speaking_streak_7");

  return type;
}
