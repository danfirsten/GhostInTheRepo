export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  ghost_level: number;
  spectral_density: number;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  content_type: "topic" | "codex" | "cheatsheet" | "path";
  content_slug: string;
  domain_slug: string | null;
  progress_pct: number;
  completed_at: string | null;
  started_at: string;
  updated_at: string;
}

export interface UserBookmark {
  user_id: string;
  content_type: "topic" | "codex" | "cheatsheet";
  content_slug: string;
  domain_slug: string | null;
  created_at: string;
}

export interface UserDailyVisit {
  user_id: string;
  visit_date: string;
  first_visit_at: string;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface ProfileStats {
  topicsCompleted: number;
  totalTopics: number;
  cheatsheetsViewed: number;
  totalCheatsheets: number;
  pathsStarted: number;
  totalPaths: number;
  currentStreak: number;
  domainProgress: DomainProgressEntry[];
}

export interface DomainProgressEntry {
  domainSlug: string;
  domainLabel: string;
  completed: number;
  total: number;
  percentage: number;
}

/** Ghost level titles based on Spectral Density level */
export const GHOST_LEVEL_TITLES: Record<number, string> = {
  1: "Faint Whisper",
  2: "Flickering Shade",
  3: "Forming Spirit",
  4: "Emerging Phantom",
  5: "Solid Specter",
  6: "Glowing Revenant",
  7: "Violet Wraith",
  8: "Spectral Entity",
  9: "Chromatic Phantom",
  10: "Ascended Ghost",
};
