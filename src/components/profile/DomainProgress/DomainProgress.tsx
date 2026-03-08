"use client";

import { useState, useEffect } from "react";
import type { DomainProgressEntry } from "@/lib/db/types";
import styles from "./DomainProgress.module.css";

interface DomainProgressProps {
  domains: DomainProgressEntry[];
}

export function DomainProgress({ domains }: DomainProgressProps) {
  const [animate, setAnimate] = useState(false);

  // Trigger bar animation after mount
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Sort by percentage descending, then alphabetically
  const sorted = [...domains].sort((a, b) =>
    b.percentage !== a.percentage
      ? b.percentage - a.percentage
      : a.domainLabel.localeCompare(b.domainLabel)
  );

  const hasProgress = sorted.some((d) => d.percentage > 0);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Topic Breakdown</h2>

      {!hasProgress && (
        <div className={styles.empty}>
          <span className={styles.emptyGhost}>👻</span>
          <p className={styles.emptyText}>
            Start exploring to build your spectral density.
          </p>
        </div>
      )}

      <div className={styles.list}>
        {sorted.map((domain) => (
          <div key={domain.domainSlug} className={styles.row}>
            <a
              href={`/topics/${domain.domainSlug}`}
              className={styles.label}
            >
              {domain.domainLabel}
            </a>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{
                  width: animate ? `${domain.percentage}%` : "0%",
                  backgroundColor: getBarColor(domain.percentage),
                }}
              />
            </div>
            <span className={styles.pct}>{domain.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getBarColor(pct: number): string {
  if (pct >= 80) return "var(--spectral-3)";  // emerald
  if (pct >= 40) return "var(--spectral-2)";  // sky
  if (pct >= 10) return "var(--spectral-1)";  // violet
  return "var(--text-tertiary)";
}
