import type { Metadata } from "next";
import { getAllDomains, getAllLearningPaths } from "@/lib/data";
import { PathsClient } from "./PathsClient";
import styles from "./paths.module.css";

export const metadata: Metadata = {
  title: "Learning Paths",
  description:
    "Curated learning paths through 14 knowledge domains — visualized as an interactive constellation graph.",
};

export default function PathsPage() {
  const domains = getAllDomains();
  const paths = getAllLearningPaths();

  return (
    <main className={styles.page}>
      <PathsClient domains={domains} paths={paths} />
    </main>
  );
}
