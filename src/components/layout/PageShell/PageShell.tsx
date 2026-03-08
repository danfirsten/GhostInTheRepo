"use client";

import { useState, useCallback, useEffect } from "react";
import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";
import { SearchOverlay } from "../Search/Search";
import { HeroPageProvider } from "@/lib/hooks/useHeroPage";
import { useAuth } from "@/lib/hooks/useAuth";
import { DailyVisitTracker } from "@/components/ui/DailyVisitTracker/DailyVisitTracker";
import type { SearchItem } from "@/lib/data/search";
import styles from "./PageShell.module.css";

interface PageShellProps {
  children: React.ReactNode;
  searchItems?: SearchItem[];
}

export function PageShell({ children, searchItems }: PageShellProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();

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
        <Navbar onSearchOpen={openSearch} user={user} />
        <DailyVisitTracker />
        <main className={styles.main}>{children}</main>
        <Footer />
        <SearchOverlay
          open={searchOpen}
          onClose={closeSearch}
          searchItems={searchItems}
        />
      </div>
    </HeroPageProvider>
  );
}
