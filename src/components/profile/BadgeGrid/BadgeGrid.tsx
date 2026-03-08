"use client";

import { BADGE_DEFINITIONS, CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/badges/definitions";
import type { EarnedBadge } from "@/lib/badges/types";
import { BadgeCard } from "@/components/profile/BadgeCard/BadgeCard";
import styles from "./BadgeGrid.module.css";

interface BadgeGridProps {
  earnedBadges: EarnedBadge[];
}

export function BadgeGrid({ earnedBadges }: BadgeGridProps) {
  const earnedMap = new Map(earnedBadges.map((b) => [b.badge_id, b.earned_at]));
  const earnedCount = earnedBadges.length;
  const totalCount = BADGE_DEFINITIONS.length;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Badges</h2>
        <span className={styles.counter}>
          {earnedCount} / {totalCount}
        </span>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const badges = BADGE_DEFINITIONS.filter((b) => b.category === category);
        if (badges.length === 0) return null;

        return (
          <div key={category} className={styles.category}>
            <h3 className={styles.categoryTitle}>
              {CATEGORY_LABELS[category]}
            </h3>
            <div className={styles.grid}>
              {badges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  earned={earnedMap.has(badge.id)}
                  earnedAt={earnedMap.get(badge.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
