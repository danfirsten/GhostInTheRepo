"use client";

import type { Domain, LearningPath } from "@/types/content";
import { PathWizard } from "@/components/ui/PathWizard";
import styles from "./paths.module.css";

interface PathsClientProps {
  domains: Domain[];
  paths: LearningPath[];
}

export function PathsClient({ domains, paths }: PathsClientProps) {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.sectionLabel}>Learning Paths</div>
        <p className={styles.subtitle}>
          Answer three quick questions and we&apos;ll build a tailored learning
          path for your goals, schedule, and depth.
        </p>
      </div>

      <PathWizard domains={domains} paths={paths} />
    </>
  );
}
