"use client";

import { useState, useCallback, useEffect } from "react";
import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";
import { SearchOverlay } from "../Search/Search";
import { HeroPageProvider } from "@/lib/hooks/useHeroPage";
import styles from "./PageShell.module.css";

export function PageShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <HeroPageProvider>
      <div className={styles.shell}>
        <Navbar onSearchOpen={openSearch} />
        <main className={styles.main}>{children}</main>
        <Footer />
        <SearchOverlay open={searchOpen} onClose={closeSearch} />
      </div>
    </HeroPageProvider>
  );
}
