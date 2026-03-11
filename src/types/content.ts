export interface Domain {
  id: string;
  slug: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  subtopicCount: number;
}

export interface Topic {
  id: string;
  slug: string;
  domainSlug: string;
  title: string;
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: string;
  slug: string;
  topicSlug: string;
  title: string;
  contentPath: string;
}

export interface CheatsheetEntry {
  command: string;
  description: string;
  note?: string;
}

export interface CheatsheetSection {
  title: string;
  entries: CheatsheetEntry[];
}

export interface Cheatsheet {
  domainSlug: string;
  sections: CheatsheetSection[];
}

export interface CodexArticle {
  slug: string;
  title: string;
  domain: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "arcane";
  readingTime: number;
  publishedAt: string;
  summary: string;
  mdxPath: string;
}

export interface PathNode {
  domainSlug: string;
  label: string;
}

export interface PathEdge {
  from: string;
  to: string;
  type: "prerequisite" | "related";
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  nodes: PathNode[];
  edges: PathEdge[];
}

export interface ProjectPrerequisite {
  topicSlug: string;
  domainSlug: string;
  title: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  domainSlug: string;
  topicSlug?: string;
  prerequisites: ProjectPrerequisite[];
  skills: string[];
  tags: string[];
  llmPrompt: string;
}

export interface Comparison {
  slug: string;
  title: string;
  sideA: string;
  sideB: string;
  domains: string[];
  difficulty: "beginner" | "intermediate" | "advanced" | "arcane";
  readingTime: number;
  publishedAt: string;
  summary: string;
  mdxPath: string;
}
