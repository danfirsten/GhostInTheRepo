import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getAllDomainSlugs, getDomain, getCheatsheet } from "@/lib/data";
import { CheatsheetSection } from "@/components/ui/Cheatsheet";
import { ContentActions } from "@/components/ui/ContentActions/ContentActions";
import { CheatsheetActions } from "./CheatsheetClient";
import styles from "./cheatsheet.module.css";

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
    title: `${domain.label} Cheatsheet`,
    description: `Quick-reference cheatsheet for ${domain.label} — commands, syntax, and key concepts.`,
  };
}

export default async function CheatsheetPage({ params }: PageProps) {
  const { slug } = await params;
  const domain = getDomain(slug);
  const cheatsheet = getCheatsheet(slug);

  if (!domain || !cheatsheet) notFound();

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <a href="/cheatsheets" className={styles.breadcrumb}>
            <ArrowLeft size={14} weight="bold" />
            Back
          </a>
          <h1 className={styles.domainName}>{domain.label}</h1>
          <div className={styles.cheatsheetLabel}>Cheatsheet</div>
        </div>
        <CheatsheetActions cheatsheet={cheatsheet} />
      </div>

      <div className={styles.sectionGrid}>
        {cheatsheet.sections.map((section) => (
          <CheatsheetSection key={section.title} section={section} />
        ))}
      </div>

      <ContentActions
        contentType="cheatsheet"
        contentSlug={slug}
        domainSlug={slug}
        completeLabel="Mark as Reviewed"
      />
    </main>
  );
}
