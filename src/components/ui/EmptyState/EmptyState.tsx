import { GhostLogo } from "../GhostLogo/GhostLogo";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  message: string;
  children?: React.ReactNode;
}

export function EmptyState({ message, children }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <GhostLogo size={72} />
      <p className={styles.message}>{message}</p>
      {children}
    </div>
  );
}
