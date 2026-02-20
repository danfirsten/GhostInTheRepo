import fs from "fs";
import path from "path";
import type { Topic, Subtopic } from "@/types/content";
import { dirToSlug } from "./domains";

const RESEARCH_DIR = path.join(process.cwd(), "docs", "research");

/**
 * Parse a research markdown file to extract the title (from H1)
 * and subtopics (from H2 headings). No frontmatter — all metadata
 * is derived from the file path and content.
 */
function parseMarkdownFile(filePath: string): {
  title: string;
  subtitle: string;
  subtopics: string[];
} {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Title from first H1 line
  let rawTitle = "";
  for (const line of lines) {
    if (line.startsWith("# ")) {
      rawTitle = line.replace(/^#\s+/, "");
      break;
    }
  }

  // Split "Title — Subtitle" on em-dash
  const dashIndex = rawTitle.indexOf(" — ");
  const title = dashIndex >= 0 ? rawTitle.slice(0, dashIndex) : rawTitle;
  const subtitle = dashIndex >= 0 ? rawTitle.slice(dashIndex + 3) : "";

  // Subtopics from H2 headings
  const subtopics: string[] = [];
  for (const line of lines) {
    if (line.startsWith("## ")) {
      subtopics.push(line.replace(/^##\s+/, ""));
    }
  }

  return { title, subtitle, subtopics };
}

/**
 * Slug-ify a filename: remove .md extension, already kebab-cased.
 */
function fileSlug(filename: string): string {
  return filename.replace(/\.md$/, "");
}

/**
 * Get all topics for a given domain slug.
 */
export function getTopicsForDomain(domainSlug: string): Topic[] {
  const dirName = Object.entries(dirToSlug).find(
    ([, slug]) => slug === domainSlug,
  )?.[0];
  if (!dirName) return [];

  const domainDir = path.join(RESEARCH_DIR, dirName);
  if (!fs.existsSync(domainDir)) return [];

  const files = fs
    .readdirSync(domainDir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  return files.map((filename) => {
    const filePath = path.join(domainDir, filename);
    const parsed = parseMarkdownFile(filePath);
    const topicSlug = fileSlug(filename);

    const subtopics: Subtopic[] = parsed.subtopics.map((subTitle, i) => ({
      id: `${domainSlug}/${topicSlug}/s-${i}`,
      slug: subTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      topicSlug,
      title: subTitle,
      contentPath: `docs/research/${dirName}/${filename}`,
    }));

    return {
      id: `${domainSlug}/${topicSlug}`,
      slug: topicSlug,
      domainSlug,
      title: parsed.title,
      subtopics,
    };
  });
}

/**
 * Get all topics across every domain.
 */
export function getAllTopics(): Topic[] {
  return Object.values(dirToSlug).flatMap(getTopicsForDomain);
}

/**
 * Get raw markdown content for a file.
 */
export function getMarkdownContent(contentPath: string): string {
  const filePath = path.join(process.cwd(), contentPath);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * Get a single topic with its raw markdown content, for the detail page.
 */
export function getTopicWithContent(
  domainSlug: string,
  topicSlug: string,
): { topic: Topic; content: string } | null {
  const topics = getTopicsForDomain(domainSlug);
  const topic = topics.find((t) => t.slug === topicSlug);
  if (!topic) return null;

  const dirName = Object.entries(dirToSlug).find(
    ([, slug]) => slug === domainSlug,
  )?.[0];
  if (!dirName) return null;

  const contentPath = `docs/research/${dirName}/${topicSlug}.md`;
  const content = getMarkdownContent(contentPath);
  return { topic, content };
}

/**
 * Get all { slug, topic } pairs for generateStaticParams on topic content pages.
 */
export function getAllTopicParams(): { slug: string; topic: string }[] {
  return Object.values(dirToSlug).flatMap((domainSlug) => {
    const topics = getTopicsForDomain(domainSlug);
    return topics.map((t) => ({ slug: domainSlug, topic: t.slug }));
  });
}
