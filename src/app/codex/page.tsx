import type { Metadata } from "next";
import { getAllCodexArticles, getAllDomains } from "@/lib/data";
import { CodexClient } from "./CodexClient";
import styles from "./codex.module.css";

export const metadata: Metadata = {
  title: "Codex",
  description:
    "Long-form articles exploring software engineering concepts in depth.",
};

export default function CodexPage() {
  const articles = getAllCodexArticles();
  const domains = getAllDomains();

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.sectionLabel}>Codex</div>
          <p className={styles.subtitle}>
            Long-form articles that go deep on the concepts that matter.
            Each piece is written to build real understanding, not just
            surface familiarity.
          </p>
        </div>
      </div>
      <CodexClient articles={articles} domains={domains} />
    </main>
  );
}
