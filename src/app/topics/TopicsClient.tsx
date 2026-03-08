"use client";

import { useState } from "react";
import type { Domain, Topic } from "@/types/content";
import type { Icon } from "@phosphor-icons/react";
import { TopicCardSm, TopicCardMd, TopicCardLg } from "@/components/ui/TopicCard";
import { getDomainIcon } from "@/lib/domain-icons";
import styles from "./topics.module.css";

interface TopicsClientProps {
  domains: Domain[];
  topicsByDomain: Record<string, Topic[]>;
}

const FEATURED_SLUGS = new Set(["fundamentals", "networking", "web-development"]);

export function TopicsClient({ domains, topicsByDomain }: TopicsClientProps) {
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  const filteredDomains = activeDomain
    ? domains.filter((d) => d.slug === activeDomain)
    : domains;

  return (
    <>
      {/* Mobile pill filters */}
      <div className={styles.pillFilters}>
        <button
          className={activeDomain === null ? styles.pillActive : styles.pill}
          onClick={() => setActiveDomain(null)}
          type="button"
        >
          All
        </button>
        {domains.map((d) => (
          <button
            key={d.slug}
            className={activeDomain === d.slug ? styles.pillActive : styles.pill}
            onClick={() => setActiveDomain(d.slug)}
            type="button"
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Domains</div>
          <button
            className={activeDomain === null ? styles.sidebarItemActive : styles.sidebarItem}
            onClick={() => setActiveDomain(null)}
            type="button"
          >
            All Domains
          </button>
          {domains.map((d) => {
            const Icon: Icon = getDomainIcon(d.slug);
            return (
              <button
                key={d.slug}
                className={
                  activeDomain === d.slug
                    ? styles.sidebarItemActive
                    : styles.sidebarItem
                }
                onClick={() => setActiveDomain(d.slug)}
                type="button"
              >
                <span className={styles.sidebarIcon}>
                  <Icon size={20} weight="duotone" />
                </span>
                {d.label}
              </button>
            );
          })}
        </aside>

        {/* Main Grid */}
        <div className={styles.main}>
          <h1 className={styles.pageTitle}>Topics</h1>
          <p className={styles.pageSubtitle}>
            14 domains. Hundreds of subtopics. Pick a domain or browse them all.
          </p>
          <div className={styles.grid}>
            {filteredDomains.map((domain) => {
              const Icon: Icon = getDomainIcon(domain.slug);
              const topics = topicsByDomain[domain.slug] ?? [];
              const totalSubtopics = topics.reduce(
                (sum, t) => sum + t.subtopics.length,
                0,
              );
              const subtopicNames = topics.map((t) => t.title);
              const isFeatured = FEATURED_SLUGS.has(domain.slug);

              if (isFeatured) {
                return (
                  <div key={domain.slug} className={styles.featured}>
                    <TopicCardLg
                      title={domain.label}
                      description={domain.description}
                      subtopicCount={totalSubtopics}
                      icon={Icon}
                      href={`/topics/${domain.slug}`}
                      subtopics={subtopicNames.slice(0, 4)}
                      domainSlug={domain.slug}
                      totalTopics={topics.length}
                    />
                  </div>
                );
              }

              if (topics.length > 2) {
                return (
                  <TopicCardMd
                    key={domain.slug}
                    title={domain.label}
                    subtopicCount={totalSubtopics}
                    icon={Icon}
                    href={`/topics/${domain.slug}`}
                    subtopics={subtopicNames.slice(0, 3)}
                    domainSlug={domain.slug}
                    totalTopics={topics.length}
                  />
                );
              }

              return (
                <TopicCardSm
                  key={domain.slug}
                  title={domain.label}
                  subtopicCount={totalSubtopics}
                  icon={Icon}
                  href={`/topics/${domain.slug}`}
                  domainSlug={domain.slug}
                  totalTopics={topics.length}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
