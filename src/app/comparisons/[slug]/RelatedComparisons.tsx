import Link from "next/link";
import { ArrowsLeftRight } from "@phosphor-icons/react/dist/ssr";
import type { Comparison } from "@/types/content";
import styles from "./comparison.module.css";

interface RelatedComparisonsProps {
  comparisons: Comparison[];
}

export function RelatedComparisons({ comparisons }: RelatedComparisonsProps) {
  return (
    <section className={styles.related}>
      <h2 className={styles.relatedTitle}>Related Comparisons</h2>
      <div className={styles.relatedGrid}>
        {comparisons.map((c) => (
          <Link
            key={c.slug}
            href={`/comparisons/${c.slug}`}
            className={styles.relatedCard}
          >
            <div className={styles.relatedVs}>
              <span>{c.sideA}</span>
              <ArrowsLeftRight size={14} weight="bold" />
              <span>{c.sideB}</span>
            </div>
            <div className={styles.relatedCardTitle}>{c.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
