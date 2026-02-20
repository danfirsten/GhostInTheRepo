"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const easeEnter: [number, number, number, number] = [0.0, 0.0, 0.2, 1];
const easeExit: [number, number, number, number] = [0.4, 0.0, 1.0, 1];

const variants = {
  enter: {
    opacity: 0,
    y: 12,
    filter: "blur(4px)",
    transition: { duration: 0.35, ease: easeEnter },
  },
  center: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: easeEnter },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(0px)",
    transition: { duration: 0.2, ease: easeExit },
  },
};

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
