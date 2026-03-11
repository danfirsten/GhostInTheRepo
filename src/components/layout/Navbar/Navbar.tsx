"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MagnifyingGlass, List, X, SignIn } from "@phosphor-icons/react";
import { GhostLogo } from "@/components/ui/GhostLogo";
import { UserMenu } from "@/components/auth/UserMenu/UserMenu";
import { useHeroPage } from "@/lib/hooks/useHeroPage";
import styles from "./Navbar.module.css";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/topics", label: "Topics" },
  { href: "/comparisons", label: "Comparisons" },
  { href: "/paths", label: "Paths" },
  { href: "/projects", label: "Projects" },
  { href: "/codex", label: "Codex" },
];

interface NavbarProps {
  onSearchOpen: () => void;
  user?: User | null;
}

export function Navbar({ onSearchOpen, user }: NavbarProps) {
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

        {/* Right: Search + Auth + Mobile Toggle */}
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

          {/* Auth: User menu or sign-in link */}
          {user ? (
            <UserMenu user={user} />
          ) : (
            <a href="/auth/login" className={styles.signInBtn}>
              <SignIn size={18} weight="regular" />
              <span className={styles.signInText}>Sign In</span>
            </a>
          )}

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
            {!user && (
              <a href="/auth/login" className={styles.drawerLink}>
                Sign In
              </a>
            )}
            {user && (
              <>
                <a href="/profile" className={styles.drawerLink}>
                  Profile
                </a>
                <a href="/profile/dashboard" className={styles.drawerLink}>
                  Dashboard
                </a>
                <a href="/profile/settings" className={styles.drawerLink}>
                  Settings
                </a>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
