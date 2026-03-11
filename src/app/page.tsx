import { HeroSequence } from "@/components/animations/HeroSequence";
import { ParticleField } from "@/components/animations/ParticleField";
import { TopicCardSm } from "@/components/ui/TopicCard";
import { Button } from "@/components/ui/Button";
import { getDomainIcon } from "@/lib/domain-icons";
import { DomainGrid } from "./DomainGrid";
import styles from "./page.module.css";

const featuredDomains = [
  { slug: "fundamentals", label: "Fundamentals", count: 4 },
  { slug: "operating-systems", label: "Operating Systems", count: 6 },
  { slug: "networking", label: "Networking", count: 4 },
  { slug: "web-development", label: "Web Development", count: 4 },
  { slug: "cybersecurity", label: "Cybersecurity", count: 5 },
  { slug: "ai-ml", label: "AI & ML", count: 5 },
];

export default function Home() {
  return (
    <>
      <ParticleField />

      {/* Hero */}
      <HeroSequence />

      {/* Domain Grid */}
      <section className={styles.domainSection}>
        <h2 className={styles.sectionLabel}>Knowledge Domains</h2>
        <DomainGrid>
          {featuredDomains.map((d) => {
            const Icon = getDomainIcon(d.slug);
            return (
              <TopicCardSm
                key={d.slug}
                title={d.label}
                subtopicCount={d.count}
                icon={Icon}
                href={`/topics/${d.slug}`}
              />
            );
          })}
        </DomainGrid>
        <div className={styles.viewAll}>
          <Button variant="secondary" href="/topics">
            View All 15 Domains →
          </Button>
        </div>
      </section>

      {/* Editorial */}
      <section className={styles.editorial}>
        <div className={styles.editorialInner}>
          <blockquote className={styles.quote}>
            &ldquo;There&rsquo;s a difference between knowing how to use a tool
            and understanding{" "}
            <span className={styles.quoteAccent}>why it works.</span>&rdquo;
          </blockquote>
          <div className={styles.editorialBody}>
            <p>
              Ghost in the Repo exists because surface-level knowledge
              isn&rsquo;t enough. Every topic is broken down to its foundations
              &mdash; the kind of understanding that makes you dangerous in any
              codebase, any language, any stack.
            </p>
            <p>
              15 domains. Hundreds of subtopics. Zero fluff. This is the
              reference you wish existed when you were starting out.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
