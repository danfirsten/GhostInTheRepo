"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MagnifyingGlass, ArrowRight } from "@phosphor-icons/react";
import styles from "./Search.module.css";

interface SearchResult {
  title: string;
  path: string;
  href: string;
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const RECENT_KEY = "ghost-recent-searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (!query.trim()) return;
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Fuse.js will be wired in Phase 5 — for now, return empty results
  const results: SearchResult[] = [];

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(-1);
      setRecentSearches(getRecentSearches());
      // Focus input after animation
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      }
      if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
        saveRecentSearch(query);
        window.location.href = results[activeIndex].href;
      }
    },
    [activeIndex, results, query, onClose],
  );

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.container}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Input */}
        <div className={styles.inputRow}>
          <MagnifyingGlass
            size={22}
            weight="regular"
            className={styles.inputIcon}
          />
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder="Search topics, cheatsheets, guides..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
          />
          <span className={styles.escHint}>ESC</span>
        </div>

        {/* Results */}
        <div className={styles.results}>
          {query.trim() === "" && recentSearches.length > 0 && (
            <>
              <div className={styles.sectionLabel}>Recent</div>
              {recentSearches.map((s) => (
                <div
                  key={s}
                  className={styles.resultItem}
                  onClick={() => {
                    setQuery(s);
                  }}
                >
                  <span className={styles.resultTitle}>{s}</span>
                </div>
              ))}
            </>
          )}

          {query.trim() !== "" && results.length === 0 && (
            <div className={styles.empty}>
              No results yet — search index will be populated in a future phase.
            </div>
          )}

          {results.length > 0 && (
            <>
              <div className={styles.sectionLabel}>Results</div>
              {results.map((result, i) => (
                <a
                  key={result.href}
                  href={result.href}
                  className={`${styles.resultItem} ${i === activeIndex ? styles.resultItemActive : ""}`}
                  onClick={() => saveRecentSearch(query)}
                >
                  <span className={styles.resultIcon}>
                    <MagnifyingGlass size={18} />
                  </span>
                  <div className={styles.resultText}>
                    <div className={styles.resultTitle}>{result.title}</div>
                    <div className={styles.resultPath}>{result.path}</div>
                  </div>
                  <span className={styles.resultArrow}>
                    <ArrowRight size={16} />
                  </span>
                </a>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
