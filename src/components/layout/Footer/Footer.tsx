import { GhostLogo } from "@/components/ui/GhostLogo";
import styles from "./Footer.module.css";

const footerLinks = [
  { href: "/topics", label: "Topics" },
  { href: "/paths", label: "Paths" },
  { href: "/codex", label: "Codex" },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.divider} />
      <div className={styles.logoRow}>
        <GhostLogo size={24} />
        <span className={styles.wordmark}>Ghost in the Repo</span>
      </div>
      <p className={styles.tagline}>Know the machine. Haunt it.</p>
      <nav className={styles.links}>
        {footerLinks.map((link) => (
          <a key={link.href} href={link.href} className={styles.link}>
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
