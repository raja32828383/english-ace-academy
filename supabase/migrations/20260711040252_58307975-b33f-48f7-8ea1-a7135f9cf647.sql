-- =====================================================================
-- Reading & Listening Lab — scalable schema
-- Content source of truth lives in code (src/lib/reading-content.ts); the
-- reading_lessons table is a CMS-ready scaffold for a future admin panel.
-- Per-user state (progress, bookmarks, notes, quiz attempts) lives here.
-- =====================================================================

-- 1) CMS-ready lesson content table (future admin CMS) --------------------
CREATE TABLE public.reading_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  level text NOT NULL,
  category text NOT NULL,
  topic text,
  summary text,
  estimated_minutes integer NOT NULL DEFAULT 5,
  xp_reward integer NOT NULL DEFAULT 20,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  audio_url text,
  image_url text,
  order_index integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.reading_lessons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_lessons TO authenticated;
GRANT ALL ON public.reading_lessons TO service_role;
ALTER TABLE public.reading_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published reading lessons are viewable by everyone"
  ON public.reading_lessons FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert reading lessons"
  ON public.reading_lessons FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update reading lessons"
  ON public.reading_lessons FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reading lessons"
  ON public.reading_lessons FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_reading_lessons_updated_at
  BEFORE UPDATE ON public.reading_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Per-user progress ----------------------------------------------------
CREATE TABLE public.reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_slug text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  best_score integer,
  reading_accuracy integer,
  listening_accuracy integer,
  reading_seconds integer NOT NULL DEFAULT 0,
  listening_seconds integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  last_viewed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_progress TO authenticated;
GRANT ALL ON public.reading_progress TO service_role;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own reading progress"
  ON public.reading_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_reading_progress_updated_at
  BEFORE UPDATE ON public.reading_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Bookmarks ------------------------------------------------------------
CREATE TABLE public.reading_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_bookmarks TO authenticated;
GRANT ALL ON public.reading_bookmarks TO service_role;
ALTER TABLE public.reading_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own reading bookmarks"
  ON public.reading_bookmarks FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4) Notes & highlights ---------------------------------------------------
CREATE TABLE public.reading_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_slug text NOT NULL,
  quote text,
  note text,
  paragraph_index integer,
  color text NOT NULL DEFAULT 'gold',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_notes TO authenticated;
GRANT ALL ON public.reading_notes TO service_role;
ALTER TABLE public.reading_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own reading notes"
  ON public.reading_notes FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_reading_notes_updated_at
  BEFORE UPDATE ON public.reading_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Quiz attempts (reading + listening) ---------------------------------
CREATE TABLE public.reading_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_slug text NOT NULL,
  kind text NOT NULL DEFAULT 'reading',
  score integer NOT NULL,
  correct integer NOT NULL,
  total integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_quiz_attempts TO authenticated;
GRANT ALL ON public.reading_quiz_attempts TO service_role;
ALTER TABLE public.reading_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own reading quiz attempts"
  ON public.reading_quiz_attempts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_reading_progress_user ON public.reading_progress(user_id);
CREATE INDEX idx_reading_notes_user_lesson ON public.reading_notes(user_id, lesson_slug);
CREATE INDEX idx_reading_quiz_attempts_user ON public.reading_quiz_attempts(user_id);