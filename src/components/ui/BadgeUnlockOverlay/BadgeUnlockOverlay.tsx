"use client";

import { useEffect, useState, useCallback } from "react";
import { BADGE_MAP } from "@/lib/badges/definitions";
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
import styles from "./BadgeUnlockOverlay.module.css";

const ICON_MAP: Record<string, IconType> = {
  Ghost, Footprints, Compass, Binoculars, Graph, Eye, Brain, Terminal,
  WifiHigh, Cpu, SquaresFour, ShieldCheck, Atom, BookOpen, Books,
  Lightning, Table, BookBookmark, Fire, FireSimple, Flame, Moon,
  Crown, Path, Trophy, Bug, Skull, MagnifyingGlass,
};

interface BadgeUnlockOverlayProps {
  badgeId: string | null;
  onDismiss: () => void;
}

export function BadgeUnlockOverlay({ badgeId, onDismiss }: BadgeUnlockOverlayProps) {
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");

  const badge = badgeId ? BADGE_MAP.get(badgeId) : null;
  const IconComponent = badge ? (ICON_MAP[badge.icon] ?? Question) : Question;

  const dismiss = useCallback(() => {
    setPhase("exit");
    setTimeout(onDismiss, 400);
  }, [onDismiss]);

  useEffect(() => {
    if (!badgeId) return;
    setPhase("enter");
    const t1 = setTimeout(() => setPhase("show"), 50);
    const t2 = setTimeout(dismiss, 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [badgeId, dismiss]);

  if (!badge) return null;

  return (
    <div
      className={`${styles.overlay} ${styles[phase]}`}
      onClick={dismiss}
      role="presentation"
    >
      <div className={`${styles.card} ${styles[badge.rarity]}`}>
        <div className={styles.burst} />
        <div className={styles.iconWrap}>
          <IconComponent size={56} weight="duotone" />
        </div>
        <div className={styles.label}>UNLOCKED</div>
        <div className={styles.badgeName}>{badge.name}</div>
        <div className={styles.badgeRarity}>{badge.rarity}</div>
        <div className={styles.badgeDesc}>{badge.description}</div>
      </div>
    </div>
  );
}
