"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import styles from "./SignInCallout.module.css";

/**
 * Non-intrusive callout shown on content pages when the user is not logged in.
 * Hidden entirely when authenticated.
 */
export function SignInCallout() {
  const { user, loading } = useAuth();

  if (loading || user) return null;

  return (
    <div className={styles.callout}>
      <span className={styles.ghost}>👻</span>
      <div className={styles.text}>
        <a href="/auth/login" className={styles.link}>Sign in</a>
        {" "}to track your progress, earn badges, and build your spectral density.
      </div>
    </div>
  );
}
