"use client";

import { useState, useEffect } from "react";
import type { TocHeading } from "@/lib/markdown/extract-headings";
import styles from "./research.module.css";

interface Props {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: Props) {
  const [activeSlug, setActiveSlug] = useState<string>("");

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.slug))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className={styles.toc}>
      <div className={styles.tocTitle}>On This Page</div>
      <nav className={styles.tocList}>
        {headings.map((h) => (
          <a
            key={h.slug}
            href={`#${h.slug}`}
            className={
              activeSlug === h.slug
                ? h.depth === 3
                  ? styles.tocItemH3Active
                  : styles.tocItemActive
                : h.depth === 3
                  ? styles.tocItemH3
                  : styles.tocItem
            }
          >
            {h.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
