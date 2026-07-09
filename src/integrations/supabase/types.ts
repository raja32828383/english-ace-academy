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
