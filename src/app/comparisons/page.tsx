import type { Metadata } from "next";
import { getAllComparisons, getAllDomains } from "@/lib/data";
import { ComparisonsClient } from "./ComparisonsClient";
import styles from "./comparisons.module.css";

export const metadata: Metadata = {
  title: "Comparisons",
  description:
    "Side-by-side comparisons of technologies, patterns, and concepts that software engineers encounter every day.",
};

export default function ComparisonsPage() {
  const comparisons = getAllComparisons();
  const domains = getAllDomains();

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.sectionLabel}>Comparisons</div>
          <h1 className={styles.title}>X vs Y</h1>
          <p className={styles.subtitle}>
            Side-by-side breakdowns of the technologies, patterns, and concepts
            that matter. Each comparison cuts through the noise to help you
            understand the real tradeoffs and make informed decisions.
          </p>
        </div>
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{comparisons.length}</span>
            <span className={styles.statLabel}>Comparisons</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {new Set(comparisons.flatMap((c) => c.domains)).size}
            </span>
            <span className={styles.statLabel}>Domains</span>
          </div>
        </div>
      </div>
      <ComparisonsClient comparisons={comparisons} domains={domains} />
    </main>
  );
}
