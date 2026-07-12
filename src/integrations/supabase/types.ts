export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string
          created_at: string
          description: string | null
          icon: string
          id: string
          title: string
          xp_reward: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          title: string
          xp_reward?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      flashcard_reviews: {
        Row: {
          correct_count: number
          created_at: string
          due_date: string
          ease_factor: number
          id: string
          interval_days: number
          is_favorite: boolean
          last_reviewed: string | null
          mastery_score: number
          repetitions: number
          review_count: number
          status: string
          user_id: string
          vocabulary_id: string
        }
        Insert: {
          correct_count?: number
          created_at?: string
          due_date?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          is_favorite?: boolean
          last_reviewed?: string | null
          mastery_score?: number
          repetitions?: number
          review_count?: number
          status?: string
          user_id: string
          vocabulary_id: string
        }
        Update: {
          correct_count?: number
          created_at?: string
          due_date?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          is_favorite?: boolean
          last_reviewed?: string | null
          mastery_score?: number
          repetitions?: number
          review_count?: number
          status?: string
          user_id?: string
          vocabulary_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabulary"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_ai_checks: {
        Row: {
          corrections: Json
          created_at: string
          id: string
          input_text: string
          overall_feedback: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          corrections?: Json
          created_at?: string
          id?: string
          input_text: string
          overall_feedback?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          corrections?: Json
          created_at?: string
          id?: string
          input_text?: string
          overall_feedback?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grammar_bookmarks: {
        Row: {
          created_at: string
          id: string
          lesson_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      grammar_lessons: {
        Row: {
          content: Json
          created_at: string
          estimated_minutes: number
          id: string
          level: string
          order_index: number
          published: boolean
          slug: string
          summary: string | null
          title: string
          unit_slug: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          content?: Json
          created_at?: string
          estimated_minutes?: number
          id?: string
          level?: string
          order_index?: number
          published?: boolean
          slug: string
          summary?: string | null
          title: string
          unit_slug: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          content?: Json
          created_at?: string
          estimated_minutes?: number
          id?: string
          level?: string
          order_index?: number
          published?: boolean
          slug?: string
          summary?: string | null
          title?: string
          unit_slug?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      grammar_progress: {
        Row: {
          best_score: number | null
          completed_at: string | null
          created_at: string
          id: string
          last_viewed_at: string
          lesson_slug: string
          mastery: number
          status: string
          time_spent_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_score?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_viewed_at?: string
          lesson_slug: string
          mastery?: number
          status?: string
          time_spent_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_score?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_viewed_at?: string
          lesson_slug?: string
          mastery?: number
          status?: string
          time_spent_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grammar_quiz_attempts: {
        Row: {
          correct: number
          created_at: string
          id: string
          lesson_slug: string
          score: number
          total: number
          user_id: string
        }
        Insert: {
          correct: number
          created_at?: string
          id?: string
          lesson_slug: string
          score: number
          total: number
          user_id: string
        }
        Update: {
          correct?: number
          created_at?: string
          id?: string
          lesson_slug?: string
          score?: number
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      grammar_units: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          level: string
          order_index: number
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          level?: string
          order_index?: number
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          level?: string
          order_index?: number
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          score: number
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          score?: number
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          score?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          category: Database["public"]["Enums"]["lesson_category"]
          content: Json
          created_at: string
          description: string | null
          id: string
          level: Database["public"]["Enums"]["lesson_level"]
          order_index: number
          published: boolean
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          category?: Database["public"]["Enums"]["lesson_category"]
          content?: Json
          created_at?: string
          description?: string | null
          id?: string
          level?: Database["public"]["Enums"]["lesson_level"]
          order_index?: number
          published?: boolean
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["lesson_category"]
          content?: Json
          created_at?: string
          description?: string | null
          id?: string
          level?: Database["public"]["Enums"]["lesson_level"]
          order_index?: number
          published?: boolean
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reading_bookmarks: {
        Row: {
          created_at: string
          id: string
          lesson_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_lessons: {
        Row: {
          audio_url: string | null
          category: string
          content: Json
          created_at: string
          estimated_minutes: number
          id: string
          image_url: string | null
          level: string
          order_index: number
          published: boolean
          slug: string
          summary: string | null
          title: string
          topic: string | null
          updated_at: string
          xp_reward: number
        }
        Insert: {
          audio_url?: string | null
          category: string
          content?: Json
          created_at?: string
          estimated_minutes?: number
          id?: string
          image_url?: string | null
          level: string
          order_index?: number
          published?: boolean
          slug: string
          summary?: string | null
          title: string
          topic?: string | null
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          audio_url?: string | null
          category?: string
          content?: Json
          created_at?: string
          estimated_minutes?: number
          id?: string
          image_url?: string | null
          level?: string
          order_index?: number
          published?: boolean
          slug?: string
          summary?: string | null
          title?: string
          topic?: string | null
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      reading_notes: {
        Row: {
          color: string
          created_at: string
          id: string
          lesson_slug: string
          note: string | null
          paragraph_index: number | null
          quote: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          lesson_slug: string
          note?: string | null
          paragraph_index?: number | null
          quote?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          lesson_slug?: string
          note?: string | null
          paragraph_index?: number | null
          quote?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          best_score: number | null
          completed_at: string | null
          created_at: string
          id: string
          last_viewed_at: string
          lesson_slug: string
          listening_accuracy: number | null
          listening_seconds: number
          reading_accuracy: number | null
          reading_seconds: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          best_score?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_viewed_at?: string
          lesson_slug: string
          listening_accuracy?: number | null
          listening_seconds?: number
          reading_accuracy?: number | null
          reading_seconds?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          best_score?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_viewed_at?: string
          lesson_slug?: string
          listening_accuracy?: number | null
          listening_seconds?: number
          reading_accuracy?: number | null
          reading_seconds?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_quiz_attempts: {
        Row: {
          correct: number
          created_at: string
          id: string
          kind: string
          lesson_slug: string
          score: number
          total: number
          user_id: string
        }
        Insert: {
          correct: number
          created_at?: string
          id?: string
          kind?: string
          lesson_slug: string
          score: number
          total: number
          user_id: string
        }
        Update: {
          correct?: number
          created_at?: string
          id?: string
          kind?: string
          lesson_slug?: string
          score?: number
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      speaking_courses: {
        Row: {
          audio_url: string | null
          category: string
          content: Json
          created_at: string
          estimated_minutes: number
          id: string
          image_url: string | null
          level: string
          order_index: number
          published: boolean
          slug: string
          summary: string | null
          title: string
          topic: string | null
          updated_at: string
          xp_reward: number
        }
        Insert: {
          audio_url?: string | null
          category: string
          content?: Json
          created_at?: string
          estimated_minutes?: number
          id?: string
          image_url?: string | null
          level: string
          order_index?: number
          published?: boolean
          slug: string
          summary?: string | null
          title: string
          topic?: string | null
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          audio_url?: string | null
          category?: string
          content?: Json
          created_at?: string
          estimated_minutes?: number
          id?: string
          image_url?: string | null
          level?: string
          order_index?: number
          published?: boolean
          slug?: string
          summary?: string | null
          title?: string
          topic?: string | null
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      speaking_daily: {
        Row: {
          challenge_date: string
          challenge_type: string
          completed: boolean
          created_at: string
          id: string
          score: number | null
          user_id: string
        }
        Insert: {
          challenge_date?: string
          challenge_type?: string
          completed?: boolean
          created_at?: string
          id?: string
          score?: number | null
          user_id: string
        }
        Update: {
          challenge_date?: string
          challenge_type?: string
          completed?: boolean
          created_at?: string
          id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      speaking_progress: {
        Row: {
          accuracy_avg: number | null
          best_score: number | null
          completed_at: string | null
          confidence_avg: number | null
          course_slug: string
          created_at: string
          fluency_avg: number | null
          id: string
          last_viewed_at: string
          pronunciation_avg: number | null
          sentences_completed: number
          speaking_seconds: number
          status: string
          updated_at: string
          user_id: string
          words_spoken: number
        }
        Insert: {
          accuracy_avg?: number | null
          best_score?: number | null
          completed_at?: string | null
          confidence_avg?: number | null
          course_slug: string
          created_at?: string
          fluency_avg?: number | null
          id?: string
          last_viewed_at?: string
          pronunciation_avg?: number | null
          sentences_completed?: number
          speaking_seconds?: number
          status?: string
          updated_at?: string
          user_id: string
          words_spoken?: number
        }
        Update: {
          accuracy_avg?: number | null
          best_score?: number | null
          completed_at?: string | null
          confidence_avg?: number | null
          course_slug?: string
          created_at?: string
          fluency_avg?: number | null
          id?: string
          last_viewed_at?: string
          pronunciation_avg?: number | null
          sentences_completed?: number
          speaking_seconds?: number
          status?: string
          updated_at?: string
          user_id?: string
          words_spoken?: number
        }
        Relationships: []
      }
      speaking_records: {
        Row: {
          accuracy: number | null
          confidence: number | null
          course_slug: string
          created_at: string
          expected_text: string
          id: string
          recognized_text: string | null
          sentence_index: number
          session_id: string | null
          user_id: string
          word_results: Json
        }
        Insert: {
          accuracy?: number | null
          confidence?: number | null
          course_slug: string
          created_at?: string
          expected_text: string
          id?: string
          recognized_text?: string | null
          sentence_index?: number
          session_id?: string | null
          user_id: string
          word_results?: Json
        }
        Update: {
          accuracy?: number | null
          confidence?: number | null
          course_slug?: string
          created_at?: string
          expected_text?: string
          id?: string
          recognized_text?: string | null
          sentence_index?: number
          session_id?: string | null
          user_id?: string
          word_results?: Json
        }
        Relationships: [
          {
            foreignKeyName: "speaking_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "speaking_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      speaking_sessions: {
        Row: {
          accuracy: number
          completeness: number
          confidence: number
          course_slug: string
          created_at: string
          duration_seconds: number
          fluency: number
          id: string
          mode: string
          overall_score: number
          pronunciation: number
          sentences_completed: number
          user_id: string
          words_spoken: number
          xp_earned: number
        }
        Insert: {
          accuracy?: number
          completeness?: number
          confidence?: number
          course_slug: string
          created_at?: string
          duration_seconds?: number
          fluency?: number
          id?: string
          mode?: string
          overall_score?: number
          pronunciation?: number
          sentences_completed?: number
          user_id: string
          words_spoken?: number
          xp_earned?: number
        }
        Update: {
          accuracy?: number
          completeness?: number
          confidence?: number
          course_slug?: string
          created_at?: string
          duration_seconds?: number
          fluency?: number
          id?: string
          mode?: string
          overall_score?: number
          pronunciation?: number
          sentences_completed?: number
          user_id?: string
          words_spoken?: number
          xp_earned?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string
          current_streak: number
          hearts: number
          last_active_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          current_streak?: number
          hearts?: number
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          hearts?: number
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      vocabulary: {
        Row: {
          antonyms: string[]
          audio_url: string | null
          category: string
          created_at: string
          english_definition: string | null
          example: string | null
          example_translation: string | null
          id: string
          image_url: string | null
          level: Database["public"]["Enums"]["lesson_level"]
          part_of_speech: string | null
          phonetic: string | null
          pronunciation: string | null
          synonyms: string[]
          tags: string[]
          translation: string
          updated_at: string
          word: string
        }
        Insert: {
          antonyms?: string[]
          audio_url?: string | null
          category?: string
          created_at?: string
          english_definition?: string | null
          example?: string | null
          example_translation?: string | null
          id?: string
          image_url?: string | null
          level?: Database["public"]["Enums"]["lesson_level"]
          part_of_speech?: string | null
          phonetic?: string | null
          pronunciation?: string | null
          synonyms?: string[]
          tags?: string[]
          translation: string
          updated_at?: string
          word: string
        }
        Update: {
          antonyms?: string[]
          audio_url?: string | null
          category?: string
          created_at?: string
          english_definition?: string | null
          example?: string | null
          example_translation?: string | null
          id?: string
          image_url?: string | null
          level?: Database["public"]["Enums"]["lesson_level"]
          part_of_speech?: string | null
          phonetic?: string | null
          pronunciation?: string | null
          synonyms?: string[]
          tags?: string[]
          translation?: string
          updated_at?: string
          word?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "student"
      lesson_category:
        | "vocabulary"
        | "grammar"
        | "listening"
        | "speaking"
        | "reading"
        | "quiz"
      lesson_level: "beginner" | "intermediate" | "advanced"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "student"],
      lesson_category: [
        "vocabulary",
        "grammar",
        "listening",
        "speaking",
        "reading",
        "quiz",
      ],
      lesson_level: ["beginner", "intermediate", "advanced"],
    },
  },
} as const
