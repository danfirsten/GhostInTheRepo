"use client";

import Fuse from "fuse.js";
import type { SearchItem } from "./search";

let fuseInstance: Fuse<SearchItem> | null = null;

/**
 * Initialize the Fuse.js search index with items.
 * Called once when the search overlay first opens.
 */
export function initSearchIndex(items: SearchItem[]) {
  fuseInstance = new Fuse(items, {
    keys: [
      { name: "title", weight: 0.6 },
      { name: "description", weight: 0.2 },
      { name: "path", weight: 0.2 },
    ],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
  });
}

/**
 * Search the index. Returns empty array if not initialized.
 */
export function search(query: string, limit = 8): SearchItem[] {
  if (!fuseInstance || !query.trim()) return [];
  return fuseInstance
    .search(query, { limit })
    .map((result) => result.item);
}
