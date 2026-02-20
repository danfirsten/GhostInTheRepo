import type { ReactNode } from "react";
import styles from "./Tag.module.css";

interface TagProps {
  children: ReactNode;
  className?: string;
}

export function Tag({ children, className }: TagProps) {
  return <span className={`${styles.tag} ${className ?? ""}`}>{children}</span>;
}

export type Difficulty = "beginner" | "intermediate" | "advanced" | "arcane";

const difficultyLabels: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  arcane: "Arcane",
};

interface DifficultyBadgeProps {
  level: Difficulty;
  className?: string;
}

export function DifficultyBadge({ level, className }: DifficultyBadgeProps) {
  return (
    <span className={`${styles[level]} ${className ?? ""}`}>
      {difficultyLabels[level]}
    </span>
  );
}
