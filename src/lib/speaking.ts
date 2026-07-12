import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  SPEAKING_COURSES,
  SPEAKING_COURSE_ORDER,
  getSpeakingCourse,
  type SpeakingCourse,
} from "@/lib/speaking-content";

export interface SpeakingProgressRow {
  course_slug: string;
  status: string;
  best_score: number | null;
  pronunciation_avg: number | null;
  fluency_avg: number | null;
  confidence_avg: number | null;
  accuracy_avg: number | null;
  sentences_completed: number;
  words_spoken: number;
  speaking_seconds: number;
  completed_at: string | null;
  last_viewed_at: string;
  updated_at: string;
}

export interface SpeakingSessionRow {
  id: string;
  course_slug: string;
  mode: string;
  overall_score: number;
  pronunciation: number;
  fluency: number;
  accuracy: number;
  completeness: number;
  confidence: number;
  sentences_completed: number;
  words_spoken: number;
  duration_seconds: number;
  xp_earned: number;
  created_at: string;
}

export interface SpeakingDailyRow {
  challenge_date: string;
  challenge_type: string;
  score: number | null;
  completed: boolean;
}

export const speakingProgressQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["speaking-progress", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("speaking_progress")
        .select(
          "course_slug, status, best_score, pronunciation_avg, fluency_avg, confidence_avg, accuracy_avg, sentences_completed, words_spoken, speaking_seconds, completed_at, last_viewed_at, updated_at",
        )
        .eq("user_id", userId!);
      if (error) throw error;
      return data as SpeakingProgressRow[];
    },
  });

export const speakingSessionsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["speaking-sessions", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("speaking_sessions")
        .select(
          "id, course_slug, mode, overall_score, pronunciation, fluency, accuracy, completeness, confidence, sentences_completed, words_spoken, duration_seconds, xp_earned, created_at",
        )
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as SpeakingSessionRow[];
    },
  });

export const speakingDailyQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["speaking-daily", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("speaking_daily")
        .select("challenge_date, challenge_type, score, completed")
        .eq("user_id", userId!)
        .order("challenge_date", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data as SpeakingDailyRow[];
    },
  });

// =====================================================================
// Aggregate stats
// =====================================================================

export interface SpeakingStats {
  totalCourses: number;
  completed: number;
  inProgress: number;
  completionPct: number;
  pronunciationAvg: number | null;
  confidenceAvg: number | null;
  accuracyAvg: number | null;
  fluencyAvg: number | null;
  speakingMinutes: number;
  wordsSpoken: number;
  sentencesCompleted: number;
}

function avg(nums: number[]): number | null {
  return nums.length
    ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
    : null;
}

export function computeSpeakingStats(
  progress: SpeakingProgressRow[],
): SpeakingStats {
  const totalCourses = SPEAKING_COURSES.length;
  const completed = progress.filter((p) => p.status === "completed").length;
  const inProgress = progress.filter((p) => p.status === "in_progress").length;
  const pron = progress
    .map((p) => p.pronunciation_avg)
    .filter((s): s is number => typeof s === "number");
  const conf = progress
    .map((p) => p.confidence_avg)
    .filter((s): s is number => typeof s === "number");
  const acc = progress
    .map((p) => p.accuracy_avg)
    .filter((s): s is number => typeof s === "number");
  const flu = progress
    .map((p) => p.fluency_avg)
    .filter((s): s is number => typeof s === "number");
  return {
    totalCourses,
    completed,
    inProgress,
    completionPct: totalCourses
      ? Math.round((completed / totalCourses) * 100)
      : 0,
    pronunciationAvg: avg(pron),
    confidenceAvg: avg(conf),
    accuracyAvg: avg(acc),
    fluencyAvg: avg(flu),
    speakingMinutes: Math.round(
      progress.reduce((s, p) => s + (p.speaking_seconds ?? 0), 0) / 60,
    ),
    wordsSpoken: progress.reduce((s, p) => s + (p.words_spoken ?? 0), 0),
    sentencesCompleted: progress.reduce(
      (s, p) => s + (p.sentences_completed ?? 0),
      0,
    ),
  };
}

/** First not-completed course in curriculum order, else the first course. */
export function recommendedSpeakingCourse(
  progress: SpeakingProgressRow[],
): SpeakingCourse {
  const completed = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.course_slug),
  );
  for (const slug of SPEAKING_COURSE_ORDER) {
    if (!completed.has(slug)) return getSpeakingCourse(slug)!;
  }
  return getSpeakingCourse(SPEAKING_COURSE_ORDER[0])!;
}

/** Most recently practised course (for "Continue" surfaces). */
export function recentSpeakingCourse(
  progress: SpeakingProgressRow[],
): SpeakingCourse | undefined {
  const sorted = [...progress].sort((a, b) =>
    (b.last_viewed_at ?? "").localeCompare(a.last_viewed_at ?? ""),
  );
  for (const p of sorted) {
    const course = getSpeakingCourse(p.course_slug);
    if (course) return course;
  }
  return undefined;
}

// =====================================================================
// Daily challenges
// =====================================================================

export type DailyChallengeType =
  | "speaking"
  | "conversation"
  | "pronunciation"
  | "confidence";

export const DAILY_CHALLENGE_META: Record<
  DailyChallengeType,
  { label: string; description: string }
> = {
  speaking: {
    label: "Daily Speaking",
    description: "Complete one speaking session today.",
  },
  conversation: {
    label: "Daily Conversation",
    description: "Practise a full conversation course today.",
  },
  pronunciation: {
    label: "Daily Pronunciation",
    description: "Score 80%+ pronunciation in any session.",
  },
  confidence: {
    label: "Daily Confidence",
    description: "Speak every practice sentence in a course.",
  },
};

const DAILY_ROTATION: DailyChallengeType[] = [
  "speaking",
  "pronunciation",
  "conversation",
  "confidence",
];

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Deterministic daily challenge based on the date (stable for all users). */
export function challengeForToday(date = todayStr()): DailyChallengeType {
  const day = Math.floor(new Date(date + "T00:00:00").getTime() / 86_400_000);
  return DAILY_ROTATION[day % DAILY_ROTATION.length];
}

export function isDailyDone(
  daily: SpeakingDailyRow[],
  type = challengeForToday(),
  date = todayStr(),
): boolean {
  return daily.some(
    (d) =>
      d.challenge_date === date && d.challenge_type === type && d.completed,
  );
}

/** Count of consecutive days (ending today or yesterday) with a challenge done. */
export function dailyStreak(daily: SpeakingDailyRow[]): number {
  const done = new Set(
    daily.filter((d) => d.completed).map((d) => d.challenge_date),
  );
  let streak = 0;
  const cursor = new Date(todayStr() + "T00:00:00");
  // Allow the streak to count from today or yesterday.
  if (!done.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (done.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
