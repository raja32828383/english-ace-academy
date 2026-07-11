import { supabase } from "@/integrations/supabase/client";
import { recordActivity, grantAchievement } from "@/lib/gamification";
import type { UserStats } from "@/lib/auth";
import type { ReadingLesson } from "@/lib/reading-content";

export type LabMode = "reading" | "listening";

/** Grant an achievement by its human code (looks up the row id). */
async function grantByCode(userId: string, code: string) {
  const { data } = await supabase
    .from("achievements")
    .select("id")
    .eq("code", code)
    .maybeSingle();
  if (data?.id) await grantAchievement(userId, data.id);
}

/** Save/refresh a learner's position in a lesson (called on open). */
export async function touchReadingProgress(userId: string, lessonSlug: string) {
  const { data: existing } = await supabase
    .from("reading_progress")
    .select("status")
    .eq("user_id", userId)
    .eq("lesson_slug", lessonSlug)
    .maybeSingle();

  await supabase.from("reading_progress").upsert(
    {
      user_id: userId,
      lesson_slug: lessonSlug,
      status: existing?.status === "completed" ? "completed" : "in_progress",
      last_viewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_slug" },
  );
}

/** Add reading or listening time (seconds) to a lesson's tally. */
export async function addLabTime(
  userId: string,
  lessonSlug: string,
  mode: LabMode,
  seconds: number,
) {
  if (seconds <= 0) return;
  const { data: existing } = await supabase
    .from("reading_progress")
    .select("reading_seconds, listening_seconds")
    .eq("user_id", userId)
    .eq("lesson_slug", lessonSlug)
    .maybeSingle();

  const readingSeconds =
    (existing?.reading_seconds ?? 0) +
    (mode === "reading" ? Math.round(seconds) : 0);
  const listeningSeconds =
    (existing?.listening_seconds ?? 0) +
    (mode === "listening" ? Math.round(seconds) : 0);

  await supabase.from("reading_progress").upsert(
    {
      user_id: userId,
      lesson_slug: lessonSlug,
      reading_seconds: readingSeconds,
      listening_seconds: listeningSeconds,
      last_viewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_slug" },
  );

  // 100 minutes reading badge.
  if (mode === "reading" && readingSeconds >= 100 * 60) {
    await grantByCode(userId, "reading_100min");
  }
}

/** Toggle a lesson bookmark. */
export async function toggleReadingBookmark(
  userId: string,
  lessonSlug: string,
  next: boolean,
) {
  if (next) {
    const { error } = await supabase.from("reading_bookmarks").upsert(
      { user_id: userId, lesson_slug: lessonSlug },
      { onConflict: "user_id,lesson_slug", ignoreDuplicates: true },
    );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("reading_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("lesson_slug", lessonSlug);
    if (error) throw error;
  }
}

/** Create a highlight / note. */
export async function addReadingNote(input: {
  userId: string;
  lessonSlug: string;
  quote?: string | null;
  note?: string | null;
  paragraphIndex?: number | null;
  color?: string;
}) {
  const { error } = await supabase.from("reading_notes").insert({
    user_id: input.userId,
    lesson_slug: input.lessonSlug,
    quote: input.quote ?? null,
    note: input.note ?? null,
    paragraph_index: input.paragraphIndex ?? null,
    color: input.color ?? "gold",
  });
  if (error) throw error;
}

/** Delete a note by id. */
export async function deleteReadingNote(noteId: string) {
  const { error } = await supabase
    .from("reading_notes")
    .delete()
    .eq("id", noteId);
  if (error) throw error;
}

/**
 * Complete a Lab quiz (reading or listening): store the attempt, update best
 * score, per-mode accuracy, mark completed, award XP once, and grant badges.
 */
export async function completeReadingQuiz({
  userId,
  stats,
  lesson,
  mode,
  score,
  correct,
  total,
}: {
  userId: string;
  stats: UserStats | null;
  lesson: ReadingLesson;
  mode: LabMode;
  score: number;
  correct: number;
  total: number;
}) {
  await supabase.from("reading_quiz_attempts").insert({
    user_id: userId,
    lesson_slug: lesson.slug,
    kind: mode,
    score,
    correct,
    total,
  });

  const { data: prev } = await supabase
    .from("reading_progress")
    .select("status, best_score, reading_accuracy, listening_accuracy")
    .eq("user_id", userId)
    .eq("lesson_slug", lesson.slug)
    .maybeSingle();

  const alreadyCompleted = prev?.status === "completed";
  const bestScore = Math.max(prev?.best_score ?? 0, score);
  const readingAccuracy =
    mode === "reading"
      ? Math.max(prev?.reading_accuracy ?? 0, score)
      : (prev?.reading_accuracy ?? null);
  const listeningAccuracy =
    mode === "listening"
      ? Math.max(prev?.listening_accuracy ?? 0, score)
      : (prev?.listening_accuracy ?? null);

  await supabase.from("reading_progress").upsert(
    {
      user_id: userId,
      lesson_slug: lesson.slug,
      status: "completed",
      best_score: bestScore,
      reading_accuracy: readingAccuracy,
      listening_accuracy: listeningAccuracy,
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

  // Achievements ------------------------------------------------------------
  await grantBadgesForMode(userId, mode);
  if (score >= 100) await grantByCode(userId, "reading_perfect_quiz");

  return { bestScore, xpAwarded, firstCompletion: !alreadyCompleted };
}

/** Grant first / 10-lesson badges based on completed attempts for a mode. */
async function grantBadgesForMode(userId: string, mode: LabMode) {
  const { data } = await supabase
    .from("reading_quiz_attempts")
    .select("lesson_slug")
    .eq("user_id", userId)
    .eq("kind", mode);
  const distinct = new Set((data ?? []).map((r) => r.lesson_slug)).size;
  if (mode === "reading") {
    if (distinct >= 1) await grantByCode(userId, "reading_first");
    if (distinct >= 10) await grantByCode(userId, "reading_10");
  } else {
    if (distinct >= 1) await grantByCode(userId, "listening_first");
    if (distinct >= 10) await grantByCode(userId, "listening_10");
  }
}
