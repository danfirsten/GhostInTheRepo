export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type BadgeCategory =
  | "exploration"
  | "mastery"
  | "codex"
  | "streaks"
  | "completionist"
  | "hidden";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  icon: string; // Phosphor icon name
  hidden: boolean;
  /** Human-readable unlock hint (hidden from hidden badges until earned) */
  unlockHint: string;
}

export interface EarnedBadge {
  badge_id: string;
  earned_at: string;
}

export interface BadgeCheckContext {
  /** Total topics completed */
  topicsCompleted: number;
  /** Total cheatsheets viewed */
  cheatsheetsViewed: number;
  /** Total codex articles read */
  codexRead: number;
  /** Total codex articles available */
  totalCodex: number;
  /** Total cheatsheets available */
  totalCheatsheets: number;
  /** Current visit streak */
  currentStreak: number;
  /** Total unique domains with at least 1 topic visited */
  domainsVisited: number;
  /** Domains where all content is completed */
  domainsFullyCompleted: string[];
  /** Total unique topic pages visited */
  uniqueTopicsVisited: number;
  /** Whether user visited between 12am-4am local time */
  isWitchingHour: boolean;
  /** All 14 domain hubs visited */
  allDomainHubsVisited: boolean;
  /** Total learning paths completed */
  pathsCompleted: number;
  /** User account creation timestamp */
  accountCreatedAt: string;
  /** User's account number (nth account) */
  accountNumber: number;
  /** Already earned badge IDs (to avoid re-checking) */
  earnedBadgeIds: Set<string>;
  /** Per-domain completion data */
  domainCompletion: Record<string, { completed: number; total: number }>;
}
