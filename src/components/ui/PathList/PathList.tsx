"use client";

import { useState } from "react";
import { CaretDown, ArrowDown } from "@phosphor-icons/react";
import type { LearningPath } from "@/types/content";
import { getDomainIcon } from "@/lib/domain-icons";
import styles from "./PathList.module.css";

interface PathListProps {
  paths: LearningPath[];
}

function PathCard({ path }: { path: LearningPath }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.card}>
      <div
        className={styles.cardHeader}
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
        }}
      >
        <div className={styles.cardHeaderLeft}>
          <div className={styles.cardName}>{path.name}</div>
          <div className={styles.cardDescription}>{path.description}</div>
        </div>
        <span
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
        >
          <CaretDown size={18} weight="bold" />
        </span>
      </div>

      <div className={`${styles.cardBody} ${open ? styles.cardBodyOpen : ""}`}>
        <div className={styles.cardBodyInner}>
          <div className={styles.sequence}>
            {path.nodes.map((node, i) => {
              const Icon = getDomainIcon(node.domainSlug);
              const edge = i < path.edges.length ? path.edges[i] : null;

              return (
                <div key={node.domainSlug}>
                  <div className={styles.nodeRow}>
                    <span className={styles.nodeIcon}>
                      <Icon size={20} weight="duotone" />
                    </span>
                    <a
                      href={`/topics/${node.domainSlug}`}
                      className={styles.nodeLink}
                    >
                      {node.label}
                    </a>
                  </div>
                  {edge && (
                    <div className={styles.arrow}>
                      <ArrowDown size={14} />
                      <span className={styles.edgeLabel}>
                        {edge.type === "prerequisite"
                          ? "prerequisite"
                          : "related"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PathList({ paths }: PathListProps) {
  return (
    <div>
      {paths.map((path) => (
        <PathCard key={path.id} path={path} />
      ))}
    </div>
  );
}
