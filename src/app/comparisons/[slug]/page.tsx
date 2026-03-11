import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Clock,
  ArrowsLeftRight,
} from "@phosphor-icons/react/dist/ssr";
import { compileMDX } from "next-mdx-remote/rsc";
import {
  getAllComparisonSlugs,
  getComparison,
  getAllComparisons,
  getDomain,
} from "@/lib/data";
import { Tag, DifficultyBadge } from "@/components/ui/Tag";
import { Callout } from "@/components/ui/Callout";
import { ContentActions } from "@/components/ui/ContentActions/ContentActions";
import { SignInCallout } from "@/components/ui/SignInCallout/SignInCallout";
import { ReadingProgress } from "./ReadingProgress";
import { RelatedComparisons } from "./RelatedComparisons";
import styles from "./comparison.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllComparisonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = getComparison(slug);
  if (!result) return { title: "Comparison Not Found" };

  return {
    title: `${result.comparison.sideA} vs ${result.comparison.sideB}`,
    description: result.comparison.summary,
    keywords: [
      `${result.comparison.sideA} vs ${result.comparison.sideB}`,
      result.comparison.sideA,
      result.comparison.sideB,
      "comparison",
      "software engineering",
    ],
  };
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const result = getComparison(slug);
  if (!result) notFound();

  const { comparison, content } = result;
  const domains = comparison.domains
    .map((d) => getDomain(d))
    .filter(Boolean);

  const { content: mdxContent } = await compileMDX({
    source: content,
    components: {
      Callout,
    },
  });

  // Get related comparisons (same domain, excluding current)
  const allComparisons = getAllComparisons();
  const related = allComparisons
    .filter(
      (c) =>
        c.slug !== slug &&
        c.domains.some((d) => comparison.domains.includes(d)),
    )
    .slice(0, 3);

  return (
    <>
      <ReadingProgress />
      <main className={styles.page}>
        <Link href="/comparisons" className={styles.backLink}>
          <ArrowLeft size={16} weight="bold" />
          Back to Comparisons
        </Link>

        <header className={styles.header}>
          <div className={styles.meta}>
            <DifficultyBadge level={comparison.difficulty} />
            {domains.map(
              (domain) =>
                domain && <Tag key={domain.slug}>{domain.label}</Tag>,
            )}
            <span className={styles.metaDot} />
            <span className={styles.metaItem}>
              <Clock size={14} weight="regular" /> {comparison.readingTime} min
              read
            </span>
          </div>

          <div className={styles.vsHeader}>
            <span className={styles.vsLabel}>{comparison.sideA}</span>
            <ArrowsLeftRight
              size={24}
              weight="bold"
              className={styles.vsIcon}
            />
            <span className={styles.vsLabel}>{comparison.sideB}</span>
          </div>

          <h1 className={styles.title}>{comparison.title}</h1>
          {comparison.summary && (
            <p className={styles.summary}>{comparison.summary}</p>
          )}
          <hr className={styles.hr} />
        </header>

        <div className={styles.content}>{mdxContent}</div>

        <ContentActions
          contentType="comparison"
          contentSlug={slug}
          domainSlug={comparison.domains[0]}
        />
        <SignInCallout />

        {related.length > 0 && (
          <RelatedComparisons comparisons={related} />
        )}
      </main>
    </>
  );
}
