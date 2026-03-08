import styles from "./GhostEvolution.module.css";

interface GhostEvolutionProps {
  level: number;
  size?: number;
}

/**
 * Ghost mascot that evolves visually based on Spectral Density level.
 * Levels 1–10 control opacity, glow intensity, and color richness.
 */
export function GhostEvolution({ level, size = 120 }: GhostEvolutionProps) {
  const clampedLevel = Math.max(1, Math.min(10, level));
  const opacity = getOpacity(clampedLevel);
  const glowIntensity = getGlowIntensity(clampedLevel);
  const gradientColors = getGradientColors(clampedLevel);

  const id = `ghost-evo-${clampedLevel}`;

  return (
    <div
      className={`${styles.wrapper} ${clampedLevel >= 5 ? styles.glowing : ""} ${clampedLevel >= 8 ? styles.chromatic : ""}`}
      style={{
        "--glow-intensity": `${glowIntensity}px`,
        "--glow-opacity": glowIntensity > 0 ? "1" : "0",
      } as React.CSSProperties}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className={styles.ghost}
        style={{ opacity }}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="50%" stopColor={gradientColors[1]} />
            <stop offset="100%" stopColor={gradientColors[2]} />
          </linearGradient>
          {glowIntensity > 0 && (
            <filter id={`${id}-glow`}>
              <feGaussianBlur
                stdDeviation={glowIntensity / 3}
                result="coloredBlur"
              />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        <path
          d="M24 4C14.059 4 6 12.059 6 22V44L10 40L14 44L18 40L22 44L26 40L30 44L34 40L38 44L42 40V22C42 12.059 33.941 4 24 4Z"
          fill={`url(#${id}-grad)`}
          filter={glowIntensity > 0 ? `url(#${id}-glow)` : undefined}
        />

        <circle cx="18" cy="22" r="3" fill="#080C15" />
        <circle cx="30" cy="22" r="3" fill="#080C15" />
        <circle cx="19.5" cy="20.5" r="1" fill="white" opacity="0.6" />
        <circle cx="31.5" cy="20.5" r="1" fill="white" opacity="0.6" />
      </svg>
    </div>
  );
}

function getOpacity(level: number): number {
  const map: Record<number, number> = {
    1: 0.2, 2: 0.35, 3: 0.5, 4: 0.6, 5: 0.72,
    6: 0.8, 7: 0.88, 8: 0.92, 9: 0.96, 10: 1,
  };
  return map[level] ?? 0.2;
}

function getGlowIntensity(level: number): number {
  if (level < 5) return 0;
  const map: Record<number, number> = {
    5: 4, 6: 6, 7: 10, 8: 14, 9: 18, 10: 24,
  };
  return map[level] ?? 0;
}

function getGradientColors(level: number): [string, string, string] {
  if (level <= 4) return ["#F0F4FF", "#C4BCFF", "#A78BFA"];
  if (level <= 6) return ["#F0F4FF", "#A78BFA", "#7DD3FC"];
  if (level <= 8) return ["#F0F4FF", "#A78BFA", "#34D399"];
  return ["#FB923C", "#A78BFA", "#34D399"]; // full spectral
}
