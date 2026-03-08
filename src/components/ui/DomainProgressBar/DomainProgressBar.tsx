"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import styles from "./DomainProgressBar.module.css";

/**
 * Client component that fetches and displays domain progress.
 * Renders inline on the Topics hub — hidden when not logged in.
 */
export function DomainProgressBar({ domainSlug }: { domainSlug: string }) {
  const { user } = useAuth();
  const [pct, setPct] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    fetch(`/api/user/progress?domain=${domainSlug}`)
      .then((r) => r.json())
      .then((data: Array<{ progress_pct: number }>) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const completed = data.filter((p) => p.progress_pct >= 100).length;
        const total = data.length;
        if (total > 0) {
          setPct(Math.round((completed / total) * 100));
        }
      })
      .catch(() => {});
  }, [user, domainSlug]);

  if (!user || pct === null || pct === 0) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={styles.label}>{pct}%</span>
    </div>
  );
}
