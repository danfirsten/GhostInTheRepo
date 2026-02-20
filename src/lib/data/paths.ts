import type { LearningPath } from "@/types/content";

const learningPaths: LearningPath[] = [
  {
    id: "systems-foundations",
    name: "Systems Foundations",
    description:
      "From transistors to network packets — build a deep understanding of how computers actually work.",
    nodes: [
      { domainSlug: "fundamentals", label: "Fundamentals" },
      { domainSlug: "operating-systems", label: "Operating Systems" },
      { domainSlug: "systems-programming", label: "Systems Programming" },
      { domainSlug: "networking", label: "Networking" },
    ],
    edges: [
      { from: "fundamentals", to: "operating-systems", type: "prerequisite" },
      {
        from: "operating-systems",
        to: "systems-programming",
        type: "prerequisite",
      },
      { from: "systems-programming", to: "networking", type: "prerequisite" },
    ],
  },
  {
    id: "web-engineer",
    name: "Web Engineer",
    description:
      "Frontend to backend to cloud — the modern web stack from top to bottom.",
    nodes: [
      { domainSlug: "fundamentals", label: "Fundamentals" },
      { domainSlug: "web-development", label: "Web Development" },
      { domainSlug: "databases", label: "Databases" },
      { domainSlug: "software-engineering", label: "Software Engineering" },
      { domainSlug: "cloud-devops", label: "Cloud & DevOps" },
    ],
    edges: [
      { from: "fundamentals", to: "web-development", type: "prerequisite" },
      { from: "web-development", to: "databases", type: "prerequisite" },
      {
        from: "databases",
        to: "software-engineering",
        type: "prerequisite",
      },
      { from: "software-engineering", to: "cloud-devops", type: "prerequisite" },
    ],
  },
  {
    id: "security-hacking",
    name: "Security & Hacking",
    description:
      "Learn to defend systems by understanding how they break.",
    nodes: [
      { domainSlug: "networking", label: "Networking" },
      { domainSlug: "cybersecurity", label: "Cybersecurity" },
      { domainSlug: "hacker-mindset", label: "Hacker Mindset" },
    ],
    edges: [
      { from: "networking", to: "cybersecurity", type: "prerequisite" },
      { from: "cybersecurity", to: "hacker-mindset", type: "prerequisite" },
    ],
  },
  {
    id: "ai-engineer",
    name: "AI Engineer",
    description:
      "From fundamentals through machine learning to production AI systems.",
    nodes: [
      { domainSlug: "fundamentals", label: "Fundamentals" },
      { domainSlug: "languages", label: "Languages" },
      { domainSlug: "ai-ml", label: "AI & Machine Learning" },
      { domainSlug: "software-engineering", label: "Software Engineering" },
      { domainSlug: "cloud-devops", label: "Cloud & DevOps" },
    ],
    edges: [
      { from: "fundamentals", to: "languages", type: "prerequisite" },
      { from: "languages", to: "ai-ml", type: "prerequisite" },
      { from: "ai-ml", to: "software-engineering", type: "related" },
      { from: "software-engineering", to: "cloud-devops", type: "related" },
    ],
  },
  {
    id: "full-stack",
    name: "Full-Stack",
    description:
      "End-to-end product engineering — frontend, backend, database, deployment.",
    nodes: [
      { domainSlug: "web-development", label: "Web Development" },
      { domainSlug: "databases", label: "Databases" },
      { domainSlug: "cloud-devops", label: "Cloud & DevOps" },
      { domainSlug: "software-engineering", label: "Software Engineering" },
    ],
    edges: [
      { from: "web-development", to: "databases", type: "prerequisite" },
      { from: "databases", to: "cloud-devops", type: "prerequisite" },
      {
        from: "cloud-devops",
        to: "software-engineering",
        type: "related",
      },
    ],
  },
  {
    id: "terminal-wizard",
    name: "Terminal Wizard",
    description:
      "Master the command line, scripting, and low-level systems tools.",
    nodes: [
      { domainSlug: "operating-systems", label: "Operating Systems" },
      { domainSlug: "terminal-and-tools", label: "Terminal & Tools" },
      { domainSlug: "systems-programming", label: "Systems Programming" },
    ],
    edges: [
      {
        from: "operating-systems",
        to: "terminal-and-tools",
        type: "prerequisite",
      },
      {
        from: "terminal-and-tools",
        to: "systems-programming",
        type: "prerequisite",
      },
    ],
  },
];

export function getAllLearningPaths(): LearningPath[] {
  return learningPaths;
}

export function getLearningPath(id: string): LearningPath | undefined {
  return learningPaths.find((p) => p.id === id);
}
