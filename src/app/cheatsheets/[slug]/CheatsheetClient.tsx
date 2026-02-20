"use client";

import { useState, useCallback } from "react";
import { Printer, CopySimple } from "@phosphor-icons/react";
import type { Cheatsheet } from "@/types/content";
import styles from "./cheatsheet.module.css";

interface CheatsheetActionsProps {
  cheatsheet: Cheatsheet;
}

export function CheatsheetActions({ cheatsheet }: CheatsheetActionsProps) {
  const [copied, setCopied] = useState(false);

  const handlePrint = useCallback(() => {
    const html = document.documentElement;
    if (html.dataset.print === "true") {
      delete html.dataset.print;
    } else {
      html.dataset.print = "true";
    }
  }, []);

  const handleCopy = useCallback(async () => {
    const text = cheatsheet.sections
      .map((section) => {
        const header = `--- ${section.title} ---`;
        const entries = section.entries
          .map((e) => `${e.command}  —  ${e.description}`)
          .join("\n");
        return `${header}\n${entries}`;
      })
      .join("\n\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [cheatsheet]);

  return (
    <div className={styles.actions}>
      <button
        className={styles.actionBtn}
        onClick={handlePrint}
        type="button"
      >
        <Printer size={16} />
        Print
      </button>
      <button
        className={copied ? styles.actionBtnSuccess : styles.actionBtn}
        onClick={handleCopy}
        type="button"
      >
        <CopySimple size={16} />
        {copied ? "Copied!" : "Copy All"}
      </button>
    </div>
  );
}
