import { createHighlighter, type Highlighter } from "shiki";
import { spectralTheme } from "./spectral-theme";

let highlighterInstance: Highlighter | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (highlighterInstance) return highlighterInstance;

  highlighterInstance = await createHighlighter({
    themes: [spectralTheme],
    langs: [
      "typescript",
      "javascript",
      "python",
      "rust",
      "go",
      "c",
      "cpp",
      "bash",
      "sql",
      "html",
      "css",
      "json",
      "yaml",
      "dockerfile",
      "markdown",
    ],
  });

  return highlighterInstance;
}

export async function highlightCode(
  code: string,
  lang: string
): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, {
    lang,
    theme: "spectral",
  });
}
