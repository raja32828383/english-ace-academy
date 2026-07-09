import { queryOptions } from "@tanstack/react-query";
import {
  Apple,
  Baby,
  Briefcase,
  Bus,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Home,
  Leaf,
  MessagesSquare,
  Music,
  PawPrint,
  Plane,
  School,
  ShoppingBag,
  Laptop,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Level } from "@/lib/data";

/** Word learning status (SM-2 lifecycle). */
export type WordStatus = "new" | "learning" | "review" | "mastered" | "forgotten";

export interface VocabCategoryMeta {
  id: string;
  label: string;
  icon: LucideIcon;
  tint: string;
}

/**
 * Scalable category registry. Adding a category here + inserting rows with the
 * matching `category` slug is all that's needed to grow the system.
 */
export const VOCAB_CATEGORIES: VocabCategoryMeta[] = [
  { id: "daily-conversation", label: "Daily Conversation", icon: MessagesSquare, tint: "bg-primary/10 text-primary" },
  { id: "school", label: "School", icon: School, tint: "bg-chart-4/15 text-chart-4" },
  { id: "food", label: "Food", icon: Apple, tint: "bg-coral/10 text-coral" },
  { id: "travel", label: "Travel", icon: Plane, tint: "bg-gold/15 text-gold-foreground" },
  { id: "family", label: "Family", icon: Baby, tint: "bg-chart-5/15 text-chart-5" },
  { id: "business", label: "Business", icon: Briefcase, tint: "bg-primary/10 text-primary" },
  { id: "technology", label: "Technology", icon: Laptop, tint: "bg-chart-4/15 text-chart-4" },
  { id: "health", label: "Health", icon: HeartPulse, tint: "bg-coral/10 text-coral" },
  { id: "animals", label: "Animals", icon: PawPrint, tint: "bg-gold/15 text-gold-foreground" },
  { id: "nature", label: "Nature", icon: Leaf, tint: "bg-chart-5/15 text-chart-5" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, tint: "bg-primary/10 text-primary" },
  { id: "education", label: "Education", icon: GraduationCap, tint: "bg-chart-4/15 text-chart-4" },
  { id: "transportation", label: "Transportation", icon: Bus, tint: "bg-coral/10 text-coral" },
  { id: "sports", label: "Sports", icon: Dumbbell, tint: "bg-gold/15 text-gold-foreground" },
  { id: "entertainment", label: "Entertainment", icon: Music, tint: "bg-chart-5/15 text-chart-5" },
];

const CATEGORY_MAP = new Map(VOCAB_CATEGORIES.map((c) => [c.id, c]));

export function categoryInfo(id: string): VocabCategoryMeta {
  return CATEGORY_MAP.get(id) ?? { id, label: id, icon: Home, tint: "bg-muted text-muted-foreground" };
}

export const STATUS_META: Record<WordStatus, { label: string; tint: string }> = {
  new: { label: "New", tint: "bg-muted text-muted-foreground" },
  learning: { label: "Learning", tint: "bg-primary/10 text-primary" },
  review: { label: "Review", tint: "bg-coral/10 text-coral" },
  mastered: { label: "Mastered", tint: "bg-success/15 text-success" },
  forgotten: { label: "Forgotten", tint: "bg-destructive/10 text-destructive" },
};

export const DIFFICULTY_META: Record<Level, { label: string; tint: string }> = {
  beginner: { label: "Beginner", tint: "bg-success/15 text-success" },
  intermediate: { label: "Intermediate", tint: "bg-coral/10 text-coral" },
  advanced: { label: "Advanced", tint: "bg-destructive/10 text-destructive" },
};

/** Per-user vocabulary learning row (stored in flashcard_reviews). */
export interface UserVocabState {
  vocabulary_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_date: string;
  status: WordStatus;
  is_favorite: boolean;
  mastery_score: number;
  review_count: number;
  correct_count: number;
}

export const userVocabQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["user-vocab", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flashcard_reviews")
        .select(
          "vocabulary_id, ease_factor, interval_days, repetitions, due_date, status, is_favorite, mastery_score, review_count, correct_count",
        )
        .eq("user_id", userId!);
      if (error) throw error;
      return data as unknown as UserVocabState[];
    },
  });

/** Derive a status from SM-2 state (used when persisting reviews). */
export function deriveStatus(repetitions: number, lastQuality: number): WordStatus {
  if (lastQuality < 3) return "forgotten";
  if (repetitions >= 4) return "mastered";
  if (repetitions >= 2) return "review";
  return "learning";
}

/** Mastery score 0-100 from repetitions + ease. */
export function computeMastery(repetitions: number, easeFactor: number): number {
  const repScore = Math.min(repetitions / 5, 1) * 70;
  const easeScore = Math.min(Math.max((easeFactor - 1.3) / (2.8 - 1.3), 0), 1) * 30;
  return Math.round(repScore + easeScore);
}

/** Very small typo-tolerant match: substring OR ≤1 edit-distance on a token. */
export function fuzzyMatch(haystack: string, needle: string): boolean {
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase().trim();
  if (!n) return true;
  if (h.includes(n)) return true;
  return h.split(/\s+/).some((token) => levenshtein(token, n) <= 1 && Math.abs(token.length - n.length) <= 1);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const k = b.length;
  if (m === 0) return k;
  if (k === 0) return m;
  let prev = Array.from({ length: k + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= k; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[k];
}
