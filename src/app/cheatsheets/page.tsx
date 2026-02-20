import type { Metadata } from "next";
import { getAllCheatsheets, getDomain } from "@/lib/data";
import { getDomainIcon } from "@/lib/domain-icons";
import { TopicCardMd } from "@/components/ui/TopicCard";
import styles from "./cheatsheets.module.css";

export const metadata: Metadata = {
  title: "Cheatsheets",
  description:
    "Quick-reference cheatsheets for every domain — commands, syntax, and key concepts at a glance.",
};

export default function CheatsheetsPage() {
  const cheatsheets = getAllCheatsheets();

  return (
    <main className={styles.page}>
      <div className={styles.sectionLabel}>Cheatsheets</div>
      <p className={styles.subtitle}>
        Quick-reference cards for every domain. Commands, syntax, key concepts
        — all in one place. Printable and copyable.
      </p>
      <div className={styles.grid}>
        {cheatsheets.map((cs) => {
          const domain = getDomain(cs.domainSlug);
          if (!domain) return null;
          const Icon = getDomainIcon(cs.domainSlug);
          const entryCount = cs.sections.reduce(
            (sum, s) => sum + s.entries.length,
            0,
          );
          return (
            <TopicCardMd
              key={cs.domainSlug}
              title={domain.label}
              subtopicCount={entryCount}
              icon={Icon}
              href={`/cheatsheets/${cs.domainSlug}`}
              subtopics={cs.sections.map((s) => s.title)}
            />
          );
        })}
      </div>
    </main>
  );
}
