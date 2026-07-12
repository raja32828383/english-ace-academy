-- =====================================================================
-- Speaking Lab — scalable schema
-- Content source of truth lives in code (src/lib/speaking-content.ts); the
-- speaking_courses table is a CMS-ready scaffold for a future admin panel.
-- Per-user state (progress, sessions, per-sentence records, daily challenges)
-- lives here. No audio blobs are stored — only recognition results/scores.
-- =====================================================================

-- 1) CMS-ready course content table (future admin CMS) --------------------
CREATE TABLE public.speaking_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  level text NOT NULL,
  category text NOT NULL,
  topic text,
  summary text,
  estimated_minutes integer NOT NULL DEFAULT 5,
  xp_reward integer NOT NULL DEFAULT 25,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  audio_url text,
  image_url text,
  order_index integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.speaking_courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.speaking_courses TO authenticated;
GRANT ALL ON public.speaking_courses TO service_role;
ALTER TABLE public.speaking_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published speaking courses are viewable by everyone"
  ON public.speaking_courses FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert speaking courses"
  ON public.speaking_courses FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update speaking courses"
  ON public.speaking_courses FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete speaking courses"
  ON public.speaking_courses FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_speaking_courses_updated_at
  BEFORE UPDATE ON public.speaking_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Per-user progress ----------------------------------------------------
CREATE TABLE public.speaking_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  best_score integer,
  pronunciation_avg integer,
  fluency_avg integer,
  confidence_avg integer,
  accuracy_avg integer,
  sentences_completed integer NOT NULL DEFAULT 0,
  words_spoken integer NOT NULL DEFAULT 0,
  speaking_seconds integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  last_viewed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.speaking_progress TO authenticated;
GRANT ALL ON public.speaking_progress TO service_role;
ALTER TABLE public.speaking_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own speaking progress"
  ON public.speaking_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_speaking_progress_updated_at
  BEFORE UPDATE ON public.speaking_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Sessions (one row per completed practice attempt) --------------------
CREATE TABLE public.speaking_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug text NOT NULL,
  mode text NOT NULL DEFAULT 'repeat',
  overall_score integer NOT NULL DEFAULT 0,
  pronunciation integer NOT NULL DEFAULT 0,
  fluency integer NOT NULL DEFAULT 0,
  accuracy integer NOT NULL DEFAULT 0,
  completeness integer NOT NULL DEFAULT 0,
  confidence integer NOT NULL DEFAULT 0,
  sentences_completed integer NOT NULL DEFAULT 0,
  words_spoken integer NOT NULL DEFAULT 0,
  duration_seconds integer NOT NULL DEFAULT 0,
  xp_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.speaking_sessions TO authenticated;
GRANT ALL ON public.speaking_sessions TO service_role;
ALTER TABLE public.speaking_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own speaking sessions"
  ON public.speaking_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4) Per-sentence recognition records (part of a session) -----------------
CREATE TABLE public.speaking_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.speaking_sessions(id) ON DELETE CASCADE,
  course_slug text NOT NULL,
  sentence_index integer NOT NULL DEFAULT 0,
  expected_text text NOT NULL,
  recognized_text text,
  confidence integer,
  accuracy integer,
  word_results jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.speaking_records TO authenticated;
GRANT ALL ON public.speaking_records TO service_role;
ALTER TABLE public.speaking_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own speaking records"
  ON public.speaking_records FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5) Daily challenge completions ------------------------------------------
CREATE TABLE public.speaking_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_date date NOT NULL DEFAULT (now()::date),
  challenge_type text NOT NULL DEFAULT 'speaking',
  score integer,
  completed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_date, challenge_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.speaking_daily TO authenticated;
GRANT ALL ON public.speaking_daily TO service_role;
ALTER TABLE public.speaking_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own speaking daily challenges"
  ON public.speaking_daily FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes -----------------------------------------------------------------
CREATE INDEX idx_speaking_progress_user ON public.speaking_progress(user_id);
CREATE INDEX idx_speaking_sessions_user ON public.speaking_sessions(user_id);
CREATE INDEX idx_speaking_sessions_course ON public.speaking_sessions(course_slug);
CREATE INDEX idx_speaking_records_session ON public.speaking_records(session_id);
CREATE INDEX idx_speaking_daily_user ON public.speaking_daily(user_id);

-- Achievement badges ------------------------------------------------------
INSERT INTO public.achievements (code, title, description, icon, xp_reward) VALUES
  ('speaking_first', 'First Words', 'Complete your first speaking session.', 'mic', 20),
  ('speaking_10', '10 Speaking Sessions', 'Complete 10 speaking sessions.', 'mic', 50),
  ('speaking_100min', '100 Minutes Speaking', 'Practise speaking for 100 minutes in total.', 'target', 80),
  ('speaking_perfect_pron', 'Perfect Pronunciation', 'Score 100% pronunciation in a session.', 'star', 40),
  ('speaking_perfect_acc', 'Flawless Speaker', 'Score 100% accuracy in a session.', 'star', 40),
  ('speaking_streak_7', '7-Day Speaking Streak', 'Practise speaking 7 days in a row.', 'flame', 60)
ON CONFLICT (code) DO NOTHING;