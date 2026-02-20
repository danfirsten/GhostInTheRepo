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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(7);
      return;
    }

    const timers = [
      setTimeout(() => setStep(1), 100),
      setTimeout(() => setStep(2), 300),
      setTimeout(() => setStep(3), 450),
      setTimeout(() => setStep(4), 600),
      setTimeout(() => setStep(5), 750),
      setTimeout(() => setStep(6), 900),
      setTimeout(() => setStep(7), 1200),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={`${styles.logo} ${step >= 1 ? styles.visible : ""}`}>
        <GhostLogo size={96} />
      </div>

      <h1 className={`${styles.headline1} ${step >= 2 ? styles.visible : ""}`}>
        Know the <span className={styles.gradientWord}>Machine.</span>
      </h1>
      <p className={`${styles.headline2} ${step >= 3 ? styles.visible : ""}`}>
        Haunt it.
      </p>

      <p className={`${styles.subheading} ${step >= 4 ? styles.visible : ""}`}>
        The complete reference for software engineers who want to understand
        everything, deeply.
      </p>

      <div className={styles.ctas}>
        <div className={`${styles.cta} ${step >= 5 ? styles.visible : ""}`}>
          <Button href="/topics">Start Learning</Button>
        </div>
        <div className={`${styles.cta} ${step >= 5 ? styles.visible : ""}`}>
          <Button variant="secondary" href="/topics">
            Explore Topics
          </Button>
        </div>
      </div>
    </section>
  );
}
