"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Clock } from "@phosphor-icons/react";
import type { CodexArticle, Domain } from "@/types/content";
import { Tag, DifficultyBadge } from "@/components/ui/Tag";
import { EmptyState } from "@/components/ui/EmptyState";
import styles from "./codex.module.css";

interface CodexClientProps {
  articles: CodexArticle[];
  domains: Domain[];
}

export function CodexClient({ articles, domains }: CodexClientProps) {
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  const domainMap = useMemo(
    () => new Map(domains.map((d) => [d.slug, d])),
    [domains],
  );

  const filtered = useMemo(
    () =>
      activeDomain
        ? articles.filter((a) => a.domain === activeDomain)
        : articles,
    [articles, activeDomain],
  );

  // Only show domains that have articles
  const activeDomains = useMemo(() => {
    const slugs = new Set(articles.map((a) => a.domain));
    return domains.filter((d) => slugs.has(d.slug));
  }, [articles, domains]);

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
            <EmptyState message="No articles yet. Check back soon." />
          </div>
        ) : (
          filtered.map((article) => {
            const domain = domainMap.get(article.domain);
            return (
              <Link
                key={article.slug}
                href={`/codex/${article.slug}`}
                className={styles.card}
              >
                <div className={styles.cardMeta}>
                  <DifficultyBadge level={article.difficulty} />
                  {domain && <Tag>{domain.label}</Tag>}
                </div>
                <div className={styles.cardTitle}>{article.title}</div>
                {article.summary && (
                  <div className={styles.cardSummary}>{article.summary}</div>
                )}
                <div className={styles.cardFooter}>
                  <span className={styles.readingTime}>
                    <Clock size={14} weight="regular" />
                    {article.readingTime} min read
                  </span>
                  <span className={styles.metaDot} />
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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
