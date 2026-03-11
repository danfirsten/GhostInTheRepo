-- ============================================================
-- Ghost in the Repo — User Notes
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE user_notes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('topic', 'codex', 'cheatsheet')),
  content_slug TEXT NOT NULL,
  domain_slug TEXT,
  note_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, content_type, content_slug)
);

CREATE INDEX idx_notes_user ON user_notes(user_id);

ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON user_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON user_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON user_notes FOR UPDATE USING (auth.uid() = user_id);
