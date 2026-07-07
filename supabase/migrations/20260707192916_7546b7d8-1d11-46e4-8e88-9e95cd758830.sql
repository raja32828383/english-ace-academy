
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'student');
CREATE TYPE public.lesson_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.lesson_category AS ENUM ('vocabulary', 'grammar', 'listening', 'speaking', 'reading', 'quiz');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Learner',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- USER STATS
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  hearts INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_stats TO authenticated;
GRANT ALL ON public.user_stats TO service_role;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stats viewable by authenticated" ON public.user_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own stats" ON public.user_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own stats" ON public.user_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LESSONS
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  level lesson_level NOT NULL DEFAULT 'beginner',
  category lesson_category NOT NULL DEFAULT 'vocabulary',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 20,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lessons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published lessons viewable by everyone" ON public.lessons FOR SELECT USING (published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert lessons" ON public.lessons FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update lessons" ON public.lessons FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete lessons" ON public.lessons FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- VOCABULARY
CREATE TABLE public.vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  example TEXT,
  phonetic TEXT,
  level lesson_level NOT NULL DEFAULT 'beginner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vocabulary TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vocabulary TO authenticated;
GRANT ALL ON public.vocabulary TO service_role;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vocabulary viewable by everyone" ON public.vocabulary FOR SELECT USING (true);
CREATE POLICY "Admins insert vocabulary" ON public.vocabulary FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update vocabulary" ON public.vocabulary FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete vocabulary" ON public.vocabulary FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- FLASHCARD REVIEWS (spaced repetition)
CREATE TABLE public.flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES public.vocabulary(id) ON DELETE CASCADE,
  ease_factor NUMERIC NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 0,
  repetitions INTEGER NOT NULL DEFAULT 0,
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed TIMESTAMPTZ,
  UNIQUE (user_id, vocabulary_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcard_reviews TO authenticated;
GRANT ALL ON public.flashcard_reviews TO service_role;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reviews" ON public.flashcard_reviews FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- LESSON PROGRESS
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress',
  score INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON public.lesson_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ACHIEVEMENTS
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'award',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.achievements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements viewable by everyone" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Admins manage achievements" ON public.achievements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- USER ACHIEVEMENTS
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own achievements" ON public.user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users earn own achievements" ON public.user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- SEED: achievements
INSERT INTO public.achievements (code, title, description, icon, xp_reward) VALUES
  ('first_lesson', 'First Steps', 'Complete your first lesson', 'footprints', 10),
  ('streak_7', 'Week Warrior', 'Reach a 7-day streak', 'flame', 50),
  ('xp_500', 'Rising Star', 'Earn 500 XP', 'star', 0),
  ('vocab_50', 'Word Collector', 'Review 50 vocabulary words', 'book-open', 30),
  ('perfect_quiz', 'Perfectionist', 'Score 100% on a quiz', 'target', 25);

-- SEED: vocabulary
INSERT INTO public.vocabulary (word, translation, example, phonetic, level) VALUES
  ('Hello', 'Halo', 'Hello, how are you?', '/həˈloʊ/', 'beginner'),
  ('Thank you', 'Terima kasih', 'Thank you very much!', '/θæŋk juː/', 'beginner'),
  ('Friend', 'Teman', 'She is my best friend.', '/frɛnd/', 'beginner'),
  ('Water', 'Air', 'Can I have some water?', '/ˈwɔːtər/', 'beginner'),
  ('Beautiful', 'Cantik', 'What a beautiful sunset.', '/ˈbjuːtɪfʊl/', 'beginner'),
  ('To improve', 'Meningkatkan', 'I want to improve my English.', '/tə ɪmˈpruːv/', 'intermediate'),
  ('Opportunity', 'Kesempatan', 'This is a great opportunity.', '/ˌɒpərˈtjuːnɪti/', 'intermediate'),
  ('Nevertheless', 'Meskipun demikian', 'It was hard; nevertheless, she succeeded.', '/ˌnɛvərðəˈlɛs/', 'advanced'),
  ('Resilient', 'Tangguh', 'Indonesians are known to be resilient.', '/rɪˈzɪliənt/', 'advanced'),
  ('Comprehensive', 'Menyeluruh', 'A comprehensive study of the topic.', '/ˌkɒmprɪˈhɛnsɪv/', 'advanced');

-- SEED: lessons
INSERT INTO public.lessons (title, description, level, category, order_index, xp_reward, content) VALUES
  ('Greetings & Introductions', 'Learn how to greet people and introduce yourself in English.', 'beginner', 'vocabulary', 1, 20,
    '{"intro":"Master everyday greetings.","quiz":[{"question":"How do you say \"Halo\" in English?","options":["Bye","Hello","Thanks","Please"],"answer":1},{"question":"Which is a polite greeting?","options":["Yo","Good morning","Move","No"],"answer":1}]}'),
  ('Present Simple Tense', 'Understand and use the present simple tense correctly.', 'beginner', 'grammar', 2, 25,
    '{"intro":"The present simple describes habits and facts.","quiz":[{"question":"She ___ to school every day.","options":["go","goes","going","gone"],"answer":1},{"question":"They ___ football on Sundays.","options":["plays","play","played","playing"],"answer":1}]}'),
  ('Everyday Listening', 'Practice understanding common spoken phrases.', 'beginner', 'listening', 3, 25,
    '{"intro":"Listen carefully and answer.","quiz":[{"question":"\"Nice to meet you\" is used when?","options":["Leaving","Meeting someone","Eating","Sleeping"],"answer":1}]}'),
  ('Ordering Food', 'Reading practice: understand a restaurant menu and dialogue.', 'intermediate', 'reading', 4, 30,
    '{"intro":"Read the passage and answer.","passage":"Maya walked into a cafe and ordered a cup of coffee and a slice of cake. The waiter smiled and asked if she wanted anything else.","quiz":[{"question":"What did Maya order?","options":["Tea and bread","Coffee and cake","Juice","Nothing"],"answer":1}]}'),
  ('Talking About the Future', 'Learn to talk about future plans using will and going to.', 'intermediate', 'grammar', 5, 30,
    '{"intro":"Use will and going to for the future.","quiz":[{"question":"I ___ visit my grandmother tomorrow.","options":["will","was","did","am"],"answer":0}]}'),
  ('Speaking: Self Introduction', 'Practice speaking by introducing yourself aloud.', 'intermediate', 'speaking', 6, 35,
    '{"intro":"Use your microphone to practice.","prompt":"Introduce yourself: say your name, where you are from, and what you like."}'),
  ('Advanced Idioms', 'Master common English idioms and their meanings.', 'advanced', 'vocabulary', 7, 40,
    '{"intro":"Idioms make you sound natural.","quiz":[{"question":"\"Break the ice\" means to:","options":["Freeze water","Start a conversation","Fight","Leave"],"answer":1}]}'),
  ('Debate & Persuasion', 'Reading and speaking practice on persuasive language.', 'advanced', 'reading', 8, 45,
    '{"intro":"Read persuasive text and respond.","passage":"Renewable energy is not merely an option but a necessity for a sustainable future.","quiz":[{"question":"The tone of the passage is:","options":["Persuasive","Sarcastic","Neutral","Confused"],"answer":0}]}');
