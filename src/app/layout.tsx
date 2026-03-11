import type { Metadata } from "next";
import { Fraunces, Syne, Epilogue, JetBrains_Mono } from "next/font/google";
import { PageShell } from "@/components/layout/PageShell";
import { getAllDomains, getTopicsForDomain, getAllComparisons } from "@/lib/data";
import { buildSearchItems, addComparisonSearchItems } from "@/lib/data/search";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

const epilogue = Epilogue({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ghost in the Repo",
    template: "%s | Ghost in the Repo",
  },
  description:
    "The complete reference for software engineers who want to understand everything, deeply.",
  keywords: [
    "software engineering",
    "computer science",
    "cheatsheets",
    "algorithms",
    "systems design",
    "networking",
    "operating systems",
  ],
};

function getSearchData() {
  const domains = getAllDomains();
  const topicsByDomain: Record<
    string,
    { slug: string; title: string; subtopics: { slug: string; title: string }[] }[]
  > = {};

  for (const domain of domains) {
    topicsByDomain[domain.slug] = getTopicsForDomain(domain.slug).map((t) => ({
      slug: t.slug,
      title: t.title,
      subtopics: t.subtopics.map((s) => ({ slug: s.slug, title: s.title })),
    }));
  }

  const items = buildSearchItems(domains, topicsByDomain);
  const comparisons = getAllComparisons();
  return addComparisonSearchItems(items, comparisons);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchItems = getSearchData();

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${syne.variable} ${epilogue.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <PageShell searchItems={searchItems}>{children}</PageShell>
      </body>
    </html>
  );
}
