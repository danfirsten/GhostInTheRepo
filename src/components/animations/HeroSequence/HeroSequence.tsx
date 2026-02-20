"use client";

import { useEffect, useState } from "react";
import { GhostLogo } from "@/components/ui/GhostLogo";
import { Button } from "@/components/ui/Button";
import { useHeroPage } from "@/lib/hooks/useHeroPage";
import styles from "./HeroSequence.module.css";

export function HeroSequence() {
  const { setIsHeroPage } = useHeroPage();
  const [step, setStep] = useState(0);

  useEffect(() => {
    setIsHeroPage(true);
    return () => setIsHeroPage(false);
  }, [setIsHeroPage]);

  useEffect(() => {
    // Respect reduced motion — show everything immediately
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(7);
      return;
    }

    const timers = [
      setTimeout(() => setStep(1), 100),   // ghost logo
      setTimeout(() => setStep(2), 300),   // headline 1
      setTimeout(() => setStep(3), 450),   // headline 2
      setTimeout(() => setStep(4), 600),   // subheading
      setTimeout(() => setStep(5), 750),   // CTA buttons
      setTimeout(() => setStep(6), 900),   // particle field (handled by parent)
      setTimeout(() => setStep(7), 1200),  // nav links (handled by navbar)
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={`${styles.logo} ${step >= 1 ? styles.visible : ""}`}>
        <GhostLogo size={96} />
      </div>

      <h1 className={`${styles.headline1} ${step >= 2 ? styles.visible : ""}`}>
        Ghost in the Repo
      </h1>
      <p className={`${styles.headline2} ${step >= 3 ? styles.visible : ""}`}>
        Know the machine. Haunt it.
      </p>

      <p className={`${styles.subheading} ${step >= 4 ? styles.visible : ""}`}>
        The complete reference for software engineers who want to understand
        everything, deeply.
      </p>

      <div className={styles.ctas}>
        <div className={`${styles.cta} ${step >= 5 ? styles.visible : ""}`}>
          <Button href="/topics">Explore Topics</Button>
        </div>
        <div className={`${styles.cta} ${step >= 5 ? styles.visible : ""}`}>
          <Button variant="secondary" href="/paths">
            Learning Paths
          </Button>
        </div>
      </div>
    </section>
  );
}
