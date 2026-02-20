import styles from "./GhostLogo.module.css";

interface GhostLogoProps {
  size?: number;
  className?: string;
}

export function GhostLogo({ size = 48, className }: GhostLogoProps) {
  const id = `ghost-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={`${styles.ghost} ${className ?? ""}`}
      aria-label="Ghost in the Repo logo"
      role="img"
    >
      <defs>
        <linearGradient
          id={`${id}-gradient`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#F0F4FF" />
          <stop offset="100%" stopColor="#C4BCFF" />
        </linearGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ghost body */}
      <path
        d="M24 4C14.059 4 6 12.059 6 22V44L10 40L14 44L18 40L22 44L26 40L30 44L34 40L38 44L42 40V22C42 12.059 33.941 4 24 4Z"
        fill={`url(#${id}-gradient)`}
        filter={`url(#${id}-glow)`}
        opacity="0.95"
      />

      {/* Eyes */}
      <circle
        cx="18"
        cy="22"
        r="3"
        fill="#080C15"
        className={styles.eye}
      />
      <circle
        cx="30"
        cy="22"
        r="3"
        fill="#080C15"
        className={`${styles.eye} ${styles.eyeRight}`}
      />

      {/* Eye shine */}
      <circle cx="19.5" cy="20.5" r="1" fill="white" opacity="0.6" />
      <circle cx="31.5" cy="20.5" r="1" fill="white" opacity="0.6" />
    </svg>
  );
}
