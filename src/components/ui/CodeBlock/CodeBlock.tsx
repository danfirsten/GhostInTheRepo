"use client";

import { useState, useCallback } from "react";
import styles from "./CodeBlock.module.css";

interface CodeBlockProps {
  code: string;
  lang?: string;
  highlightedHtml?: string;
}

export function CodeBlock({ code, lang = "text", highlightedHtml }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [wrapped, setWrapped] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className={styles.codeBlock}>
      <div className={styles.header}>
        <span className={styles.lang}>{lang}</span>
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${copied ? styles.copied : ""}`}
            onClick={handleCopy}
            type="button"
          >
            {copied ? "✓ copied" : "copy"}
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => setWrapped(!wrapped)}
            type="button"
          >
            {wrapped ? "no-wrap" : "wrap"}
          </button>
        </div>
      </div>
      <div
        className={styles.body}
        style={wrapped ? { whiteSpace: "pre-wrap", wordBreak: "break-all" } : undefined}
      >
        {highlightedHtml ? (
          <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        ) : (
          <pre>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
