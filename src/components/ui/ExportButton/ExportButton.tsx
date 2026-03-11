"use client";

import { useCallback } from "react";
import { FilePdf, Files } from "@phosphor-icons/react";
import styles from "./ExportButton.module.css";

interface ExportButtonProps {
  /** What kind of content is being exported */
  variant: "topic" | "cheatsheet" | "domain";
  /** Domain slug (for domain bundle link) */
  domainSlug?: string;
  /** Domain label (for domain bundle tooltip) */
  domainLabel?: string;
}

export function ExportButton({
  variant,
  domainSlug,
  domainLabel,
}: ExportButtonProps) {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className={styles.exportGroup} data-export-hide>
      <button
        type="button"
        className={styles.exportBtn}
        onClick={handlePrint}
        title="Save this page as PDF"
      >
        <FilePdf size={16} weight="duotone" />
        <span className={styles.exportLabel}>Save as PDF</span>
      </button>

      {variant === "topic" && domainSlug && (
        <a
          href={`/export/domain/${domainSlug}`}
          className={styles.exportBtn}
          title={`Download all ${domainLabel ?? "domain"} topics as one PDF`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Files size={16} weight="duotone" />
          <span className={styles.exportLabel}>Full Domain PDF</span>
        </a>
      )}

      {variant === "domain" && domainSlug && (
        <a
          href={`/export/domain/${domainSlug}`}
          className={styles.exportBtn}
          title={`Download all topics + cheatsheet as one PDF`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Files size={16} weight="duotone" />
          <span className={styles.exportLabel}>Download All as PDF</span>
        </a>
      )}
    </div>
  );
}
