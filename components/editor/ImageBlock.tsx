"use client";

import { useEffect, useRef, useState } from "react";
import type { Block } from "@/lib/domain/types";
import { useDocumentStore } from "@/lib/document-store";
import { mediaAlignClass } from "@/lib/editor/block-meta";

type ImageBlockProps = {
  block: Block;
  isSelected: boolean;
  editable?: boolean;
  onSelect: () => void;
};

type PickerTab = "upload" | "link";
type ResizeCorner = "nw" | "ne" | "sw" | "se";

const OBJECT_FIT_OPTIONS = [
  "contain",
  "cover",
  "fill",
  "none",
  "scale-down",
] as const;

export function imageSourceLabel(block: Block): string {
  if (block.attrs.name?.trim()) return block.attrs.name.trim();
  const src = block.attrs.src?.trim() ?? "";
  if (!src) return "No image";
  if (src.startsWith("data:")) return "Uploaded image";
  try {
    const url = new URL(src);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || src;
  } catch {
    return src.length > 48 ? `${src.slice(0, 45)}…` : src;
  }
}

export function ImageBlock({
  block,
  isSelected,
  editable = true,
  onSelect,
}: ImageBlockProps) {
  const updateBlockAttrs = useDocumentStore((s) => s.updateBlockAttrs);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [tab, setTab] = useState<PickerTab>("upload");
  const [linkDraft, setLinkDraft] = useState("");
  const [showResize, setShowResize] = useState(false);

  const src = block.attrs.src?.trim() ?? "";
  const align = mediaAlignClass(block.attrs.align);
  const objectFit = block.attrs.objectFit ?? "contain";
  const widthPx = block.attrs.imageWidthPx;
  const heightPx = block.attrs.imageHeightPx;

  useEffect(() => {
    if (!isSelected) setShowResize(false);
  }, [isSelected]);

  const patch = (patch: Partial<Block["attrs"]>) => {
    updateBlockAttrs(block.id, patch);
  };

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      patch({
        src: String(reader.result ?? ""),
        name: file.name,
        imageWidthPx: undefined,
        imageHeightPx: undefined,
      });
    };
    reader.readAsDataURL(file);
  };

  const applyLink = () => {
    const url = linkDraft.trim();
    if (!url) return;
    patch({
      src: url,
      name: "",
      imageWidthPx: undefined,
      imageHeightPx: undefined,
    });
    setLinkDraft("");
  };

  const startResize = (
    corner: ResizeCorner,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (!editable || !imageRef.current) return;
    event.preventDefault();
    event.stopPropagation();

    const rect = imageRef.current.getBoundingClientRect();
    const startW = widthPx ?? rect.width;
    const startH = heightPx ?? rect.height;
    const startX = event.clientX;
    const startY = event.clientY;
    const ratio = startW / Math.max(startH, 1);

    const onMove = (moveEvent: MouseEvent) => {
      let dx = moveEvent.clientX - startX;
      let dy = moveEvent.clientY - startY;

      if (corner === "nw") {
        dx = -dx;
        dy = -dy;
      } else if (corner === "ne") {
        dy = -dy;
      } else if (corner === "sw") {
        dx = -dx;
      }

      const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy * ratio;
      const nextW = Math.max(80, Math.round(startW + delta));
      const nextH = Math.max(60, Math.round(nextW / ratio));
      patch({ imageWidthPx: nextW, imageHeightPx: nextH });
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (!src) {
    return (
      <div
        className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] shadow-[var(--shadow-sm)]"
        onFocus={onSelect}
      >
        <div className="flex border-b border-[var(--color-light-gray-2)]">
          {(["upload", "link"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex-1 px-4 py-2.5 text-[var(--font-size-sm)] capitalize transition ${
                tab === key
                  ? "border-b-2 border-[var(--color-dark-gray-2)] font-medium text-[var(--color-dark-gray-2)]"
                  : "text-[var(--color-mid-gray)] hover:text-[var(--color-dark-gray)]"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === "upload" ? (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                disabled={!editable}
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-[var(--radius-lg)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] px-4 py-2.5 text-[var(--font-size-sm)] text-[var(--color-dark-gray)] hover:bg-[var(--notion-hover)] disabled:opacity-40"
              >
                Upload file
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                type="url"
                value={linkDraft}
                disabled={!editable}
                onChange={(e) => setLinkDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink();
                  }
                }}
                placeholder="Paste image link"
                className="w-full rounded-[var(--radius-lg)] border border-[var(--color-light-gray-2)] bg-[var(--color-white)] px-3 py-2 text-[var(--font-size-sm)] outline-none focus:border-[var(--color-blue)]"
              />
              <button
                type="button"
                disabled={!editable || !linkDraft.trim()}
                onClick={applyLink}
                className="rounded-[var(--radius-lg)] bg-[var(--color-dark-gray-2)] px-4 py-2 text-[var(--font-size-sm)] text-[var(--color-white)] hover:opacity-90 disabled:opacity-40"
              >
                Embed link
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const showHandles = editable && showResize && isSelected;

  return (
    <div className={`space-y-2 ${align}`} onFocus={onSelect}>
      <div
        className={`relative inline-block max-w-full ${align === "mx-auto" ? "mx-auto" : align === "ml-auto" ? "ml-auto" : ""}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={src}
          alt={block.attrs.alt || block.attrs.name || "Image"}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
            if (editable) setShowResize(true);
          }}
          className={`block max-w-full rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] ${
            showHandles ? "ring-2 ring-[var(--color-blue-30)]" : ""
          }`}
          style={{
            width: widthPx ? `${widthPx}px` : undefined,
            height: heightPx ? `${heightPx}px` : undefined,
            objectFit,
          }}
        />
        {showHandles ? (
          <>
            {(
              [
                ["nw", "-left-1.5 -top-1.5 cursor-nwse-resize"],
                ["ne", "-right-1.5 -top-1.5 cursor-nesw-resize"],
                ["sw", "-bottom-1.5 -left-1.5 cursor-nesw-resize"],
                ["se", "-bottom-1.5 -right-1.5 cursor-nwse-resize"],
              ] as const
            ).map(([corner, pos]) => (
              <div
                key={corner}
                role="presentation"
                onMouseDown={(e) => startResize(corner, e)}
                className={`absolute ${pos} z-[var(--z-2)] h-3 w-3 rounded-sm border-2 border-[var(--color-white)] bg-[var(--color-blue)] shadow-[var(--shadow-sm)]`}
              />
            ))}
          </>
        ) : null}
      </div>
      {block.attrs.name ? (
        <p className="text-[var(--font-size-2xs)] text-[var(--color-mid-gray)]">
          {block.attrs.name}
        </p>
      ) : null}
    </div>
  );
}

export { OBJECT_FIT_OPTIONS };
