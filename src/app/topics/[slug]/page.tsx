import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import {
  getAllDomainSlugs,
  getDomain,
  getTopicsForDomain,
  getCheatsheet,
  getAllLearningPaths,
} from "@/lib/data";
import { getDomainIcon } from "@/lib/domain-icons";
import { CheatsheetSection } from "@/components/ui/Cheatsheet";
import styles from "./topic.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllDomainSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const domain = getDomain(slug);
  if (!domain) return { title: "Not Found" };
  return {
    title: domain.label,
    description: domain.description,
  };
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const domain = getDomain(slug);
  if (!domain) notFound();

  const topics = getTopicsForDomain(slug);
  const cheatsheet = getCheatsheet(slug);
  const paths = getAllLearningPaths().filter((p) =>
    p.nodes.some((n) => n.domainSlug === slug),
  );

  const totalSubtopics = topics.reduce(
    (sum, t) => sum + t.subtopics.length,
    0,
  );

  // Related domains from learning paths
  const relatedSlugs = new Set<string>();
  for (const path of paths) {
    for (const edge of path.edges) {
      if (edge.from === slug) relatedSlugs.add(edge.to);
      if (edge.to === slug) relatedSlugs.add(edge.from);
    }
  }
  relatedSlugs.delete(slug);

  const Icon = getDomainIcon(slug);

  // TOC sections = topic titles
  const tocSections = topics.map((t) => ({
    id: t.slug,
    title: t.title,
  }));

  return (
    <div className={styles.layout}>
      {/* Content Column */}
      <div className={styles.content}>
        <a href="/topics" className={styles.breadcrumb}>
          <ArrowLeft size={14} weight="bold" />
          Back to Topics
        </a>

        <div className={styles.categoryLabel}>{domain.label}</div>
        <h1 className={styles.title}>{domain.label}</h1>

        <div className={styles.statsBar}>
          <span>{topics.length} topics</span>
          <span className={styles.statDot} />
          <span>{totalSubtopics} subtopics</span>
          {cheatsheet && (
            <>
              <span className={styles.statDot} />
              <span>{cheatsheet.sections.length} cheatsheet sections</span>
            </>
          )}
          {paths.length > 0 && (
            <>
              <span className={styles.statDot} />
              <span>
                {paths.length} learning path{paths.length > 1 ? "s" : ""}
              </span>
            </>
          )}
        </div>

        <p className={styles.overview}>{domain.description}</p>

        {/* Cheatsheet Preview */}
        {cheatsheet && cheatsheet.sections.length > 0 && (
          <>
            <div className={styles.sectionLabel}>Cheatsheet Preview</div>
            <div className={styles.cheatsheetPreview}>
              {cheatsheet.sections.slice(0, 2).map((section) => (
                <CheatsheetSection key={section.title} section={section} />
              ))}
            </div>
            <a
              href={`/cheatsheets/${slug}`}
              className={styles.viewLink}
            >
              View Full Cheatsheet →
            </a>
          </>
        )}

        {/* Topics & Subtopics */}
        <div className={styles.sectionLabel}>Topics</div>
        <div className={styles.subtopicList}>
          {topics.map((topic) => (
            <div key={topic.slug} id={topic.slug}>
              <a
                href={`/topics/${slug}/${topic.slug}`}
                className={styles.topicLink}
              >
                <Icon size={18} weight="duotone" />
                <span className={styles.subtopicTitle}>{topic.title}</span>
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
                      href={`/topics/${slug}/${topic.slug}#${sub.slug}`}
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
      </div>

      {/* TOC Column */}
      <aside className={styles.toc}>
        <div className={styles.tocTitle}>On This Page</div>
        <div className={styles.tocList}>
          {tocSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={styles.tocItem}
            >
              {section.title}
            </a>
          ))}
        </div>

        {relatedSlugs.size > 0 && (
          <>
            <div className={styles.relatedTitle}>Related Topics</div>
            {[...relatedSlugs].map((relSlug) => {
              const relDomain = getDomain(relSlug);
              if (!relDomain) return null;
              const RelIcon = getDomainIcon(relSlug);
              return (
                <a
                  key={relSlug}
                  href={`/topics/${relSlug}`}
                  className={styles.relatedItem}
                >
                  <span className={styles.relatedIcon}>
                    <RelIcon size={16} weight="duotone" />
                  </span>
                  {relDomain.label}
                </a>
              );
            })}
          </>
        )}
      </aside>
    </div>
  );
}
