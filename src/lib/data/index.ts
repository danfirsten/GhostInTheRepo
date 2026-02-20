/**
 * Barrel export for all data-layer functions.
 * These run at build time (server-side) for static generation.
 */

export { getAllDomains, getDomain, getAllDomainSlugs } from "./domains";
export { getTopicsForDomain, getAllTopics, getMarkdownContent } from "./parser";
export { getCheatsheet, getAllCheatsheets } from "./cheatsheets";
export { getAllLearningPaths, getLearningPath } from "./paths";
