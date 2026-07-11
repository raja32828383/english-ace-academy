import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  READING_LESSONS,
  READING_LESSON_ORDER,
  type ReadingLesson,
} from "@/lib/reading-content";

export interface ReadingProgressRow {
  lesson_slug: string;
  status: string;
  best_score: number | null;
  reading_accuracy: number | null;
  listening_accuracy: number | null;
  reading_seconds: number;
  listening_seconds: number;
  completed_at: string | null;
  last_viewed_at: string;
  updated_at: string;
}

export interface ReadingBookmarkRow {
  lesson_slug: string;
  created_at: string;
}

export interface ReadingNoteRow {
  id: string;
  lesson_slug: string;
  quote: string | null;
  note: string | null;
  paragraph_index: number | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ReadingQuizAttemptRow {
  lesson_slug: string;
  kind: string;
  score: number;
  correct: number;
  total: number;
  created_at: string;
}

export const readingProgressQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["reading-progress", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reading_progress")
        .select(
          "lesson_slug, status, best_score, reading_accuracy, listening_accuracy, reading_seconds, listening_seconds, completed_at, last_viewed_at, updated_at",
        )
        .eq("user_id", userId!);
      if (error) throw error;
      return data as ReadingProgressRow[];
    },
  });

export const readingBookmarksQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["reading-bookmarks", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reading_bookmarks")
        .select("lesson_slug, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ReadingBookmarkRow[];
    },
  });

export const readingNotesQuery = (
  userId: string | undefined,
  lessonSlug?: string,
) =>
  queryOptions({
    queryKey: ["reading-notes", userId, lessonSlug ?? "all"],
    enabled: !!userId,
    queryFn: async () => {
      let query = supabase
        .from("reading_notes")
        .select(
          "id, lesson_slug, quote, note, paragraph_index, color, created_at, updated_at",
        )
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (lessonSlug) query = query.eq("lesson_slug", lessonSlug);
      const { data, error } = await query;
      if (error) throw error;
      return data as ReadingNoteRow[];
    },
  });

export const readingQuizAttemptsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["reading-quiz-attempts", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reading_quiz_attempts")
        .select("lesson_slug, kind, score, correct, total, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ReadingQuizAttemptRow[];
    },
  });

// =====================================================================
// Aggregate stats
// =====================================================================

export interface ReadingStats {
  totalLessons: number;
  completed: number;
  inProgress: number;
  completionPct: number;
  averageScore: number | null;
  readingAccuracy: number | null;
  listeningAccuracy: number | null;
  readingMinutes: number;
  listeningMinutes: number;
}

function avg(nums: number[]): number | null {
  return nums.length
    ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
    : null;
}

export function computeReadingStats(
  progress: ReadingProgressRow[],
): ReadingStats {
  const totalLessons = READING_LESSONS.length;
  const completed = progress.filter((p) => p.status === "completed").length;
  const inProgress = progress.filter((p) => p.status === "in_progress").length;
  const scores = progress
    .map((p) => p.best_score)
    .filter((s): s is number => typeof s === "number");
  const readAcc = progress
    .map((p) => p.reading_accuracy)
    .filter((s): s is number => typeof s === "number");
  const listenAcc = progress
    .map((p) => p.listening_accuracy)
    .filter((s): s is number => typeof s === "number");
  return {
    totalLessons,
    completed,
    inProgress,
    completionPct: totalLessons
      ? Math.round((completed / totalLessons) * 100)
      : 0,
    averageScore: avg(scores),
    readingAccuracy: avg(readAcc),
    listeningAccuracy: avg(listenAcc),
    readingMinutes: Math.round(
      progress.reduce((s, p) => s + (p.reading_seconds ?? 0), 0) / 60,
    ),
    listeningMinutes: Math.round(
      progress.reduce((s, p) => s + (p.listening_seconds ?? 0), 0) / 60,
    ),
  };
}

/** First not-completed lesson in curriculum order, else the first lesson. */
export function recommendedReadingLesson(
  progress: ReadingProgressRow[],
): ReadingLesson {
  const completed = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.lesson_slug),
  );
  const map = new Map(READING_LESSONS.map((l) => [l.slug, l]));
  for (const slug of READING_LESSON_ORDER) {
    if (!completed.has(slug)) return map.get(slug)!;
  }
  return map.get(READING_LESSON_ORDER[0])!;
}

/** Most recently viewed lesson (for "Continue" surfaces). */
export function recentReadingLesson(
  progress: ReadingProgressRow[],
): ReadingLesson | undefined {
  const sorted = [...progress].sort((a, b) =>
    (b.last_viewed_at ?? "").localeCompare(a.last_viewed_at ?? ""),
  );
  const map = new Map(READING_LESSONS.map((l) => [l.slug, l]));
  for (const p of sorted) {
    const lesson = map.get(p.lesson_slug);
    if (lesson) return lesson;
  }
  return undefined;
}
