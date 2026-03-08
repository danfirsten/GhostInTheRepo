import { BookOpen, Table, Path, Fire } from "@phosphor-icons/react/dist/ssr";
import styles from "./StatsGrid.module.css";

interface StatsGridProps {
  topicsCompleted: number;
  totalTopics: number;
  cheatsheetsViewed: number;
  totalCheatsheets: number;
  pathsStarted: number;
  totalPaths: number;
  currentStreak: number;
}

export function StatsGrid({
  topicsCompleted,
  totalTopics,
  cheatsheetsViewed,
  totalCheatsheets,
  pathsStarted,
  totalPaths,
  currentStreak,
}: StatsGridProps) {
  const stats = [
    {
      icon: <BookOpen size={20} weight="regular" />,
      label: "Topics",
      value: `${topicsCompleted}/${totalTopics}`,
    },
    {
      icon: <Table size={20} weight="regular" />,
      label: "Cheatsheets",
      value: `${cheatsheetsViewed}/${totalCheatsheets}`,
    },
    {
      icon: <Path size={20} weight="regular" />,
      label: "Paths",
      value: `${pathsStarted}/${totalPaths}`,
    },
    {
      icon: <Fire size={20} weight="regular" />,
      label: "Streak",
      value: `${currentStreak} day${currentStreak !== 1 ? "s" : ""}`,
    },
  ];

  return (
    <div className={styles.grid}>
      {stats.map((stat) => (
        <div key={stat.label} className={styles.card}>
          <div className={styles.icon}>{stat.icon}</div>
          <span className={styles.value}>{stat.value}</span>
          <span className={styles.label}>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
