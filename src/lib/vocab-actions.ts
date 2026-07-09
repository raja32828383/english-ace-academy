import { supabase } from "@/integrations/supabase/client";
import { computeNextReview, type ReviewState } from "@/lib/srs";
import { computeMastery, deriveStatus, type UserVocabState, type WordStatus } from "@/lib/vocab";

/** Toggle favorite, creating the state row if needed. */
export async function toggleFavorite(
  userId: string,
  vocabularyId: string,
  next: boolean,
  existing?: UserVocabState,
) {
  const { error } = await supabase.from("flashcard_reviews").upsert(
    {
      user_id: userId,
      vocabulary_id: vocabularyId,
      is_favorite: next,
      // preserve SRS state when the row already exists
      ease_factor: existing?.ease_factor ?? 2.5,
      interval_days: existing?.interval_days ?? 0,
      repetitions: existing?.repetitions ?? 0,
      status: existing?.status ?? "new",
    },
    { onConflict: "user_id,vocabulary_id" },
  );
  if (error) throw error;
}

/** Persist a spaced-repetition grade and derived status/mastery. */
export async function gradeWord(
  userId: string,
  vocabularyId: string,
  quality: number,
  existing?: UserVocabState,
) {
  const state: ReviewState = existing
    ? { ease_factor: existing.ease_factor, interval_days: existing.interval_days, repetitions: existing.repetitions }
    : { ease_factor: 2.5, interval_days: 0, repetitions: 0 };
  const next = computeNextReview(state, quality);
  const status: WordStatus = deriveStatus(next.repetitions, quality);
  const mastery = computeMastery(next.repetitions, next.ease_factor);

  const { error } = await supabase.from("flashcard_reviews").upsert(
    {
      user_id: userId,
      vocabulary_id: vocabularyId,
      ease_factor: next.ease_factor,
      interval_days: next.interval_days,
      repetitions: next.repetitions,
      due_date: next.due_date,
      last_reviewed: new Date().toISOString(),
      status,
      mastery_score: mastery,
      review_count: (existing?.review_count ?? 0) + 1,
      correct_count: (existing?.correct_count ?? 0) + (quality >= 3 ? 1 : 0),
      is_favorite: existing?.is_favorite ?? false,
    },
    { onConflict: "user_id,vocabulary_id" },
  );
  if (error) throw error;
  return { status, mastery };
}

/** Mark a word as learned (used by the flashcard "Mark Learned" action). */
export async function markLearned(userId: string, vocabularyId: string, existing?: UserVocabState) {
  return gradeWord(userId, vocabularyId, 4, existing);
}
