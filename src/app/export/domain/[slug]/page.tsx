import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import {
  getAllDomainSlugs,
  getDomain,
  getTopicsForDomain,
  getTopicWithContent,
  getCheatsheet,
} from "@/lib/data";
import { Callout } from "@/components/ui/Callout";
import { CheatsheetSection } from "@/components/ui/Cheatsheet";
import { ExportTrigger } from "./ExportTrigger";
import styles from "./export.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllDomainSlugs().map((slug) => ({ slug }));
}

export default async function DomainExportPage({ params }: PageProps) {
  const { slug } = await params;
  const domain = getDomain(slug);
  if (!domain) notFound();

  const topics = getTopicsForDomain(slug);
  const cheatsheet = getCheatsheet(slug);

  // Compile all topic MDX content
  const compiledTopics = await Promise.all(
    topics.map(async (topic) => {
      const result = getTopicWithContent(slug, topic.slug);
      if (!result) return null;

      const { content } = await compileMDX({
        source: result.content,
        components: { Callout },
        options: {
          mdxOptions: {
            format: "md",
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug],
          },
        },
      });

      return {
        title: topic.title,
        slug: topic.slug,
        content,
      };
    })
  );

  const validTopics = compiledTopics.filter(Boolean);

  return (
    <main className={styles.page}>
      <ExportTrigger />

      <div className={styles.coverPage}>
        <div className={styles.brand}>Ghost in the Repo</div>
        <h1 className={styles.domainTitle}>{domain.label}</h1>
        <p className={styles.domainDescription}>{domain.description}</p>
        <div className={styles.meta}>
          {topics.length} topics &middot;{" "}
          {cheatsheet ? `${cheatsheet.sections.length} cheatsheet sections` : ""} &middot;{" "}
          Complete Domain Reference
        </div>
      </div>

      {/* Table of Contents */}
      <div className={styles.toc}>
        <h2 className={styles.tocTitle}>Contents</h2>
        <ol className={styles.tocList}>
          {validTopics.map((topic, i) => (
            <li key={topic!.slug} className={styles.tocItem}>
              <a href={`#topic-${topic!.slug}`} className={styles.tocLink}>
                {i + 1}. {topic!.title}
              </a>
            </li>
          ))}
          {cheatsheet && (
            <li className={styles.tocItem}>
              <a href="#cheatsheet" className={styles.tocLink}>
                {validTopics.length + 1}. Cheatsheet Reference
              </a>
            </li>
          )}
        </ol>
      </div>

      {/* All Topics */}
      {validTopics.map((topic) => (
        <article
          key={topic!.slug}
          id={`topic-${topic!.slug}`}
          className={styles.topicSection}
        >
          <h2 className={styles.topicTitle}>{topic!.title}</h2>
          <div className={styles.prose}>{topic!.content}</div>
        </article>
      ))}

      {/* Cheatsheet */}
      {cheatsheet && (
        <section id="cheatsheet" className={styles.cheatsheetSection}>
          <h2 className={styles.topicTitle}>Cheatsheet Reference</h2>
          <div className={styles.cheatsheetGrid}>
            {cheatsheet.sections.map((section) => (
              <CheatsheetSection key={section.title} section={section} />
            ))}
          </div>
        </section>
      )}

      <div className={styles.footer}>
        <p>Generated from Ghost in the Repo — ghostintherepo.dev</p>
      </div>
    </main>
  );
}
