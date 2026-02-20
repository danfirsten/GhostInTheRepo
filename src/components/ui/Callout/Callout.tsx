import type { ReactNode } from "react";
import styles from "./Callout.module.css";

export type CalloutVariant = "key-insight" | "gotcha" | "mental-model" | "deep-dive";

const variantConfig: Record<
  CalloutVariant,
  { icon: string; label: string; className: string }
> = {
  "key-insight": { icon: "💡", label: "Key Insight", className: styles.keyInsight },
  gotcha: { icon: "⚠️", label: "Gotcha", className: styles.gotcha },
  "mental-model": { icon: "🔗", label: "Mental Model", className: styles.mentalModel },
  "deep-dive": { icon: "🔐", label: "Deep Dive", className: styles.deepDive },
};

interface CalloutProps {
  variant: CalloutVariant;
  children: ReactNode;
}

export function Callout({ variant, children }: CalloutProps) {
  const config = variantConfig[variant];
  return (
    <div className={config.className}>
      <div className={styles.header}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
