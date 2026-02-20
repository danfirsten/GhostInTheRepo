import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Clock } from "@phosphor-icons/react/dist/ssr";
import { compileMDX } from "next-mdx-remote/rsc";
import { getAllCodexSlugs, getCodexArticle, getDomain } from "@/lib/data";
import { Tag, DifficultyBadge } from "@/components/ui/Tag";
import { Callout } from "@/components/ui/Callout";
import { ReadingProgress } from "./ReadingProgress";
import styles from "./article.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllCodexSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = getCodexArticle(slug);
  if (!result) return { title: "Article Not Found" };

  return {
    title: result.article.title,
    description: result.article.summary,
  };
}

export default async function CodexArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const result = getCodexArticle(slug);
  if (!result) notFound();

  const { article, content } = result;
  const domain = getDomain(article.domain);

  const { content: mdxContent } = await compileMDX({
    source: content,
    components: {
      Callout,
    },
  });

  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );

  return (
    <>
      <ReadingProgress />
      <main className={styles.page}>
        <Link href="/codex" className={styles.backLink}>
          <ArrowLeft size={16} weight="bold" />
          Back to Codex
        </Link>

        <header className={styles.header}>
          <div className={styles.meta}>
            <DifficultyBadge level={article.difficulty} />
            {domain && <Tag>{domain.label}</Tag>}
            <span className={styles.metaDot} />
            <span>
              <Clock size={14} weight="regular" /> {article.readingTime} min
              read
            </span>
            <span className={styles.metaDot} />
            <span>{formattedDate}</span>
          </div>
          <h1 className={styles.title}>{article.title}</h1>
          <hr className={styles.hr} />
        </header>

        <div className={styles.content}>{mdxContent}</div>
      </main>
    </>
  );
}
