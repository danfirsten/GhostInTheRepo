"use client";

import { useState, useEffect } from "react";
import styles from "./research.module.css";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) {
        setProgress(100);
        return;
      }

      const pct = Math.min(100, (scrollTop / docHeight) * 100);
      setProgress(pct);

      if (pct >= 99.5 && !complete) {
        setComplete(true);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [complete]);

  return (
    <div
      className={styles.progressBar}
      style={{ width: `${progress}%` }}
      data-complete={complete}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
}
