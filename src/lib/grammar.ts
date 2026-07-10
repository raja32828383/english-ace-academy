import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  GRAMMAR_LESSONS,
  GRAMMAR_LESSON_ORDER,
  type GrammarLesson,
} from "@/lib/grammar-content";

export interface GrammarProgressRow {
  lesson_slug: string;
  status: string;
  best_score: number | null;
  mastery: number;
  time_spent_seconds: number;
  completed_at: string | null;
  updated_at: string;
}

export interface GrammarBookmarkRow {
  lesson_slug: string;
  created_at: string;
}

export interface GrammarQuizAttemptRow {
  lesson_slug: string;
  score: number;
  correct: number;
  total: number;
  created_at: string;
}

export const grammarProgressQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["grammar-progress", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grammar_progress")
        .select(
          "lesson_slug, status, best_score, mastery, time_spent_seconds, completed_at, updated_at",
        )
        .eq("user_id", userId!);
      if (error) throw error;
      return data as GrammarProgressRow[];
    },
  });

export const grammarBookmarksQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["grammar-bookmarks", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grammar_bookmarks")
        .select("lesson_slug, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as GrammarBookmarkRow[];
    },
  });

export const grammarQuizAttemptsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["grammar-quiz-attempts", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grammar_quiz_attempts")
        .select("lesson_slug, score, correct, total, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as GrammarQuizAttemptRow[];
    },
  });

/** Aggregate stats used by the hub + dashboard. */
export interface GrammarStats {
  totalLessons: number;
  completed: number;
  inProgress: number;
  completionPct: number;
  averageScore: number | null;
  masteryPct: number;
  totalMinutes: number;
}

export function computeGrammarStats(progress: GrammarProgressRow[]): GrammarStats {
  const totalLessons = GRAMMAR_LESSONS.length;
  const completed = progress.filter((p) => p.status === "completed").length;
  const inProgress = progress.filter((p) => p.status === "in_progress").length;
  const scores = progress
    .map((p) => p.best_score)
    .filter((s): s is number => typeof s === "number");
  const averageScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;
  const masterySum = progress.reduce((sum, p) => sum + (p.mastery ?? 0), 0);
  const masteryPct = totalLessons
    ? Math.round(masterySum / totalLessons)
    : 0;
  const totalMinutes = Math.round(
    progress.reduce((sum, p) => sum + (p.time_spent_seconds ?? 0), 0) / 60,
  );
  return {
    totalLessons,
    completed,
    inProgress,
    completionPct: totalLessons ? Math.round((completed / totalLessons) * 100) : 0,
    averageScore,
    masteryPct,
    totalMinutes,
  };
}

/**
 * The next lesson a learner should continue with: the first not-completed
 * lesson in curriculum order, otherwise the very first lesson.
 */
export function recommendedGrammarLesson(
  progress: GrammarProgressRow[],
): GrammarLesson {
  const completed = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.lesson_slug),
  );
  const map = new Map(GRAMMAR_LESSONS.map((l) => [l.slug, l]));
  for (const slug of GRAMMAR_LESSON_ORDER) {
    if (!completed.has(slug)) return map.get(slug)!;
  }
  return map.get(GRAMMAR_LESSON_ORDER[0])!;
}

/** The most recently touched lesson (for "Recent lesson" surfaces). */
export function recentGrammarLesson(
  progress: GrammarProgressRow[],
): GrammarLesson | undefined {
  const sorted = [...progress].sort((a, b) =>
    (b.updated_at ?? "").localeCompare(a.updated_at ?? ""),
  );
  const map = new Map(GRAMMAR_LESSONS.map((l) => [l.slug, l]));
  for (const p of sorted) {
    const lesson = map.get(p.lesson_slug);
    if (lesson) return lesson;
  }
  return undefined;
}
