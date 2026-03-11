/**
 * Barrel export for all data-layer functions.
 * These run at build time (server-side) for static generation.
 */

export { getAllDomains, getDomain, getAllDomainSlugs } from "./domains";
export {
  getTopicsForDomain,
  getAllTopics,
  getMarkdownContent,
  getTopicWithContent,
  getAllTopicParams,
} from "./parser";
export { getCheatsheet, getAllCheatsheets } from "./cheatsheets";
export { getAllLearningPaths, getLearningPath } from "./paths";
export { getAllCodexArticles, getCodexArticle, getAllCodexSlugs } from "./codex";
export { getAllProjects, getProjectsForDomain, getProject } from "./projects";
export { getQuizForTopic, getAllQuizzes } from "./quizzes";
