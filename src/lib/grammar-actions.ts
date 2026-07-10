import { supabase } from "@/integrations/supabase/client";
import { recordActivity } from "@/lib/gamification";
import type { UserStats } from "@/lib/auth";
import type { GrammarLesson } from "@/lib/grammar-content";

/** Save/refresh a learner's position in a lesson (called on open). */
export async function touchLessonProgress(userId: string, lessonSlug: string) {
  const { data: existing } = await supabase
    .from("grammar_progress")
    .select("status")
    .eq("user_id", userId)
    .eq("lesson_slug", lessonSlug)
    .maybeSingle();

  await supabase.from("grammar_progress").upsert(
    {
      user_id: userId,
      lesson_slug: lessonSlug,
      status: existing?.status === "completed" ? "completed" : "in_progress",
      last_viewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_slug" },
  );
}

/** Add extra study time (seconds) to a lesson's tally. */
export async function addStudyTime(
  userId: string,
  lessonSlug: string,
  seconds: number,
) {
  if (seconds <= 0) return;
  const { data: existing } = await supabase
    .from("grammar_progress")
    .select("time_spent_seconds")
    .eq("user_id", userId)
    .eq("lesson_slug", lessonSlug)
    .maybeSingle();
  await supabase.from("grammar_progress").upsert(
    {
      user_id: userId,
      lesson_slug: lessonSlug,
      time_spent_seconds: (existing?.time_spent_seconds ?? 0) + Math.round(seconds),
      last_viewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_slug" },
  );
}

/**
 * Complete a lesson after the quiz: store the attempt, update best score and
 * mastery, mark completed, and award XP (once per lesson) with streak logic.
 */
export async function completeGrammarLesson({
  userId,
  stats,
  lesson,
  score,
  correct,
  total,
}: {
  userId: string;
  stats: UserStats | null;
  lesson: GrammarLesson;
  score: number;
  correct: number;
  total: number;
}) {
  // Record the quiz attempt (history for retries).
  await supabase.from("grammar_quiz_attempts").insert({
    user_id: userId,
    lesson_slug: lesson.slug,
    score,
    correct,
    total,
  });

  const { data: prev } = await supabase
    .from("grammar_progress")
    .select("status, best_score, time_spent_seconds")
    .eq("user_id", userId)
    .eq("lesson_slug", lesson.slug)
    .maybeSingle();

  const alreadyCompleted = prev?.status === "completed";
  const bestScore = Math.max(prev?.best_score ?? 0, score);
  const mastery = bestScore; // best quiz score doubles as lesson mastery

  await supabase.from("grammar_progress").upsert(
    {
      user_id: userId,
      lesson_slug: lesson.slug,
      status: "completed",
      best_score: bestScore,
      mastery,
      completed_at: new Date().toISOString(),
      last_viewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_slug" },
  );

  // Award XP only the first time the lesson is completed.
  let xpAwarded = 0;
  if (!alreadyCompleted && stats) {
    await recordActivity(stats, lesson.xpReward);
    xpAwarded = lesson.xpReward;
  }

  return { bestScore, xpAwarded, firstCompletion: !alreadyCompleted };
}

/** Toggle a lesson bookmark. */
export async function toggleGrammarBookmark(
  userId: string,
  lessonSlug: string,
  next: boolean,
) {
  if (next) {
    const { error } = await supabase.from("grammar_bookmarks").upsert(
      { user_id: userId, lesson_slug: lessonSlug },
      { onConflict: "user_id,lesson_slug", ignoreDuplicates: true },
    );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("grammar_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("lesson_slug", lessonSlug);
    if (error) throw error;
  }
}
