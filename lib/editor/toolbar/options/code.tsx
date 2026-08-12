"use client";

import type { ToolbarOptionDef } from "../types";

const LANGUAGES = [
  "plain",
  "javascript",
  "typescript",
  "python",
  "json",
  "html",
  "css",
  "sql",
];

export const codeOptions: ToolbarOptionDef[] = [
  {
    id: "code-language",
    label: "Language",
    render: ({ block, patchAttrs }) => (
      <label className="flex items-center gap-2 text-xs text-slate-600">
        Language
        <select
          value={block.attrs.language ?? "plain"}
          onChange={(e) => patchAttrs({ language: e.target.value })}
          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </label>
    ),
  },
  {
    id: "code-theme",
    label: "Theme",
    render: ({ block, patchAttrs }) => (
      <label className="flex items-center gap-2 text-xs text-slate-600">
        Theme
        <select
          value={block.attrs.theme ?? "dark"}
          onChange={(e) =>
            patchAttrs({ theme: e.target.value as "dark" | "light" })
          }
          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </label>
    ),
  },
  {
    id: "code-wrap",
    label: "Wrap",
    render: ({ block, patchAttrs }) => (
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => patchAttrs({ wrap: !(block.attrs.wrap !== false) })}
        className={`rounded px-2 py-1 text-xs ${
          block.attrs.wrap !== false
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        Wrap
      </button>
    ),
  },
  {
    id: "code-clear",
    label: "Clear",
    render: ({ setContent }) => (
      <button
        type="button"
        onClick={() => setContent("")}
        className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
      >
        Clear
      </button>
    ),
  },
];
