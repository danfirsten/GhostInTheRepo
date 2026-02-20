"use client";

import { useScrollReveal } from "@/lib/hooks/useScrollReveal";
import styles from "./page.module.css";

export function DomainGrid({ children }: { children: React.ReactNode }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={`${styles.domainGrid} ${isVisible ? styles.domainGridVisible : ""}`}
    >
      {children}
    </div>
  );
}
