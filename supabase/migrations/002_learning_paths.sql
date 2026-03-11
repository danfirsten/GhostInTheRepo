-- ============================================================
-- Learning path preferences
-- Stores the user's wizard selections so the path persists
-- ============================================================

CREATE TABLE user_learning_paths (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id TEXT NOT NULL,
  time_id TEXT NOT NULL,
  depth_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learning path"
  ON user_learning_paths FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own learning path"
  ON user_learning_paths FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning path"
  ON user_learning_paths FOR UPDATE USING (auth.uid() = user_id);
