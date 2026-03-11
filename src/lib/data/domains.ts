import type { Domain } from "@/types/content";

/**
 * Maps research directory names to canonical UI slugs where they differ.
 */
export const dirToSlug: Record<string, string> = {
  "01-fundamentals": "fundamentals",
  "02-operating-systems": "operating-systems",
  "03-terminal-and-tools": "terminal-and-tools",
  "04-networking": "networking",
  "05-systems-programming": "systems-programming",
  "06-databases": "databases",
  "07-web-development": "web-development",
  "08-software-engineering": "software-engineering",
  "09-cloud-devops": "cloud-devops",
  "10-security": "cybersecurity",
  "12-app-development": "mobile-dev",
  "11-ai-ml": "ai-ml",
  "13-languages": "languages",
  "14-hacker-mindset": "hacker-mindset",
  "15-startups-and-founders": "startups",
};

export const slugToDir: Record<string, string> = Object.fromEntries(
  Object.entries(dirToSlug).map(([dir, slug]) => [slug, dir]),
);

const domains: Domain[] = [
  {
    id: "d-01",
    slug: "fundamentals",
    label: "Fundamentals",
    icon: "Circuitry",
    description:
      "The bedrock — data structures, algorithms, architecture, discrete math, and how computers actually think.",
    color: "spectral-1",
    subtopicCount: 0, // populated at build time
  },
  {
    id: "d-02",
    slug: "operating-systems",
    label: "Operating Systems",
    icon: "Cpu",
    description:
      "Processes, memory, file systems, concurrency — the layer between your code and the hardware.",
    color: "spectral-2",
    subtopicCount: 0,
  },
  {
    id: "d-03",
    slug: "terminal-and-tools",
    label: "Terminal & Tools",
    icon: "TerminalWindow",
    description:
      "Shell scripting, Vim, Git, tmux, build systems — the tools that make you fast.",
    color: "spectral-3",
    subtopicCount: 0,
  },
  {
    id: "d-04",
    slug: "networking",
    label: "Networking",
    icon: "Network",
    description:
      "OSI model, TCP/IP, DNS, TLS, HTTP — how machines talk to each other across the wire.",
    color: "spectral-1",
    subtopicCount: 0,
  },
  {
    id: "d-05",
    slug: "systems-programming",
    label: "Systems Programming",
    icon: "Gear",
    description:
      "C, C++, Rust, low-level systems — writing code that talks directly to the machine.",
    color: "spectral-4",
    subtopicCount: 0,
  },
  {
    id: "d-06",
    slug: "databases",
    label: "Databases",
    icon: "Database",
    description:
      "SQL, NoSQL, internals, indexing, replication — where data lives and how it moves.",
    color: "spectral-2",
    subtopicCount: 0,
  },
  {
    id: "d-07",
    slug: "web-development",
    label: "Web Development",
    icon: "Globe",
    description:
      "Frontend, backend, APIs, performance — building for the browser and beyond.",
    color: "spectral-3",
    subtopicCount: 0,
  },
  {
    id: "d-08",
    slug: "software-engineering",
    label: "Software Engineering",
    icon: "Blueprint",
    description:
      "Design patterns, clean architecture, testing, distributed systems — building software that lasts.",
    color: "spectral-1",
    subtopicCount: 0,
  },
  {
    id: "d-09",
    slug: "cloud-devops",
    label: "Cloud & DevOps",
    icon: "Cloud",
    description:
      "Docker, Kubernetes, CI/CD, IaC, observability — shipping and running at scale.",
    color: "spectral-5",
    subtopicCount: 0,
  },
  {
    id: "d-10",
    slug: "cybersecurity",
    label: "Cybersecurity",
    icon: "ShieldCheck",
    description:
      "Cryptography, network security, web security, offensive security — defending and breaking systems.",
    color: "spectral-4",
    subtopicCount: 0,
  },
  {
    id: "d-11",
    slug: "ai-ml",
    label: "AI & Machine Learning",
    icon: "Brain",
    description:
      "ML fundamentals, deep learning, NLP, LLMs, data engineering — teaching machines to learn.",
    color: "spectral-1",
    subtopicCount: 0,
  },
  {
    id: "d-12",
    slug: "mobile-dev",
    label: "App Development",
    icon: "DeviceMobile",
    description:
      "Mobile, desktop, cross-platform — building native and hybrid applications.",
    color: "spectral-3",
    subtopicCount: 0,
  },
  {
    id: "d-13",
    slug: "languages",
    label: "Languages",
    icon: "CodeBlock",
    description:
      "Python, JavaScript/TypeScript, Go, and core language concepts — the tools of expression.",
    color: "spectral-2",
    subtopicCount: 0,
  },
  {
    id: "d-14",
    slug: "hacker-mindset",
    label: "Hacker Mindset",
    icon: "Bug",
    description:
      "CTFs, reverse engineering, the engineering mindset — thinking like someone who breaks things to understand them.",
    color: "spectral-4",
    subtopicCount: 0,
  },
  {
    id: "d-15",
    slug: "startups",
    label: "Startups & Founders",
    icon: "Rocket",
    description:
      "Ideation, fundraising, equity, product-market fit, growth — everything engineers need to build their own thing.",
    color: "spectral-5",
    subtopicCount: 0,
  },
];

export function getAllDomains(): Domain[] {
  return domains;
}

export function getDomain(slug: string): Domain | undefined {
  return domains.find((d) => d.slug === slug);
}

export function getAllDomainSlugs(): string[] {
  return domains.map((d) => d.slug);
}
