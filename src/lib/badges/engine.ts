import { BADGE_DEFINITIONS } from "./definitions";
import type { BadgeCheckContext } from "./types";

/** Domain slug → badge ID for domain-specific mastery badges */
const DOMAIN_MASTERY_BADGES: Record<string, string> = {
  "terminal-and-tools": "hex-reader",
  networking: "phantom-protocol",
  "operating-systems": "memory-leak",
  "software-engineering": "shadow-architect",
  cybersecurity: "spectral-cipher",
  "ai-and-ml": "neural-phantom",
};

/**
 * Check all badge unlock conditions against current user context.
 * Returns an array of badge IDs that should be newly unlocked.
 */
export function checkBadgeUnlocks(ctx: BadgeCheckContext): string[] {
  const newlyUnlocked: string[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    // Skip already earned
    if (ctx.earnedBadgeIds.has(badge.id)) continue;

    const shouldUnlock = evaluateCondition(badge.id, ctx);
    if (shouldUnlock) {
      newlyUnlocked.push(badge.id);
    }
  }

  return newlyUnlocked;
}

function evaluateCondition(badgeId: string, ctx: BadgeCheckContext): boolean {
  switch (badgeId) {
    // ── Exploration ──
    case "first-apparition":
      // Unlocked by account creation — always true if checking
      return true;

    case "ecto-trail":
      return ctx.uniqueTopicsVisited >= 5;

    case "spectral-drift":
      return ctx.domainsVisited >= 7;

    case "phantom-surveyor":
      return ctx.allDomainHubsVisited;

    case "poltergeist-cartographer":
      // Requires client-side graph interaction tracking — checked separately
      return false;

    case "the-lurker":
      // Requires time tracking — checked separately via client
      return false;

    // ── Mastery ──
    case "possessed-by-knowledge":
      return ctx.domainsFullyCompleted.length >= 1;

    case "hex-reader":
    case "phantom-protocol":
    case "memory-leak":
    case "shadow-architect":
    case "spectral-cipher":
    case "neural-phantom": {
      const domainSlug = Object.entries(DOMAIN_MASTERY_BADGES).find(
        ([, bid]) => bid === badgeId
      )?.[0];
      return domainSlug ? ctx.domainsFullyCompleted.includes(domainSlug) : false;
    }

    // ── Codex & Cheatsheets ──
    case "grimoire-initiate":
      return ctx.codexRead >= 1;

    case "tome-collector":
      return ctx.codexRead >= 10;

    case "quick-seance":
      return ctx.cheatsheetsViewed >= 1;

    case "ectoplasmic-reference":
      return ctx.cheatsheetsViewed >= 10;

    case "the-necronomicon":
      return ctx.codexRead >= ctx.totalCodex && ctx.totalCodex > 0;

    // ── Streaks ──
    case "haunt-streak":
      return ctx.currentStreak >= 7;

    case "restless-spirit":
      return ctx.currentStreak >= 30;

    case "the-eternal-haunt":
      return ctx.currentStreak >= 100;

    case "witching-hour":
      return ctx.isWitchingHour;

    // ── Completionist ──
    case "full-possession": {
      const allDone = Object.values(ctx.domainCompletion).every(
        (d) => d.total > 0 && d.completed >= d.total
      );
      return allDone && Object.keys(ctx.domainCompletion).length >= 15;
    }

    case "path-walker":
      return ctx.pathsCompleted >= 1;

    case "astral-collector": {
      // Must have earned all non-hidden badges (except this one)
      const nonHiddenIds = BADGE_DEFINITIONS
        .filter((b) => !b.hidden && b.id !== "astral-collector")
        .map((b) => b.id);
      return nonHiddenIds.every((id) => ctx.earnedBadgeIds.has(id));
    }

    // ── Hidden ──
    case "glitch-in-the-matrix":
      // Client-side only: click ghost logo 13 times
      return false;

    case "the-original-ghost":
      return ctx.accountNumber <= 100;

    case "reverse-engineer":
      // Client-side only tracking
      return false;

    default:
      return false;
  }
}
