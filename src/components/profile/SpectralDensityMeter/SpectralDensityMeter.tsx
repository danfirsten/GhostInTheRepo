"use client";

import { useEffect, useState } from "react";
import styles from "./SpectralDensityMeter.module.css";

interface SpectralDensityMeterProps {
  percentage: number;
  level: number;
  size?: number;
}

/**
 * Circular arc meter showing overall mastery / spectral density.
 * Color transitions based on progress percentage.
 */
export function SpectralDensityMeter({
  percentage,
  level,
  size = 180,
}: SpectralDensityMeterProps) {
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    // Animate from 0 to actual percentage on mount
    const timer = setTimeout(() => setAnimatedPct(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc goes from 225° to -45° (270° sweep)
  const arcLength = circumference * 0.75;
  const offset = arcLength - (animatedPct / 100) * arcLength;

  const color = getArcColor(percentage);

  return (
    <div className={styles.container} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.svg}>
        {/* Background arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(135, ${size / 2}, ${size / 2})`}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(135, ${size / 2}, ${size / 2})`}
          className={styles.progressArc}
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      <div className={styles.center}>
        <span className={styles.level}>{level}</span>
        <span className={styles.label}>Level</span>
      </div>
    </div>
  );
}

function getArcColor(pct: number): string {
  if (pct >= 70) return "var(--spectral-3)";  // emerald
  if (pct >= 40) return "var(--spectral-2)";  // sky
  return "var(--spectral-5)";                  // amber
}
