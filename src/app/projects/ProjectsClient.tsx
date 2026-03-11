"use client";

import { useState, useMemo } from "react";
import type { Project, Domain } from "@/types/content";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { getDomainIconClient } from "@/lib/domain-icons-client";
import styles from "./projects.module.css";

interface ProjectsClientProps {
  projects: Project[];
  domains: Domain[];
}

const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"] as const;

export function ProjectsClient({ projects, domains }: ProjectsClientProps) {
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<string>("all");

  // Domains that have projects
  const domainsWithProjects = useMemo(() => {
    const slugs = new Set(projects.map((p) => p.domainSlug));
    return domains.filter((d) => slugs.has(d.slug));
  }, [projects, domains]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (activeDomain && p.domainSlug !== activeDomain) return false;
      if (activeDifficulty !== "all" && p.difficulty !== activeDifficulty)
        return false;
      return true;
    });
  }, [projects, activeDomain, activeDifficulty]);

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Projects</h1>
        <p className={styles.subtitle}>
          {projects.length} hands-on projects across {domainsWithProjects.length}{" "}
          domains. Each comes with prerequisites, skills, and a prompt to
          generate a full project brief.
        </p>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Domain</div>
          <div className={styles.filterPills}>
            <button
              type="button"
              className={
                activeDomain === null
                  ? styles.filterPillActive
                  : styles.filterPill
              }
              onClick={() => setActiveDomain(null)}
            >
              All
            </button>
            {domainsWithProjects.map((d) => {
              const Icon = getDomainIconClient(d.slug);
              return (
                <button
                  key={d.slug}
                  type="button"
                  className={
                    activeDomain === d.slug
                      ? styles.filterPillActive
                      : styles.filterPill
                  }
                  onClick={() => setActiveDomain(d.slug)}
                >
                  <Icon size={14} weight="duotone" />
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Difficulty</div>
          <div className={styles.filterPills}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                className={
                  activeDifficulty === d
                    ? styles.filterPillActive
                    : styles.filterPill
                }
                onClick={() => setActiveDifficulty(d)}
              >
                {d === "all" ? "All" : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={styles.resultCount}>
        {filtered.length} project{filtered.length !== 1 ? "s" : ""}
      </div>

      <div className={styles.grid}>
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            No projects match your filters. Try broadening your selection.
          </p>
        </div>
      )}
    </>
  );
}
