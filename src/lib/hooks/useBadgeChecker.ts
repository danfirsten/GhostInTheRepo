"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";

const SHOWN_KEY = "ghost_badges_shown";

/** Get badge IDs already shown this session */
function getShownBadges(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SHOWN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Mark badge IDs as shown this session */
function markShown(ids: string[]) {
  try {
    const existing = getShownBadges();
    for (const id of ids) existing.add(id);
    sessionStorage.setItem(SHOWN_KEY, JSON.stringify([...existing]));
  } catch {}
}

/**
 * Hook that checks for new badge unlocks after user actions.
 * Uses sessionStorage to avoid showing the same badge popup twice per session.
 */
export function useBadgeChecker() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<string[]>([]);
  const [currentBadge, setCurrentBadge] = useState<string | null>(null);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!user || checkedRef.current) return;
    checkedRef.current = true;

    const hour = new Date().getHours();

    fetch("/api/user/badges/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isWitchingHour: hour >= 0 && hour < 4,
        totalCodex: 0,
        totalCheatsheets: 14,
        domainTotals: {},
      }),
    })
      .then((r) => r.json())
      .then((data: { newlyUnlocked?: string[] }) => {
        if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
          // Filter out badges already shown this session
          const alreadyShown = getShownBadges();
          const fresh = data.newlyUnlocked.filter((id) => !alreadyShown.has(id));
          if (fresh.length > 0) {
            markShown(fresh);
            setQueue(fresh);
            setCurrentBadge(fresh[0]);
          }
        }
      })
      .catch(() => {});
  }, [user]);

  const dismiss = useCallback(() => {
    setQueue((prev) => {
      const next = prev.slice(1);
      setCurrentBadge(next[0] ?? null);
      return next;
    });
  }, []);

  const recheckBadges = useCallback(() => {
    if (!user) return;

    const hour = new Date().getHours();

    fetch("/api/user/badges/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isWitchingHour: hour >= 0 && hour < 4,
        totalCodex: 0,
        totalCheatsheets: 14,
        domainTotals: {},
      }),
    })
      .then((r) => r.json())
      .then((data: { newlyUnlocked?: string[] }) => {
        if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
          const alreadyShown = getShownBadges();
          const fresh = data.newlyUnlocked.filter((id) => !alreadyShown.has(id));
          if (fresh.length > 0) {
            markShown(fresh);
            setQueue((prev) => [...prev, ...fresh]);
            setCurrentBadge((cur) => cur ?? fresh[0]);
          }
        }
      })
      .catch(() => {});
  }, [user]);

  return { currentBadge, dismiss, recheckBadges };
}
