"use client";

import { useState } from "react";
import type { BadgeDefinition, BadgeRarity } from "@/lib/badges/types";
import {
  Ghost,
  Footprints,
  Compass,
  Binoculars,
  Graph,
  Eye,
  Brain,
  Terminal,
  WifiHigh,
  Cpu,
  SquaresFour,
  ShieldCheck,
  Atom,
  BookOpen,
  Books,
  Lightning,
  Table,
  BookBookmark,
  Fire,
  FireSimple,
  Flame,
  Moon,
  Crown,
  Path,
  Trophy,
  Bug,
  Skull,
  MagnifyingGlass,
  Question,
} from "@phosphor-icons/react";
import type { Icon as IconType } from "@phosphor-icons/react";
import styles from "./BadgeCard.module.css";

const ICON_MAP: Record<string, IconType> = {
  Ghost,
  Footprints,
  Compass,
  Binoculars,
  Graph,
  Eye,
  Brain,
  Terminal,
  WifiHigh,
  Cpu,
  SquaresFour,
  ShieldCheck,
  Atom,
  BookOpen,
  Books,
  Lightning,
  Table,
  BookBookmark,
  Fire,
  FireSimple,
  Flame,
  Moon,
  Crown,
  Path,
  Trophy,
  Bug,
  Skull,
  MagnifyingGlass,
};

const RARITY_CLASS: Record<BadgeRarity, string> = {
  common: styles.common,
  uncommon: styles.uncommon,
  rare: styles.rare,
  epic: styles.epic,
  legendary: styles.legendary,
};

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned: boolean;
  earnedAt?: string;
}

export function BadgeCard({ badge, earned, earnedAt }: BadgeCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const IconComponent = ICON_MAP[badge.icon] ?? Question;
  const isRevealed = earned || !badge.hidden;

  return (
    <div
      className={`${styles.card} ${earned ? RARITY_CLASS[badge.rarity] : styles.locked}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip((p) => !p)}
    >
      <div className={styles.iconWrap}>
        {isRevealed ? (
          <IconComponent size={28} weight={earned ? "duotone" : "thin"} />
        ) : (
          <Question size={28} weight="thin" />
        )}
      </div>
      <div className={styles.name}>
        {isRevealed ? badge.name : "???"}
      </div>
      <div className={styles.rarity}>
        {earned ? badge.rarity : ""}
      </div>

      {showTooltip && (
        <div className={styles.tooltip}>
          {earned ? (
            <>
              <div className={styles.tooltipTitle}>{badge.name}</div>
              <div className={styles.tooltipDesc}>{badge.description}</div>
              {earnedAt && (
                <div className={styles.tooltipDate}>
                  Earned {new Date(earnedAt).toLocaleDateString()}
                </div>
              )}
            </>
          ) : isRevealed ? (
            <>
              <div className={styles.tooltipTitle}>{badge.name}</div>
              <div className={styles.tooltipHint}>{badge.unlockHint}</div>
            </>
          ) : (
            <div className={styles.tooltipHint}>Hidden badge — keep exploring!</div>
          )}
        </div>
      )}
    </div>
  );
}
