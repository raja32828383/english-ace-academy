-- trigram extension for typo-tolerant search (must exist before index)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ========== Extend vocabulary table (scalable schema) ==========
ALTER TABLE public.vocabulary
  ADD COLUMN IF NOT EXISTS part_of_speech text,
  ADD COLUMN IF NOT EXISTS pronunciation text,
  ADD COLUMN IF NOT EXISTS english_definition text,
  ADD COLUMN IF NOT EXISTS example_translation text,
  ADD COLUMN IF NOT EXISTS synonyms text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS antonyms text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'daily-conversation',
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS vocabulary_category_idx ON public.vocabulary (category);
CREATE INDEX IF NOT EXISTS vocabulary_level_idx ON public.vocabulary (level);
CREATE INDEX IF NOT EXISTS vocabulary_word_trgm_idx ON public.vocabulary USING gin (lower(word) gin_trgm_ops);

DROP TRIGGER IF EXISTS update_vocabulary_updated_at ON public.vocabulary;
CREATE TRIGGER update_vocabulary_updated_at
  BEFORE UPDATE ON public.vocabulary
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== Per-user vocabulary state (favorites, status, mastery, SRS) ==========
ALTER TABLE public.flashcard_reviews
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mastery_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS correct_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS flashcard_reviews_user_fav_idx
  ON public.flashcard_reviews (user_id, is_favorite);
CREATE INDEX IF NOT EXISTS flashcard_reviews_user_due_idx
  ON public.flashcard_reviews (user_id, due_date);