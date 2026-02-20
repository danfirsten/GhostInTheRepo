"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Domain, LearningPath } from "@/types/content";
import { PathList } from "@/components/ui/PathList";
import styles from "./paths.module.css";

const KnowledgeGraph = dynamic(
  () =>
    import("@/components/ui/KnowledgeGraph/KnowledgeGraph").then(
      (mod) => mod.KnowledgeGraph,
    ),
  { ssr: false },
);

interface PathsClientProps {
  domains: Domain[];
  paths: LearningPath[];
}

export function PathsClient({ domains, paths }: PathsClientProps) {
  const [view, setView] = useState<"graph" | "list">("graph");

  // Default to list view on smaller screens
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setView("list");
    }
  }, []);

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.sectionLabel}>Learning Paths</div>
          <p className={styles.subtitle}>
            Curated sequences through the knowledge domains. Each path connects
            topics in the order that builds the deepest understanding.
          </p>
        </div>
        <div className={styles.viewToggle}>
          <button
            className={
              view === "graph" ? styles.toggleBtnActive : styles.toggleBtn
            }
            onClick={() => setView("graph")}
            type="button"
          >
            Graph View
          </button>
          <button
            className={
              view === "list" ? styles.toggleBtnActive : styles.toggleBtn
            }
            onClick={() => setView("list")}
            type="button"
          >
            List View
          </button>
        </div>
      </div>

      {view === "graph" ? (
        <div className={styles.graphWrap}>
          <KnowledgeGraph domains={domains} paths={paths} />
        </div>
      ) : (
        <div className={styles.listView}>
          <PathList paths={paths} />
        </div>
      )}
    </>
  );
}
