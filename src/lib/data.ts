import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Level = "beginner" | "intermediate" | "advanced";
export type Category = "vocabulary" | "grammar" | "listening" | "speaking" | "reading" | "quiz";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface LessonContent {
  intro?: string;
  passage?: string;
  prompt?: string;
  quiz?: QuizQuestion[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  level: Level;
  category: Category;
  content: LessonContent;
  order_index: number;
  xp_reward: number;
  published: boolean;
  created_at: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  translation: string;
  example: string | null;
  phonetic: string | null;
  level: Level;
}

export const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

export const lessonsQuery = () =>
  queryOptions({
    queryKey: ["lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as unknown as Lesson[];
    },
  });

export const lessonQuery = (id: string) =>
  queryOptions({
    queryKey: ["lesson", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("lessons").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as unknown as Lesson | null;
    },
  });

export const vocabularyQuery = () =>
  queryOptions({
    queryKey: ["vocabulary"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vocabulary").select("*").order("word");
      if (error) throw error;
      return data as unknown as Vocabulary[];
    },
  });

export const leaderboardQuery = () =>
  queryOptions({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_stats")
        .select("user_id, xp, current_streak, longest_streak, profiles(display_name, avatar_url)")
        .order("xp", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as unknown as Array<{
        user_id: string;
        xp: number;
        current_streak: number;
        longest_streak: number;
        profiles: { display_name: string; avatar_url: string | null } | null;
      }>;
    },
  });
