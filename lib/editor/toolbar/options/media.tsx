"use client";

import {
  imageSourceLabel,
  OBJECT_FIT_OPTIONS,
} from "@/components/editor/ImageBlock";
import { videoSourceLabel } from "@/components/editor/VideoBlock";
import { Select } from "@/components/ui/Select";
import type { ToolbarOptionDef } from "../types";
import { ToolbarDivider } from "../components/toolbar-divider";

const ALIGN_OPTIONS = [
  { label: "Left", value: "left" as const },
  { label: "Center", value: "center" as const },
  { label: "Right", value: "right" as const },
];

const WIDTH_OPTIONS = [
  { label: "S", value: "sm" as const },
  { label: "M", value: "md" as const },
  { label: "L", value: "lg" as const },
  { label: "Full", value: "full" as const },
];

const OBJECT_FIT_SELECT_OPTIONS = OBJECT_FIT_OPTIONS.map((fit) => ({
  value: fit,
  label: fit.charAt(0).toUpperCase() + fit.slice(1),
}));

const VIDEO_MODE_OPTIONS = [
  { label: "Auto", value: "auto" as const },
  { label: "File / URL", value: "file" as const },
  { label: "Iframe / YouTube", value: "iframe" as const },
];

function mediaNameOption(placeholder = "Caption"): ToolbarOptionDef {
  return {
    id: "media-name",
    label: "Name",
    render: ({ block, patchAttrs }) => (
      <input
        value={block.attrs.name ?? ""}
        onChange={(e) => patchAttrs({ name: e.target.value })}
        placeholder={placeholder}
        className="w-32 rounded-[var(--radius-lg)] bg-[var(--color-white)] px-2 py-1 text-[var(--font-size-sm)] outline-none"
      />
    ),
  };
}

function mediaAlignOption(): ToolbarOptionDef {
  return {
    id: "media-align",
    label: "Align",
    render: ({ block, patchAttrs }) => (
      <div className="px-2">
        <Select
          value={block.attrs.align ?? "left"}
          onChange={(align) => patchAttrs({ align })}
          options={ALIGN_OPTIONS}
          groupLabel="Align"
          className="min-w-[108px]"
        />
      </div>
    ),
  };
}

function mediaWidthOption(): ToolbarOptionDef {
  return {
    id: "media-width",
    label: "Width",
    render: ({ block, patchAttrs }) => (
      <div className="px-2">
        <Select
          value={block.attrs.width ?? "full"}
          onChange={(width) => patchAttrs({ width })}
          options={WIDTH_OPTIONS}
          groupLabel="Width"
          className="min-w-[96px]"
        />
      </div>
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
        className="rounded-[var(--radius-lg)] px-2 py-1 text-[var(--font-size-sm)] text-[var(--color-dark-gray)] hover:bg-[var(--notion-hover)]"
      >
        Clear
      </button>
    ),
  };
}

export const imageOptions: ToolbarOptionDef[] = [
  // {
  //   id: "image-source-label",
  //   label: "Source",
  //   render: ({ block }) => (
  //     <span
  //       className="max-w-[220px] truncate px-2 text-[var(--font-size-sm)] text-[var(--color-dark-gray)]"
  //       title={block.attrs.src ?? ""}
  //     >
  //       {imageSourceLabel(block)}
  //     </span>
  //   ),
  // },
  mediaNameOption("Caption"),
  {
    id: "image-divider-1",
    label: "",
    render: () => <ToolbarDivider />,
  },
  {
    id: "image-object-fit",
    label: "Fit",
    render: ({ block, patchAttrs }) => (
      <div className="px-2">
        <Select
          value={block.attrs.objectFit ?? "contain"}
          onChange={(objectFit) => patchAttrs({ objectFit })}
          options={OBJECT_FIT_SELECT_OPTIONS}
          groupLabel="Fit"
          className="min-w-[116px]"
        />
      </div>
    ),
  },
  {
    id: "image-divider-2",
    label: "",
    render: () => <ToolbarDivider />,
  },
  mediaAlignOption(),
];

function mediaSourceOption(label: string, placeholder: string): ToolbarOptionDef {
  return {
    id: "media-src",
    label: `${label} source`,
    render: ({ block, patchAttrs }) => (
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <input
          value={block.attrs.src ?? ""}
          onChange={(e) => patchAttrs({ src: e.target.value })}
          placeholder={placeholder}
          className="min-w-[160px] flex-1 rounded-[var(--radius-lg)] bg-[var(--color-white)] px-2 py-1 text-[var(--font-size-sm)] outline-none shadow-[var(--shadow-sm)]"
        />
      </div>
    ),
  };
}

export const videoOptions: ToolbarOptionDef[] = [
  // {
  //   id: "video-source-label",
  //   label: "Source",
  //   render: ({ block }) => (
  //     <span
  //       className="max-w-[220px] truncate px-2 text-[var(--font-size-sm)] text-[var(--color-dark-gray)]"
  //       title={block.attrs.src ?? ""}
  //     >
  //       {videoSourceLabel(block)}
  //     </span>
  //   ),
  // },
  mediaNameOption("Caption"),
  {
    id: "video-divider-1",
    label: "",
    render: () => <ToolbarDivider />,
  },
  {
    id: "video-mode",
    label: "Mode",
    render: ({ block, patchAttrs }) => (
      <div className="px-2">
        <Select
          value={block.attrs.videoMode ?? "auto"}
          onChange={(videoMode) => patchAttrs({ videoMode })}
          options={VIDEO_MODE_OPTIONS}
          groupLabel="Mode"
          className="min-w-[148px]"
        />
      </div>
    ),
  },
  {
    id: "video-divider-2",
    label: "",
    render: () => <ToolbarDivider />,
  },
  mediaWidthOption(),
  mediaAlignOption(),
];

export const pdfOptions: ToolbarOptionDef[] = [
  mediaSourceOption("PDF URL", "https://…"),
  mediaNameOption("File name"),
  mediaClearOption(),
];
