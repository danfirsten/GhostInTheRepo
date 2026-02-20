import type { Metadata } from "next";
import { getAllDomains, getTopicsForDomain } from "@/lib/data";
import type { Topic } from "@/types/content";
import { TopicsClient } from "./TopicsClient";

export const metadata: Metadata = {
  title: "Topics",
  description:
    "Browse all 14 knowledge domains — from fundamentals to hacker mindset.",
};

export default function TopicsPage() {
  const domains = getAllDomains();
  const topicsByDomain: Record<string, Topic[]> = {};

  for (const domain of domains) {
    topicsByDomain[domain.slug] = getTopicsForDomain(domain.slug);
  }

  return <TopicsClient domains={domains} topicsByDomain={topicsByDomain} />;
}
