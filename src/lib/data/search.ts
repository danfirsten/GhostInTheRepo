import type { Domain, Comparison } from "@/types/content";

export interface SearchItem {
  title: string;
  description: string;
  path: string;
  href: string;
  type: "domain" | "topic" | "subtopic" | "cheatsheet" | "comparison";
  domainSlug: string;
}

/**
 * Build search items from domain + topic data.
 * Runs server-side at build time.
 */
export function buildSearchItems(
  domains: Domain[],
  topicsByDomain: Record<string, { slug: string; title: string; subtopics: { slug: string; title: string }[] }[]>,
): SearchItem[] {
  const items: SearchItem[] = [];

  for (const domain of domains) {
    items.push({
      title: domain.label,
      description: domain.description,
      path: domain.label,
      href: `/topics/${domain.slug}`,
      type: "domain",
      domainSlug: domain.slug,
    });

    const topics = topicsByDomain[domain.slug] ?? [];
    for (const topic of topics) {
      items.push({
        title: topic.title,
        description: "",
        path: `${domain.label} → ${topic.title}`,
        href: `/topics/${domain.slug}/${topic.slug}`,
        type: "topic",
        domainSlug: domain.slug,
      });

      for (const sub of topic.subtopics) {
        items.push({
          title: sub.title,
          description: "",
          path: `${domain.label} → ${topic.title} → ${sub.title}`,
          href: `/topics/${domain.slug}/${topic.slug}#${sub.slug}`,
          type: "subtopic",
          domainSlug: domain.slug,
        });
      }
    }
  }

  return items;
}

/**
 * Add comparison items to the search index.
 */
export function addComparisonSearchItems(
  items: SearchItem[],
  comparisons: Comparison[],
): SearchItem[] {
  for (const c of comparisons) {
    items.push({
      title: c.title,
      description: c.summary,
      path: `Comparisons → ${c.title}`,
      href: `/comparisons/${c.slug}`,
      type: "comparison",
      domainSlug: c.domains[0] ?? "",
    });
  }
  return items;
}
