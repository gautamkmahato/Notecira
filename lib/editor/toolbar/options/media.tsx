"use client";

import type { ToolbarOptionDef } from "../types";

function mediaSourceOption(label: string, placeholder: string): ToolbarOptionDef {
  return {
    id: "media-src",
    label: `${label} source`,
    render: ({ block, patchAttrs }) => (
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 text-xs text-slate-500">{label}</span>
        <input
          value={block.attrs.src ?? ""}
          onChange={(e) => patchAttrs({ src: e.target.value })}
          placeholder={placeholder}
          className="min-w-[160px] flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
        />
      </div>
    ),
  };
}

function mediaNameOption(placeholder = "Caption"): ToolbarOptionDef {
  return {
    id: "media-name",
    label: "Name",
    render: ({ block, patchAttrs }) => (
      <input
        value={block.attrs.name ?? ""}
        onChange={(e) => patchAttrs({ name: e.target.value })}
        placeholder={placeholder}
        className="w-32 rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
      />
    ),
  };
}

function mediaWidthOption(): ToolbarOptionDef {
  return {
    id: "media-width",
    label: "Width",
    render: ({ block, patchAttrs }) => (
      <label className="flex items-center gap-1.5 text-xs text-slate-600">
        Width
        <select
          value={block.attrs.width ?? "full"}
          onChange={(e) =>
            patchAttrs({
              width: e.target.value as "sm" | "md" | "lg" | "full",
            })
          }
          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
        >
          <option value="sm">S</option>
          <option value="md">M</option>
          <option value="lg">L</option>
          <option value="full">Full</option>
        </select>
      </label>
    ),
  };
}

function mediaAlignOption(): ToolbarOptionDef {
  return {
    id: "media-align",
    label: "Align",
    render: ({ block, patchAttrs }) => (
      <label className="flex items-center gap-1.5 text-xs text-slate-600">
        Align
        <select
          value={block.attrs.align ?? "left"}
          onChange={(e) =>
            patchAttrs({
              align: e.target.value as "left" | "center" | "right",
            })
          }
          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>
    ),
  };
}

function mediaClearOption(): ToolbarOptionDef {
  return {
    id: "media-clear",
    label: "Clear",
    render: ({ patchAttrs }) => (
      <button
        type="button"
        onClick={() => patchAttrs({ src: "", name: "" })}
        className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
      >
        Clear
      </button>
    ),
  };
}

export const imageOptions: ToolbarOptionDef[] = [
  mediaSourceOption("Image URL", "https://…"),
  {
    id: "image-alt",
    label: "Alt text",
    render: ({ block, patchAttrs }) => (
      <input
        value={block.attrs.alt ?? ""}
        onChange={(e) => patchAttrs({ alt: e.target.value })}
        placeholder="Alt text"
        className="w-28 rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
      />
    ),
  },
  mediaNameOption("Caption"),
  mediaWidthOption(),
  mediaAlignOption(),
  mediaClearOption(),
];

export const videoOptions: ToolbarOptionDef[] = [
  mediaSourceOption("Video / YouTube", "https://youtube.com/watch?v=…"),
  {
    id: "video-mode",
    label: "Mode",
    render: ({ block, patchAttrs }) => (
      <label className="flex items-center gap-1.5 text-xs text-slate-600">
        Mode
        <select
          value={block.attrs.videoMode ?? "auto"}
          onChange={(e) =>
            patchAttrs({
              videoMode: e.target.value as "auto" | "file" | "iframe",
            })
          }
          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
        >
          <option value="auto">Auto</option>
          <option value="file">File / URL</option>
          <option value="iframe">Iframe / YouTube</option>
        </select>
      </label>
    ),
  },
  mediaNameOption("Caption"),
  mediaWidthOption(),
  mediaAlignOption(),
  mediaClearOption(),
];

export const pdfOptions: ToolbarOptionDef[] = [
  mediaSourceOption("PDF URL", "https://…"),
  mediaNameOption("File name"),
  mediaClearOption(),
];
