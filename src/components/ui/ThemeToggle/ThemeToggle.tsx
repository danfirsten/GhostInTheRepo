"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "@/lib/hooks/useTheme";
import styles from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span className={styles.iconWrap}>
        <Sun
          size={18}
          weight="bold"
          className={`${styles.icon} ${theme === "light" ? styles.iconActive : styles.iconHidden}`}
        />
        <Moon
          size={18}
          weight="bold"
          className={`${styles.icon} ${theme === "dark" ? styles.iconActive : styles.iconHidden}`}
        />
      </span>
    </button>
  );
}
