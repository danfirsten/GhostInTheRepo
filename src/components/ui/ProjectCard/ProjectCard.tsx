"use client";

import { useState } from "react";
import type { Project } from "@/types/content";
import {
  Clock,
  ArrowSquareOut,
  CaretDown,
  Copy,
  Check,
  Lightning,
  BookOpen,
} from "@phosphor-icons/react";
import { getDomainIconClient } from "@/lib/domain-icons-client";
import styles from "./ProjectCard.module.css";

const DIFFICULTY_CLASS: Record<string, string> = {
  beginner: styles.diffBeginner,
  intermediate: styles.diffIntermediate,
  advanced: styles.diffAdvanced,
};

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const DomainIcon = getDomainIconClient(project.domainSlug);

  function copyPrompt() {
    navigator.clipboard.writeText(project.llmPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.domainIcon}>
            <DomainIcon size={18} weight="duotone" />
          </span>
          <span className={`${styles.difficulty} ${DIFFICULTY_CLASS[project.difficulty]}`}>
            {project.difficulty}
          </span>
          <span className={styles.time}>
            <Clock size={14} weight="regular" />
            {project.estimatedHours}h
          </span>
        </div>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.description}>{project.description}</p>
      </div>

      {/* Skills */}
      <div className={styles.skills}>
        {project.skills.map((skill) => (
          <span key={skill} className={styles.skillTag}>
            <Lightning size={10} weight="fill" />
            {skill}
          </span>
        ))}
      </div>

      {/* Prerequisites */}
      {project.prerequisites.length > 0 && (
        <div className={styles.prereqs}>
          <div className={styles.prereqLabel}>
            <BookOpen size={14} weight="regular" />
            Prerequisite reading
          </div>
          <div className={styles.prereqLinks}>
            {project.prerequisites.map((p) => (
              <a
                key={p.topicSlug}
                href={`/topics/${p.domainSlug}/${p.topicSlug}`}
                className={styles.prereqLink}
              >
                {p.title}
                <ArrowSquareOut size={12} weight="regular" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Expand for LLM prompt */}
      <button
        type="button"
        className={`${styles.expandBtn} ${expanded ? styles.expandBtnOpen : ""}`}
        onClick={() => setExpanded(!expanded)}
      >
        <span>LLM Project Prompt</span>
        <CaretDown
          size={14}
          weight="bold"
          className={expanded ? styles.chevronOpen : styles.chevron}
        />
      </button>

      {expanded && (
        <div className={styles.promptSection}>
          <div className={styles.promptHeader}>
            <span className={styles.promptLabel}>
              Copy this prompt into any LLM to generate a full project document
            </span>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={copyPrompt}
            >
              {copied ? (
                <>
                  <Check size={14} weight="bold" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} weight="regular" />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className={styles.promptText}>{project.llmPrompt}</pre>
        </div>
      )}

      {/* Tags */}
      <div className={styles.tags}>
        {project.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
