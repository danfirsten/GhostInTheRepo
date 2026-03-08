import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  BookOpen,
} from "@phosphor-icons/react/dist/ssr";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import {
  getAllTopicParams,
  getTopicWithContent,
  getTopicsForDomain,
  getAllCodexArticles,
  getDomain,
} from "@/lib/data";
import { Tag } from "@/components/ui/Tag";
import { Callout } from "@/components/ui/Callout";
import { ContentActions } from "@/components/ui/ContentActions/ContentActions";
import { extractHeadings } from "@/lib/markdown/extract-headings";
import { ReadingProgress } from "./ReadingProgress";
import { TableOfContents } from "./TableOfContents";
import styles from "./research.module.css";

interface PageProps {
  params: Promise<{ slug: string; topic: string }>;
}

export function generateStaticParams() {
  return getAllTopicParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, topic } = await params;
  const result = getTopicWithContent(slug, topic);
  if (!result) return { title: "Not Found" };

  const domain = getDomain(slug);
  return {
    title: `${result.topic.title} — ${domain?.label ?? slug}`,
    description: `Research reference: ${result.topic.title}`,
  };
}

export default async function TopicContentPage({ params }: PageProps) {
  const { slug, topic } = await params;
  const result = getTopicWithContent(slug, topic);
  if (!result) notFound();

  const { topic: topicData, content } = result;
  const domain = getDomain(slug);

  // Extract headings for TOC before rendering
  const headings = extractHeadings(content);

  // Compute reading time (~230 wpm)
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 230));

  // Parse title/subtitle from H1
  const h1Match = content.match(/^# (.+)$/m);
  const rawTitle = h1Match ? h1Match[1] : topicData.title;
  const dashIndex = rawTitle.indexOf(" — ");
  const title = dashIndex >= 0 ? rawTitle.slice(0, dashIndex) : rawTitle;
  const subtitle = dashIndex >= 0 ? rawTitle.slice(dashIndex + 3) : "";

  const { content: mdxContent } = await compileMDX({
    source: content,
    components: { Callout },
    options: {
      mdxOptions: {
        format: "md",
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    },
  });

  // Prev/next navigation within the same domain
  const allTopics = getTopicsForDomain(slug);
  const currentIndex = allTopics.findIndex((t) => t.slug === topic);
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
  const nextTopic =
    currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

  // Related codex articles for this domain
  const relatedArticles = getAllCodexArticles()
    .filter((a) => a.domain === slug)
    .slice(0, 3);

  return (
    <>
      <ReadingProgress />
      <div className={styles.layout}>
        <main className={styles.content}>
          <a href={`/topics/${slug}`} className={styles.backLink}>
            <ArrowLeft size={14} weight="bold" />
            Back to {domain?.label ?? "Topics"}
          </a>

          <header className={styles.header}>
            <div className={styles.meta}>
              {domain && <Tag>{domain.label}</Tag>}
              <span className={styles.metaDot} />
              <span>
                <BookOpen size={14} weight="regular" />{" "}
                {topicData.subtopics.length} sections
              </span>
              <span className={styles.metaDot} />
              <span>
                <Clock size={14} weight="regular" /> {readingTime} min read
              </span>
            </div>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            <hr className={styles.hr} />
          </header>

          <div className={styles.prose}>{mdxContent}</div>

          <ContentActions
            contentType="topic"
            contentSlug={topic}
            domainSlug={slug}
          />

          {/* Related Codex Articles */}
          {relatedArticles.length > 0 && (
            <section className={styles.related}>
              <h2 className={styles.relatedHeading}>Related Codex Articles</h2>
              <div className={styles.relatedList}>
                {relatedArticles.map((article) => (
                  <a
                    key={article.slug}
                    href={`/codex/${article.slug}`}
                    className={styles.relatedCard}
                  >
                    <span className={styles.relatedCardTitle}>
                      {article.title}
                    </span>
                    <span className={styles.relatedCardMeta}>
                      {article.readingTime} min read
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Prev / Next Navigation */}
          <nav className={styles.prevNext}>
            {prevTopic ? (
              <a
                href={`/topics/${slug}/${prevTopic.slug}`}
                className={styles.prevNextLink}
              >
                <ArrowLeft size={14} weight="bold" />
                <div>
                  <span className={styles.prevNextLabel}>Previous</span>
                  <span className={styles.prevNextTitle}>
                    {prevTopic.title}
                  </span>
                </div>
              </a>
            ) : (
              <span />
            )}
            {nextTopic ? (
              <a
                href={`/topics/${slug}/${nextTopic.slug}`}
                className={`${styles.prevNextLink} ${styles.prevNextRight}`}
              >
                <div>
                  <span className={styles.prevNextLabel}>Next</span>
                  <span className={styles.prevNextTitle}>
                    {nextTopic.title}
                  </span>
                </div>
                <ArrowRight size={14} weight="bold" />
              </a>
            ) : (
              <span />
            )}
          </nav>
        </main>

        <TableOfContents headings={headings} />
      </div>
    </>
  );
}
