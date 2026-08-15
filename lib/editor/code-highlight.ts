import { highlight, languages, type Grammar } from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-sql";

const LANGUAGE_MAP: Record<string, { grammar: Grammar; label: string }> = {
  javascript: { grammar: languages.javascript, label: "JavaScript" },
  typescript: { grammar: languages.typescript, label: "TypeScript" },
  python: { grammar: languages.python, label: "Python" },
  json: { grammar: languages.json, label: "JSON" },
  html: { grammar: languages.markup, label: "HTML" },
  css: { grammar: languages.css, label: "CSS" },
  sql: { grammar: languages.sql, label: "SQL" },
};

export const CODE_LANGUAGES = ["plain", ...Object.keys(LANGUAGE_MAP)];

export function highlightCode(code: string, language: string): string {
  const entry = LANGUAGE_MAP[language];
  if (!entry || language === "plain") {
    return escapeHtml(code);
  }
  try {
    return highlight(code, entry.grammar, language);
  } catch {
    return escapeHtml(code);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function languageLabel(language: string): string {
  if (language === "plain") return "Plain";
  return LANGUAGE_MAP[language]?.label ?? language;
}
