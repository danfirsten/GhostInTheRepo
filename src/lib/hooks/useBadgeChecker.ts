"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";

/**
 * Hook that checks for new badge unlocks after user actions.
 * Returns the queue of newly unlocked badge IDs and a dismiss function.
 */
export function useBadgeChecker() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<string[]>([]);
  const [currentBadge, setCurrentBadge] = useState<string | null>(null);
  const checkedRef = useRef(false);

  // Run badge check on mount (once per page load)
  useEffect(() => {
    if (!user || checkedRef.current) return;
    checkedRef.current = true;

    const hour = new Date().getHours();

    fetch("/api/user/badges/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isWitchingHour: hour >= 0 && hour < 4,
        totalCodex: 0, // Will be populated if needed
        totalCheatsheets: 14,
        domainTotals: {},
      }),
    })
      .then((r) => r.json())
      .then((data: { newlyUnlocked?: string[] }) => {
        if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
          setQueue(data.newlyUnlocked);
          setCurrentBadge(data.newlyUnlocked[0]);
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

  /** Trigger badge check manually (e.g., after marking content complete) */
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
          setQueue((prev) => [...prev, ...data.newlyUnlocked!]);
          setCurrentBadge((cur) => cur ?? data.newlyUnlocked![0]);
        }
      })
      .catch(() => {});
  }, [user]);

  return { currentBadge, dismiss, recheckBadges };
}
