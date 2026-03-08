"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { useAuth } from "@/lib/hooks/useAuth";
import styles from "./TopicCompletionList.module.css";

/** Context that holds the set of completed topic slugs for a domain */
const CompletionContext = createContext<Set<string>>(new Set());

interface CompletionProviderProps {
  domainSlug: string;
  children: React.ReactNode;
}

/**
 * Fetches completion data for a domain once, provides it to children.
 * Renders children immediately (no loading gate).
 */
export function CompletionProvider({
  domainSlug,
  children,
}: CompletionProviderProps) {
  const { user } = useAuth();
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    fetch(`/api/user/progress?domain=${domainSlug}`)
      .then((r) => r.json())
      .then(
        (
          data: Array<{
            content_type: string;
            content_slug: string;
            progress_pct: number;
          }>
        ) => {
          if (!Array.isArray(data)) return;
          const done = new Set(
            data
              .filter(
                (p) =>
                  p.content_type === "topic" && p.progress_pct >= 100
              )
              .map((p) => p.content_slug)
          );
          setCompleted(done);
        }
      )
      .catch(() => {});
  }, [user, domainSlug]);

  return (
    <CompletionContext.Provider value={completed}>
      {children}
    </CompletionContext.Provider>
  );
}

/**
 * Inline checkmark that renders if the given topic slug is completed.
 * Must be used inside a CompletionProvider.
 */
export function TopicCheckmark({ topicSlug }: { topicSlug: string }) {
  const completed = useContext(CompletionContext);

  if (!completed.has(topicSlug)) return null;

  return (
    <span className={styles.inlineCheck} title="Completed">
      <CheckCircle size={16} weight="fill" />
    </span>
  );
}
