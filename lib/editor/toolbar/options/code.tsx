"use client";

import { CODE_LANGUAGES, languageLabel } from "@/lib/editor/code-highlight";
import { Select } from "@/components/ui/Select";
import type { ToolbarOptionDef } from "../types";
import { ToolbarDivider } from "../components/toolbar-divider";

const HEIGHT_OPTIONS = [
  { label: "Auto", value: "auto" as const },
  { label: "200px", value: "200" as const },
  { label: "300px", value: "300" as const },
  { label: "400px", value: "400" as const },
  { label: "500px", value: "500" as const },
];

const LANGUAGE_OPTIONS = CODE_LANGUAGES.map((lang) => ({
  value: lang,
  label: languageLabel(lang),
}));

const THEME_OPTIONS = [
  { label: "Dark", value: "dark" as const },
  { label: "Light", value: "light" as const },
];

export const codeOptions: ToolbarOptionDef[] = [
  {
    id: "code-language",
    label: "Language",
    render: ({ block, patchAttrs }) => (
      <div className="px-2">
        <Select
          value={block.attrs.language ?? "plain"}
          onChange={(language) => patchAttrs({ language })}
          options={LANGUAGE_OPTIONS}
          groupLabel="Language"
          className="min-w-[132px]"
        />
      </div>
    ),
  },
  {
    id: "code-divider-1",
    label: "",
    render: () => <ToolbarDivider />,
  },
  {
    id: "code-height",
    label: "Height",
    render: ({ block, patchAttrs }) => (
      <div className="px-2">
        <Select
          value={String(block.attrs.codeHeight ?? "auto")}
          onChange={(raw) =>
            patchAttrs({
              codeHeight: raw === "auto" ? "auto" : Number(raw),
            })
          }
          options={HEIGHT_OPTIONS}
          groupLabel="Height"
          className="min-w-[100px]"
        />
      </div>
    ),
  },
  {
    id: "code-divider-2",
    label: "",
    render: () => <ToolbarDivider />,
  },
  {
    id: "code-theme",
    label: "Theme",
    render: ({ block, patchAttrs }) => (
      <div className="px-2">
        <Select
          value={block.attrs.theme ?? "dark"}
          onChange={(theme) => patchAttrs({ theme })}
          options={THEME_OPTIONS}
          groupLabel="Theme"
          className="min-w-[100px]"
        />
      </div>
    ),
  },
  {
    id: "code-divider-3",
    label: "",
    render: () => <ToolbarDivider />,
  },
  {
    id: "code-wrap",
    label: "Wrap",
    render: ({ block, patchAttrs }) => (
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => patchAttrs({ wrap: !(block.attrs.wrap !== false) })}
        className={`mx-1 rounded-[var(--radius-lg)] px-2.5 py-1 text-[var(--font-size-xs)] ${
          block.attrs.wrap !== false
            ? "bg-gray-200 text-[var(--color-white)]"
            : "text-[var(--color-dark-gray)] hover:bg-[var(--notion-hover)]"
        }`}
      >
        Wrap
      </button>
    ),
  },
];
