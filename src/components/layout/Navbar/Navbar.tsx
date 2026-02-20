"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MagnifyingGlass, List, X } from "@phosphor-icons/react";
import { GhostLogo } from "@/components/ui/GhostLogo";
import { useHeroPage } from "@/lib/hooks/useHeroPage";
import styles from "./Navbar.module.css";

const navLinks = [
  { href: "/topics", label: "Topics" },
  { href: "/paths", label: "Paths" },
  { href: "/codex", label: "Codex" },
];

interface NavbarProps {
  onSearchOpen: () => void;
}

export function Navbar({ onSearchOpen }: NavbarProps) {
  const pathname = usePathname();
  const { isHeroPage } = useHeroPage();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 48);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const isFrosted = !isHeroPage || scrolled;

  return (
    <>
      <nav className={`${styles.navbar} ${isFrosted ? styles.frosted : ""}`}>
        {/* Left: Logo + Wordmark */}
        <a href="/" className={styles.left}>
          <GhostLogo size={32} />
          <span className={styles.wordmark}>Ghost in the Repo</span>
        </a>

        {/* Center: Nav Links */}
        <div className={styles.center}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={
                pathname?.startsWith(link.href)
                  ? styles.navLinkActive
                  : styles.navLink
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: Search + Hamburger */}
        <div className={styles.right}>
          <button
            className={styles.searchBtn}
            onClick={onSearchOpen}
            aria-label="Search"
            type="button"
          >
            <MagnifyingGlass size={20} weight="regular" />
          </button>
          <span className={styles.kbd}>
            {typeof navigator !== "undefined" &&
            /mac/i.test(navigator.userAgent)
              ? "⌘K"
              : "Ctrl+K"}
          </span>
          <button
            className={styles.hamburger}
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            type="button"
          >
            {drawerOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          <div
            className={styles.drawerBackdrop}
            onClick={() => setDrawerOpen(false)}
          />
          <div className={styles.drawer}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={
                  pathname?.startsWith(link.href)
                    ? styles.drawerLinkActive
                    : styles.drawerLink
                }
              >
                {link.label}
              </a>
            ))}
            <button
              className={styles.drawerLink}
              onClick={() => {
                setDrawerOpen(false);
                onSearchOpen();
              }}
              type="button"
            >
              Search
            </button>
          </div>
        </>
      )}
    </>
  );
}
