import { GhostEvolution } from "../GhostEvolution/GhostEvolution";
import { SpectralDensityMeter } from "../SpectralDensityMeter/SpectralDensityMeter";
import { GHOST_LEVEL_TITLES } from "@/lib/db/types";
import styles from "./ProfileHeader.module.css";

interface ProfileHeaderProps {
  displayName: string;
  username: string;
  avatarUrl: string | null;
  ghostLevel: number;
  spectralDensity: number;
}

export function ProfileHeader({
  displayName,
  username,
  avatarUrl,
  ghostLevel,
  spectralDensity,
}: ProfileHeaderProps) {
  const levelTitle = GHOST_LEVEL_TITLES[ghostLevel] ?? "Unknown Spirit";

  return (
    <div className={styles.header}>
      <div className={styles.ghostSection}>
        <GhostEvolution level={ghostLevel} size={100} />
      </div>

      <div className={styles.info}>
        <div className={styles.identity}>
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt=""
              className={styles.avatar}
              width={48}
              height={48}
              referrerPolicy="no-referrer"
            />
          )}
          <div>
            <h1 className={styles.name}>{displayName}</h1>
            <p className={styles.username}>@{username}</p>
          </div>
        </div>
        <p className={styles.title}>{levelTitle}</p>
      </div>

      <div className={styles.meterSection}>
        <SpectralDensityMeter
          percentage={spectralDensity}
          level={ghostLevel}
          size={160}
        />
        <p className={styles.densityLabel}>
          {spectralDensity}% Spectral Density
        </p>
      </div>
    </div>
  );
}
