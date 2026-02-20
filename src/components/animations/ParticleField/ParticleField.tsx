"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import styles from "./ParticleField.module.css";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  opacity: number;
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: randomBetween(0, 100),
    y: randomBetween(20, 100),
    size: randomBetween(1, 3),
    duration: randomBetween(15, 35),
    delay: randomBetween(0, 20),
    driftX: randomBetween(-40, 40),
    opacity: randomBetween(0.03, 0.1),
  }));
}

interface ParticleFieldProps {
  count?: number;
  active?: boolean;
}

export function ParticleField({ count = 40, active = true }: ParticleFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const particles = useMemo(() => generateParticles(count), [count]);

  useEffect(() => {
    if (!active) return;

    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [active]);

  if (!active) return null;

  return (
    <div ref={fieldRef} className={styles.field}>
      {particles.map((p) => {
        // Subtle drift toward cursor when within 80px
        let offsetX = 0;
        let offsetY = 0;
        if (mousePos && fieldRef.current) {
          const rect = fieldRef.current.getBoundingClientRect();
          const px = (p.x / 100) * rect.width;
          const py = (p.y / 100) * rect.height;
          const dx = mousePos.x - px;
          const dy = mousePos.y - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            const strength = (80 - dist) / 80;
            offsetX = dx * strength * 0.1;
            offsetY = dy * strength * 0.1;
          }
        }

        return (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              "--size": `${p.size}px`,
              "--duration": `${p.duration}s`,
              "--delay": `${p.delay}s`,
              "--drift-x": `${p.driftX}px`,
              "--particle-opacity": p.opacity,
              transform: `translate(${offsetX}px, ${offsetY}px)`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}
