"use client";

import type { Block } from "@/lib/domain/types";
import {
  ensureTableAttrs,
  mediaAlignClass,
  mediaWidthClass,
} from "@/lib/editor/block-meta";
import { toYouTubeEmbedUrl } from "@/lib/editor/media/youtube";
import { useDocumentStore } from "@/lib/document-store";
import { TipTapBlock } from "./TipTapBlock";

type BlockBodyProps = {
  block: Block;
  isSelected: boolean;
  editable?: boolean;
  autofocus?: boolean;
  caret?: number;
  onSelect: () => void;
  onAutofocusHandled?: () => void;
  onRequestFocus: (blockId: string, caret?: number) => void;
  onSlashQueryChange?: (query: string | null) => void;
};

export function BlockBody({
  block,
  editable = true,
  autofocus,
  caret,
  onSelect,
  onAutofocusHandled,
  onRequestFocus,
  onSlashQueryChange,
}: BlockBodyProps) {
  const updateBlockContent = useDocumentStore((s) => s.updateBlockContent);
  const updateBlockAttrs = useDocumentStore((s) => s.updateBlockAttrs);

  const textProps = {
    block,
    editable,
    autofocus,
    caret,
    onFocused: onSelect,
    onAutofocusHandled,
    onRequestFocus,
    onSlashQueryChange,
  };

  switch (block.type) {
    case "heading_1":
      return (
        <TipTapBlock
          {...textProps}
          placeholder="Heading 1"
          className="font-serif text-3xl font-semibold tracking-tight"
        />
      );
    case "heading_2":
      return (
        <TipTapBlock
          {...textProps}
          placeholder="Heading 2"
          className="font-serif text-2xl font-semibold tracking-tight"
        />
      );
    case "heading_3":
      return (
        <TipTapBlock
          {...textProps}
          placeholder="Heading 3"
          className="text-xl font-semibold"
        />
      );
    case "heading_4":
      return (
        <TipTapBlock
          {...textProps}
          placeholder="Heading 4"
          className="text-lg font-semibold"
        />
      );
    case "bulleted_list_item":
      return (
        <TipTapBlock
          {...textProps}
          mode="bulletList"
          placeholder="List item"
        />
      );
    case "numbered_list_item":
      return (
        <TipTapBlock
          {...textProps}
          mode="orderedList"
          placeholder="List item"
        />
      );
    case "code": {
      const theme = block.attrs.theme === "light" ? "light" : "dark";
      const wrap = block.attrs.wrap !== false;
      return (
        <div
          className={`rounded-md border p-3 ${
            theme === "light"
              ? "border-slate-200 bg-slate-50"
              : "border-slate-200 bg-slate-900/95"
          }`}
        >
          <textarea
            value={block.content}
            onFocus={onSelect}
            readOnly={!editable}
            onChange={(e) => {
              if (!editable) return;
              updateBlockContent(block.id, e.target.value);
            }}
            placeholder="// code"
            rows={4}
            spellCheck={false}
            className={`w-full resize-y bg-transparent font-mono text-sm leading-6 outline-none ${
              theme === "light"
                ? "text-slate-800 placeholder:text-slate-400"
                : "text-emerald-200 placeholder:text-slate-500"
            } ${wrap ? "whitespace-pre-wrap" : "whitespace-pre overflow-x-auto"}`}
          />
        </div>
      );
    }
    case "table": {
      const table = ensureTableAttrs(block.attrs);
      return (
        <div className="overflow-x-auto" onFocus={onSelect}>
          <table className="w-full border-collapse text-sm">
            <tbody>
              {table.cells.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td
                      key={`${r}-${c}`}
                      className="border border-slate-200 bg-white p-0"
                    >
                      <input
                        value={cell}
                        onFocus={onSelect}
                        readOnly={!editable}
                        onChange={(e) => {
                          if (!editable) return;
                          const cells = table.cells.map((rowCells, ri) =>
                            rowCells.map((value, ci) =>
                              ri === r && ci === c ? e.target.value : value,
                            ),
                          );
                          updateBlockAttrs(block.id, {
                            rows: table.rows,
                            cols: table.cols,
                            cells,
                          });
                        }}
                        className="w-full min-w-[80px] bg-transparent px-2 py-1.5 outline-none"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "image": {
      const width = mediaWidthClass(block.attrs.width);
      const align = mediaAlignClass(block.attrs.align);
      return (
        <div className="space-y-2" onFocus={onSelect}>
          {block.attrs.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.attrs.src}
              alt={block.attrs.alt || block.attrs.name || "Image"}
              className={`max-h-80 rounded-md border border-slate-200 object-contain ${width} ${align}`}
            />
          ) : (
            <div className="rounded-md border border-dashed border-slate-300 bg-white px-3 py-8 text-center text-sm text-slate-400">
              Add an image URL in the toolbar
            </div>
          )}
          {block.attrs.name ? (
            <p className="text-xs text-slate-500">{block.attrs.name}</p>
          ) : null}
        </div>
      );
    }
    case "video": {
      const width = mediaWidthClass(block.attrs.width);
      const align = mediaAlignClass(block.attrs.align);
      const mode = block.attrs.videoMode ?? "auto";
      const src = block.attrs.src?.trim() ?? "";
      const youtubeEmbed = toYouTubeEmbedUrl(src);
      const useIframe =
        mode === "iframe" || (mode === "auto" && Boolean(youtubeEmbed));
      const iframeSrc =
        mode === "iframe"
          ? youtubeEmbed || src
          : youtubeEmbed || "";

      return (
        <div className="space-y-2" onFocus={onSelect}>
          {src && useIframe && iframeSrc ? (
            <div
              className={`aspect-video overflow-hidden rounded-md border border-slate-200 bg-black ${width} ${align}`}
            >
              <iframe
                src={iframeSrc}
                title={block.attrs.name || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : src && !useIframe ? (
            <video
              src={src}
              controls
              className={`max-h-80 rounded-md border border-slate-200 bg-black ${width} ${align} w-full`}
            />
          ) : (
            <div className="rounded-md border border-dashed border-slate-300 bg-white px-3 py-8 text-center text-sm text-slate-400">
              Add a video or YouTube URL in the toolbar
            </div>
          )}
          {block.attrs.name ? (
            <p className="text-xs text-slate-500">{block.attrs.name}</p>
          ) : null}
        </div>
      );
    }
    case "pdf":
      return (
        <div className="space-y-2" onFocus={onSelect}>
          {block.attrs.src ? (
            <iframe
              src={block.attrs.src}
              title={block.attrs.name || "PDF"}
              className="h-80 w-full rounded-md border border-slate-200 bg-white"
            />
          ) : (
            <div className="rounded-md border border-dashed border-slate-300 bg-white px-3 py-8 text-center text-sm text-slate-400">
              Add a PDF URL in the toolbar
            </div>
          )}
          {block.attrs.src ? (
            <a
              href={block.attrs.src}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-teal-700 hover:underline"
            >
              Open PDF
            </a>
          ) : null}
        </div>
      );
    case "paragraph":
    default:
      return <TipTapBlock {...textProps} />;
  }
}
