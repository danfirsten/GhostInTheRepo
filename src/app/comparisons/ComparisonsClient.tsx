"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Clock, ArrowsLeftRight } from "@phosphor-icons/react";
import type { Comparison, Domain } from "@/types/content";
import { Tag, DifficultyBadge } from "@/components/ui/Tag";
import { EmptyState } from "@/components/ui/EmptyState";
import styles from "./comparisons.module.css";

interface ComparisonsClientProps {
  comparisons: Comparison[];
  domains: Domain[];
}

export function ComparisonsClient({
  comparisons,
  domains,
}: ComparisonsClientProps) {
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  const domainMap = useMemo(
    () => new Map(domains.map((d) => [d.slug, d])),
    [domains],
  );

  const filtered = useMemo(
    () =>
      activeDomain
        ? comparisons.filter((c) => c.domains.includes(activeDomain))
        : comparisons,
    [comparisons, activeDomain],
  );

  // Only show domains that have comparisons
  const activeDomains = useMemo(() => {
    const slugs = new Set(comparisons.flatMap((c) => c.domains));
    return domains.filter((d) => slugs.has(d.slug));
  }, [comparisons, domains]);

  return (
    <>
      {activeDomains.length > 1 && (
        <div className={styles.filters}>
          <button
            className={
              activeDomain === null
                ? styles.filterBtnActive
                : styles.filterBtn
            }
            onClick={() => setActiveDomain(null)}
            type="button"
          >
            All
          </button>
          {activeDomains.map((d) => (
            <button
              key={d.slug}
              className={
                activeDomain === d.slug
                  ? styles.filterBtnActive
                  : styles.filterBtn
              }
              onClick={() => setActiveDomain(d.slug)}
              type="button"
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <div className={styles.emptyWrap}>
            <EmptyState message="No comparisons yet. Check back soon." />
          </div>
        ) : (
          filtered.map((comparison) => {
            const primaryDomain = domainMap.get(comparison.domains[0]);
            return (
              <Link
                key={comparison.slug}
                href={`/comparisons/${comparison.slug}`}
                className={styles.card}
              >
                <div className={styles.cardMeta}>
                  <DifficultyBadge level={comparison.difficulty} />
                  {comparison.domains.map((d) => {
                    const domain = domainMap.get(d);
                    return domain ? (
                      <Tag key={d}>{domain.label}</Tag>
                    ) : null;
                  })}
                </div>
                <div className={styles.cardVs}>
                  <span className={styles.sideLabel}>{comparison.sideA}</span>
                  <ArrowsLeftRight
                    size={18}
                    weight="bold"
                    className={styles.vsIcon}
                  />
                  <span className={styles.sideLabel}>{comparison.sideB}</span>
                </div>
                <div className={styles.cardTitle}>{comparison.title}</div>
                {comparison.summary && (
                  <div className={styles.cardSummary}>
                    {comparison.summary}
                  </div>
                )}
                <div className={styles.cardFooter}>
                  <span className={styles.readingTime}>
                    <Clock size={14} weight="regular" />
                    {comparison.readingTime} min read
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
