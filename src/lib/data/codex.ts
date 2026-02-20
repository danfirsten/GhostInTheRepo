import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { CodexArticle } from "@/types/content";

const CODEX_DIR = path.join(process.cwd(), "src/content/codex");

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 230));
}

function parseArticle(slug: string, raw: string): CodexArticle {
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    domain: data.domain ?? "",
    readingTime: estimateReadingTime(content),
    publishedAt: data.publishedAt ?? "",
    difficulty: data.difficulty ?? "intermediate",
    summary: data.summary ?? "",
    mdxPath: path.join(CODEX_DIR, `${slug}.mdx`),
  };
}

export function getAllCodexArticles(): CodexArticle[] {
  if (!fs.existsSync(CODEX_DIR)) return [];

  const files = fs
    .readdirSync(CODEX_DIR)
    .filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(CODEX_DIR, file), "utf-8");
      return parseArticle(slug, raw);
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}

export function getCodexArticle(
  slug: string,
): { article: CodexArticle; content: string } | null {
  const filePath = path.join(CODEX_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(raw);
  const article = parseArticle(slug, raw);

  return { article, content };
}

export function getAllCodexSlugs(): string[] {
  return getAllCodexArticles().map((a) => a.slug);
}
