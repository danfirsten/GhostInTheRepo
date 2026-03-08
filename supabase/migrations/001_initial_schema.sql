-- ============================================================
-- Ghost in the Repo — Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Extended user profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  ghost_level INT NOT NULL DEFAULT 1,
  spectral_density INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'preferred_username', 'ghost-' || LEFT(NEW.id::text, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Anonymous Ghost'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Progress tracking
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('topic', 'codex', 'cheatsheet', 'path')),
  content_slug TEXT NOT NULL,
  domain_slug TEXT,
  progress_pct INT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_slug)
);

-- Bookmarks
CREATE TABLE user_bookmarks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('topic', 'codex', 'cheatsheet')),
  content_slug TEXT NOT NULL,
  domain_slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, content_type, content_slug)
);

-- Daily visit tracking (for streaks)
CREATE TABLE user_daily_visits (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  first_visit_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, visit_date)
);

-- Activity log (for badge unlock checks)
CREATE TABLE user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Badges earned
CREATE TABLE user_badges (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- Indexes
CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_domain ON user_progress(user_id, domain_slug);
CREATE INDEX idx_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX idx_visits_user ON user_daily_visits(user_id, visit_date);
CREATE INDEX idx_activity_user ON user_activity(user_id, activity_type, created_at);
CREATE INDEX idx_badges_user ON user_badges(user_id);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own data
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON user_bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own visits" ON user_daily_visits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own visits" ON user_daily_visits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own activity" ON user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
