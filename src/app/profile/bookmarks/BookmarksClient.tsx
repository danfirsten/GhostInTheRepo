"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookmarkSimple,
  BookOpen,
  Table,
  Lightning,
  ArrowRight,
  Trash,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/hooks/useAuth";
import styles from "./bookmarks.module.css";

interface Bookmark {
  content_type: "topic" | "codex" | "cheatsheet";
  content_slug: string;
  domain_slug: string | null;
  created_at: string;
}

const TYPE_ICONS = {
  topic: BookOpen,
  codex: Lightning,
  cheatsheet: Table,
};

const TYPE_LABELS = {
  topic: "Topic",
  codex: "Codex",
  cheatsheet: "Cheatsheet",
};

function getBookmarkHref(b: Bookmark): string {
  switch (b.content_type) {
    case "topic":
      return b.domain_slug
        ? `/topics/${b.domain_slug}/${b.content_slug}`
        : `/topics`;
    case "codex":
      return `/codex/${b.content_slug}`;
    case "cheatsheet":
      return `/cheatsheets/${b.content_slug}`;
  }
}

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function BookmarksClient() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) return;

    fetch("/api/user/bookmarks")
      .then((r) => r.json())
      .then((data: Bookmark[]) => {
        if (Array.isArray(data)) setBookmarks(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const removeBookmark = useCallback(
    async (b: Bookmark) => {
      // Optimistic removal
      setBookmarks((prev) =>
        prev.filter(
          (x) =>
            !(
              x.content_type === b.content_type &&
              x.content_slug === b.content_slug
            )
        )
      );

      try {
        await fetch("/api/user/bookmarks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_type: b.content_type,
            content_slug: b.content_slug,
          }),
        });
      } catch {
        // Re-add on error
        setBookmarks((prev) => [...prev, b]);
      }
    },
    []
  );

  const filtered =
    filter === "all"
      ? bookmarks
      : bookmarks.filter((b) => b.content_type === filter);

  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BookmarkSimple size={24} weight="duotone" />
        <h2 className={styles.title}>Bookmarks</h2>
        <span className={styles.count}>{bookmarks.length}</span>
      </div>

      {/* Filter pills */}
      <div className={styles.filters}>
        {["all", "topic", "codex", "cheatsheet"].map((f) => (
          <button
            key={f}
            type="button"
            className={filter === f ? styles.filterActive : styles.filter}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : TYPE_LABELS[f as keyof typeof TYPE_LABELS]}
          </button>
        ))}
      </div>

      {loading && (
        <div className={styles.empty}>
          <p className={styles.emptyText}>Loading bookmarks...</p>
        </div>
      )}

      {!loading && bookmarks.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <BookmarkSimple size={40} weight="thin" />
          </span>
          <p className={styles.emptyText}>
            Nothing saved yet. Bookmark topics to find them here.
          </p>
        </div>
      )}

      {!loading && filtered.length === 0 && bookmarks.length > 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyText}>No {filter} bookmarks.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className={styles.list}>
          {filtered.map((b) => {
            const Icon = TYPE_ICONS[b.content_type];
            return (
              <div
                key={`${b.content_type}-${b.content_slug}`}
                className={styles.item}
              >
                <a href={getBookmarkHref(b)} className={styles.itemLink}>
                  <span className={styles.itemIcon}>
                    <Icon size={18} weight="duotone" />
                  </span>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemTitle}>
                      {formatSlug(b.content_slug)}
                    </span>
                    <span className={styles.itemMeta}>
                      {TYPE_LABELS[b.content_type]}
                      {b.domain_slug && ` · ${formatSlug(b.domain_slug)}`}
                    </span>
                  </div>
                  <ArrowRight
                    size={14}
                    weight="bold"
                    className={styles.itemArrow}
                  />
                </a>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeBookmark(b)}
                  aria-label="Remove bookmark"
                  title="Remove bookmark"
                >
                  <Trash size={14} weight="regular" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
