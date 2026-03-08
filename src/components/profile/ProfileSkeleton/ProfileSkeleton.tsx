import styles from "./ProfileSkeleton.module.css";

/**
 * Skeleton loading state for the profile page.
 * Displayed while server data is being fetched.
 */
export function ProfileSkeleton() {
  return (
    <div className={styles.skeleton}>
      {/* Header skeleton */}
      <div className={styles.headerSkeleton}>
        <div className={styles.ghostCircle} />
        <div className={styles.infoBlock}>
          <div className={styles.bar} style={{ width: "60%" }} />
          <div className={styles.bar} style={{ width: "35%", height: 12 }} />
        </div>
        <div className={styles.meterCircle} />
      </div>

      {/* Stats grid skeleton */}
      <div className={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIcon} />
            <div className={styles.bar} style={{ width: "50%" }} />
            <div className={styles.bar} style={{ width: "70%", height: 10 }} />
          </div>
        ))}
      </div>

      {/* Domain progress skeleton */}
      <div className={styles.domainBlock}>
        <div className={styles.bar} style={{ width: "40%", marginBottom: 16 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.domainRow}>
            <div className={styles.bar} style={{ width: "30%" }} />
            <div className={styles.trackBar} />
          </div>
        ))}
      </div>

      {/* Badge grid skeleton */}
      <div className={styles.badgeBlock}>
        <div className={styles.bar} style={{ width: "25%", marginBottom: 16 }} />
        <div className={styles.badgeGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.badgeCard} />
          ))}
        </div>
      </div>
    </div>
  );
}
