export interface TocHeading {
  depth: 2 | 3;
  text: string;
  slug: string;
}

/**
 * Extract H2 and H3 headings from raw markdown for building a table of contents.
 * Produces slugs matching rehype-slug's algorithm (lowercase, hyphens).
 */
export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    // Skip code fences
    if (line.startsWith("```")) continue;

    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      headings.push({
        depth: 2,
        text: h2Match[1].trim(),
        slug: slugify(h2Match[1].trim()),
      });
      continue;
    }

    const h3Match = line.match(/^### (.+)$/);
    if (h3Match) {
      headings.push({
        depth: 3,
        text: h3Match[1].trim(),
        slug: slugify(h3Match[1].trim()),
      });
    }
  }

  return headings;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
