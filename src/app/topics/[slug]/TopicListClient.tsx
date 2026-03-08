"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { getDomainIconClient } from "@/lib/domain-icons-client";
import {
  CompletionProvider,
  TopicCheckmark,
} from "@/components/ui/TopicCompletionList/TopicCompletionList";
import styles from "./topic.module.css";

interface TopicEntry {
  slug: string;
  title: string;
  subtopics: { id: string; slug: string; title: string }[];
}

interface TopicListClientProps {
  domainSlug: string;
  topics: TopicEntry[];
}

export function TopicListClient({
  domainSlug,
  topics,
}: TopicListClientProps) {
  const Icon = getDomainIconClient(domainSlug);

  return (
    <CompletionProvider domainSlug={domainSlug}>
      <div className={styles.subtopicList}>
        {topics.map((topic) => (
          <div key={topic.slug} id={topic.slug}>
            <a
              href={`/topics/${domainSlug}/${topic.slug}`}
              className={styles.topicLink}
            >
              <Icon size={18} weight="duotone" />
              <span className={styles.subtopicTitle}>{topic.title}</span>
              <TopicCheckmark topicSlug={topic.slug} />
              <ArrowRight
                size={14}
                weight="bold"
                className={styles.topicArrow}
              />
            </a>
            {topic.subtopics.length > 0 && (
              <div style={{ paddingLeft: "var(--space-10)" }}>
                {topic.subtopics.map((sub) => (
                  <a
                    key={sub.id}
                    href={`/topics/${domainSlug}/${topic.slug}#${sub.slug}`}
                    className={styles.subLink}
                  >
                    {sub.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </CompletionProvider>
  );
}
