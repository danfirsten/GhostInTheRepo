import type { ThemeRegistrationRaw } from "shiki";

export const spectralTheme: ThemeRegistrationRaw = {
  name: "spectral",
  type: "dark",
  settings: [],
  colors: {
    "editor.background": "#0A0E18",
    "editor.foreground": "#E8EDF7",
    "editor.lineHighlightBackground": "#111827",
    "editor.selectionBackground": "rgba(167, 139, 250, 0.15)",
    "editorLineNumber.foreground": "#1A2033",
    "editorLineNumber.activeForeground": "#5A6478",
    "editorCursor.foreground": "#A78BFA",
    "editorWhitespace.foreground": "#1A2033",
    "editorIndentGuide.background": "#1A2033",
    "editorIndentGuide.activeBackground": "#5A6478",
  },
  tokenColors: [
    {
      name: "Comments",
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: "#4A5568",
        fontStyle: "italic",
      },
    },
    {
      name: "Keywords",
      scope: [
        "keyword",
        "storage.type",
        "storage.modifier",
        "keyword.control",
        "keyword.operator.new",
        "keyword.operator.expression",
        "keyword.operator.logical",
      ],
      settings: {
        foreground: "#A78BFA",
      },
    },
    {
      name: "Strings",
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "punctuation.definition.string",
      ],
      settings: {
        foreground: "#34D399",
      },
    },
    {
      name: "Numbers",
      scope: ["constant.numeric", "constant.language.boolean"],
      settings: {
        foreground: "#7DD3FC",
      },
    },
    {
      name: "Functions",
      scope: [
        "entity.name.function",
        "meta.function-call",
        "support.function",
      ],
      settings: {
        foreground: "#F0F4FF",
      },
    },
    {
      name: "Classes & Types",
      scope: [
        "entity.name.type",
        "entity.name.class",
        "support.type",
        "support.class",
        "entity.other.inherited-class",
      ],
      settings: {
        foreground: "#F472B6",
      },
    },
    {
      name: "Variables",
      scope: [
        "variable",
        "variable.other",
        "variable.parameter",
        "meta.object-literal.key",
      ],
      settings: {
        foreground: "#9AA3B5",
      },
    },
    {
      name: "Constants",
      scope: ["constant.other", "variable.other.constant"],
      settings: {
        foreground: "#7DD3FC",
      },
    },
    {
      name: "Operators",
      scope: [
        "keyword.operator",
        "keyword.operator.assignment",
        "keyword.operator.arithmetic",
        "keyword.operator.comparison",
      ],
      settings: {
        foreground: "#7DD3FC",
      },
    },
    {
      name: "Punctuation",
      scope: [
        "punctuation",
        "punctuation.separator",
        "punctuation.terminator",
        "meta.brace",
      ],
      settings: {
        foreground: "#5A6478",
      },
    },
    {
      name: "Tags (HTML/JSX)",
      scope: ["entity.name.tag", "punctuation.definition.tag"],
      settings: {
        foreground: "#A78BFA",
      },
    },
    {
      name: "Attributes",
      scope: ["entity.other.attribute-name"],
      settings: {
        foreground: "#FB923C",
      },
    },
    {
      name: "Decorators",
      scope: ["meta.decorator", "punctuation.decorator"],
      settings: {
        foreground: "#F472B6",
      },
    },
    {
      name: "Regex",
      scope: ["string.regexp"],
      settings: {
        foreground: "#FB923C",
      },
    },
    {
      name: "Markdown Headings",
      scope: [
        "markup.heading",
        "entity.name.section",
        "punctuation.definition.heading",
      ],
      settings: {
        foreground: "#F0F4FF",
        fontStyle: "bold",
      },
    },
    {
      name: "Markdown Bold",
      scope: ["markup.bold"],
      settings: {
        foreground: "#E8EDF7",
        fontStyle: "bold",
      },
    },
    {
      name: "Markdown Italic",
      scope: ["markup.italic"],
      settings: {
        foreground: "#E8EDF7",
        fontStyle: "italic",
      },
    },
    {
      name: "Markdown Links",
      scope: ["markup.underline.link"],
      settings: {
        foreground: "#7DD3FC",
      },
    },
    {
      name: "Markdown Code",
      scope: ["markup.inline.raw", "markup.fenced_code"],
      settings: {
        foreground: "#34D399",
      },
    },
  ],
};
