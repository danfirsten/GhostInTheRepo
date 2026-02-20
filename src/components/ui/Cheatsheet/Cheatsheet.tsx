import type { CheatsheetEntry as CheatsheetEntryType, CheatsheetSection as CheatsheetSectionType } from "@/types/content";
import styles from "./Cheatsheet.module.css";

interface CheatsheetEntryProps {
  entry: CheatsheetEntryType;
}

export function CheatsheetEntry({ entry }: CheatsheetEntryProps) {
  return (
    <div className={styles.entry}>
      <span className={styles.command}>{entry.command}</span>
      <span className={styles.description}>{entry.description}</span>
    </div>
  );
}

interface CheatsheetSectionProps {
  section: CheatsheetSectionType;
}

export function CheatsheetSection({ section }: CheatsheetSectionProps) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>{section.title}</div>
      <div className={styles.entries}>
        {section.entries.map((entry, i) => (
          <CheatsheetEntry key={i} entry={entry} />
        ))}
      </div>
    </div>
  );
}
