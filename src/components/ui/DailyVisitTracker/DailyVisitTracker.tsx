"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

/**
 * Invisible component that records a daily visit for streak tracking.
 * Fires once per page load when the user is logged in.
 */
export function DailyVisitTracker() {
  const { user } = useAuth();
  const recorded = useRef(false);

  useEffect(() => {
    if (!user || recorded.current) return;
    recorded.current = true;

    fetch("/api/user/visit", { method: "POST" }).catch(() => {});
  }, [user]);

  return null;
}
