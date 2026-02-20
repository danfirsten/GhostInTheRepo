"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface HeroPageContextValue {
  isHeroPage: boolean;
  setIsHeroPage: (value: boolean) => void;
}

const HeroPageContext = createContext<HeroPageContextValue>({
  isHeroPage: false,
  setIsHeroPage: () => {},
});

export function HeroPageProvider({ children }: { children: ReactNode }) {
  const [isHeroPage, setIsHeroPage] = useState(false);
  return (
    <HeroPageContext.Provider value={{ isHeroPage, setIsHeroPage }}>
      {children}
    </HeroPageContext.Provider>
  );
}

export function useHeroPage() {
  return useContext(HeroPageContext);
}
