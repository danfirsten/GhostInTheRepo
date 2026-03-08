"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import styles from "./DomainProgressBar.module.css";

/**
 * Client component that fetches and displays domain progress.
 * Renders inline on the Topics hub — hidden when not logged in.
 */
interface DomainProgressBarProps {
  domainSlug: string;
  /** Total number of topics in this domain (needed for accurate %) */
  totalTopics?: number;
}

export function DomainProgressBar({ domainSlug, totalTopics }: DomainProgressBarProps) {
  const { user } = useAuth();
  const [pct, setPct] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    fetch(`/api/user/progress?domain=${domainSlug}`)
      .then((r) => r.json())
      .then((data: Array<{ progress_pct: number; content_type: string }>) => {
        if (!Array.isArray(data)) return;
        const topicEntries = data.filter((p) => p.content_type === "topic");
        const completed = topicEntries.filter((p) => p.progress_pct >= 100).length;
        // Use provided totalTopics for accurate denominator, fall back to data length
        const denominator = totalTopics ?? topicEntries.length;
        if (denominator > 0 && completed > 0) {
          setPct(Math.round((completed / denominator) * 100));
        }
      })
      .catch(() => {});
  }, [user, domainSlug, totalTopics]);

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
