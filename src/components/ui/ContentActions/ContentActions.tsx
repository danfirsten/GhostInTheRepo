"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  BookmarkSimple,
  Circle,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/hooks/useAuth";
import styles from "./ContentActions.module.css";

interface ContentActionsProps {
  contentType: "topic" | "codex" | "cheatsheet";
  contentSlug: string;
  domainSlug?: string;
  /** Label for the complete button. Defaults to "Mark as Complete" */
  completeLabel?: string;
}

export function ContentActions({
  contentType,
  contentSlug,
  domainSlug,
  completeLabel = "Mark as Complete",
}: ContentActionsProps) {
  const { user } = useAuth();
  const [isComplete, setIsComplete] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch initial state
  useEffect(() => {
    if (!user) return;

    // Check progress
    fetch(`/api/user/progress?domain=${domainSlug ?? ""}`)
      .then((r) => r.json())
      .then((data: Array<{ content_type: string; content_slug: string; progress_pct: number }>) => {
        if (Array.isArray(data)) {
          const entry = data.find(
            (p) => p.content_type === contentType && p.content_slug === contentSlug
          );
          if (entry && entry.progress_pct >= 100) {
            setIsComplete(true);
          }
        }
      })
      .catch(() => {});

    // Check bookmarks
    fetch("/api/user/bookmarks")
      .then((r) => r.json())
      .then((data: Array<{ content_type: string; content_slug: string }>) => {
        if (Array.isArray(data)) {
          const found = data.some(
            (b) => b.content_type === contentType && b.content_slug === contentSlug
          );
          setIsBookmarked(found);
        }
      })
      .catch(() => {});
  }, [user, contentType, contentSlug, domainSlug]);

  const handleMarkComplete = useCallback(async () => {
    if (!user || loading) return;
    setLoading(true);

    const newState = !isComplete;
    setIsComplete(newState); // optimistic

    try {
      await fetch("/api/user/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: contentType,
          content_slug: contentSlug,
          domain_slug: domainSlug,
          progress_pct: newState ? 100 : 0,
        }),
      });
    } catch {
      setIsComplete(!newState); // revert on error
    }

    setLoading(false);
  }, [user, loading, isComplete, contentType, contentSlug, domainSlug]);

  const handleToggleBookmark = useCallback(async () => {
    if (!user || loading) return;

    const newState = !isBookmarked;
    setIsBookmarked(newState); // optimistic

    try {
      if (newState) {
        await fetch("/api/user/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_type: contentType,
            content_slug: contentSlug,
            domain_slug: domainSlug,
          }),
        });
      } else {
        await fetch("/api/user/bookmarks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_type: contentType,
            content_slug: contentSlug,
          }),
        });
      }
    } catch {
      setIsBookmarked(!newState); // revert on error
    }
  }, [user, loading, isBookmarked, contentType, contentSlug, domainSlug]);

  // Don't render if not logged in
  if (!user) return null;

  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={`${styles.completeBtn} ${isComplete ? styles.completed : ""}`}
        onClick={handleMarkComplete}
        disabled={loading}
      >
        {isComplete ? (
          <CheckCircle size={20} weight="fill" />
        ) : (
          <Circle size={20} weight="regular" />
        )}
        {isComplete ? "Completed" : completeLabel}
      </button>

      <button
        type="button"
        className={`${styles.bookmarkBtn} ${isBookmarked ? styles.bookmarked : ""}`}
        onClick={handleToggleBookmark}
        aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      >
        <BookmarkSimple
          size={20}
          weight={isBookmarked ? "fill" : "regular"}
        />
      </button>
    </div>
  );
}
