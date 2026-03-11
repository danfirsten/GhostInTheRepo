import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Comparison } from "@/types/content";

const COMPARISONS_DIR = path.join(process.cwd(), "src/content/comparisons");

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 230));
}

function parseComparison(slug: string, raw: string): Comparison {
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    sideA: data.sideA ?? "",
    sideB: data.sideB ?? "",
    domains: Array.isArray(data.domains) ? data.domains : [data.domains ?? ""],
    difficulty: data.difficulty ?? "intermediate",
    readingTime: estimateReadingTime(content),
    publishedAt: data.publishedAt ?? "",
    summary: data.summary ?? "",
    mdxPath: path.join(COMPARISONS_DIR, `${slug}.mdx`),
  };
}

export function getAllComparisons(): Comparison[] {
  if (!fs.existsSync(COMPARISONS_DIR)) return [];

  const files = fs
    .readdirSync(COMPARISONS_DIR)
    .filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(COMPARISONS_DIR, file), "utf-8");
      return parseComparison(slug, raw);
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}

export function getComparison(
  slug: string,
): { comparison: Comparison; content: string } | null {
  const filePath = path.join(COMPARISONS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(raw);
  const comparison = parseComparison(slug, raw);

  return { comparison, content };
}

export function getAllComparisonSlugs(): string[] {
  return getAllComparisons().map((c) => c.slug);
}
