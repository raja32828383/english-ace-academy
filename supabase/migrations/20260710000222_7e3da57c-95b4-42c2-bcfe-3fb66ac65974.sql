-- =====================================================================
-- Grammar Learning System — scalable schema
-- CMS-ready content tables (grammar_units, grammar_lessons) + per-user
-- state (progress, bookmarks, quiz attempts) + future AI grammar checker.
-- =====================================================================

-- ---------- CMS content: units ----------
CREATE TABLE public.grammar_units (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  level text NOT NULL DEFAULT 'beginner',
  icon text,
  order_index int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.grammar_units TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.grammar_units TO authenticated;
GRANT ALL ON public.grammar_units TO service_role;
ALTER TABLE public.grammar_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published units are viewable by everyone"
  ON public.grammar_units FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert units"
  ON public.grammar_units FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update units"
  ON public.grammar_units FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete units"
  ON public.grammar_units FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------- CMS content: lessons ----------
CREATE TABLE public.grammar_lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  unit_slug text NOT NULL,
  title text NOT NULL,
  summary text,
  level text NOT NULL DEFAULT 'beginner',
  estimated_minutes int NOT NULL DEFAULT 10,
  xp_reward int NOT NULL DEFAULT 20,
  order_index int NOT NULL DEFAULT 0,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX grammar_lessons_unit_idx ON public.grammar_lessons (unit_slug);
CREATE INDEX grammar_lessons_level_idx ON public.grammar_lessons (level);

GRANT SELECT ON public.grammar_lessons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.grammar_lessons TO authenticated;
GRANT ALL ON public.grammar_lessons TO service_role;
ALTER TABLE public.grammar_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published lessons are viewable by everyone"
  ON public.grammar_lessons FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert lessons"
  ON public.grammar_lessons FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update lessons"
  ON public.grammar_lessons FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete lessons"
  ON public.grammar_lessons FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------- Per-user progress ----------
CREATE TABLE public.grammar_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_slug text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  best_score int,
  mastery int NOT NULL DEFAULT 0,
  time_spent_seconds int NOT NULL DEFAULT 0,
  last_viewed_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.grammar_progress TO authenticated;
GRANT ALL ON public.grammar_progress TO service_role;
ALTER TABLE public.grammar_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own grammar progress"
  ON public.grammar_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------- Per-user bookmarks ----------
CREATE TABLE public.grammar_bookmarks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.grammar_bookmarks TO authenticated;
GRANT ALL ON public.grammar_bookmarks TO service_role;
ALTER TABLE public.grammar_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own grammar bookmarks"
  ON public.grammar_bookmarks FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------- Per-user quiz attempts ----------
CREATE TABLE public.grammar_quiz_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_slug text NOT NULL,
  score int NOT NULL,
  correct int NOT NULL,
  total int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX grammar_quiz_attempts_user_idx ON public.grammar_quiz_attempts (user_id, lesson_slug);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.grammar_quiz_attempts TO authenticated;
GRANT ALL ON public.grammar_quiz_attempts TO service_role;
ALTER TABLE public.grammar_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own grammar quiz attempts"
  ON public.grammar_quiz_attempts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------- Future AI grammar checker (architecture prep) ----------
CREATE TABLE public.grammar_ai_checks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  corrections jsonb NOT NULL DEFAULT '[]'::jsonb,
  overall_feedback text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.grammar_ai_checks TO authenticated;
GRANT ALL ON public.grammar_ai_checks TO service_role;
ALTER TABLE public.grammar_ai_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own grammar ai checks"
  ON public.grammar_ai_checks FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------- updated_at triggers ----------
CREATE TRIGGER update_grammar_units_updated_at
  BEFORE UPDATE ON public.grammar_units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_grammar_lessons_updated_at
  BEFORE UPDATE ON public.grammar_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_grammar_progress_updated_at
  BEFORE UPDATE ON public.grammar_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_grammar_ai_checks_updated_at
  BEFORE UPDATE ON public.grammar_ai_checks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();