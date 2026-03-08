import type { DomainProgressEntry } from "@/lib/db/types";
import styles from "./DomainProgress.module.css";

interface DomainProgressProps {
  domains: DomainProgressEntry[];
}

export function DomainProgress({ domains }: DomainProgressProps) {
  // Sort by percentage descending, then alphabetically
  const sorted = [...domains].sort((a, b) =>
    b.percentage !== a.percentage
      ? b.percentage - a.percentage
      : a.domainLabel.localeCompare(b.domainLabel)
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Topic Breakdown</h2>
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
                  width: `${domain.percentage}%`,
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
