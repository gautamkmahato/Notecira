"use client";

import { useRef, useState } from "react";
import type { Block } from "@/lib/domain/types";
import { useDocumentStore } from "@/lib/document-store";
import { mediaAlignClass, mediaWidthClass } from "@/lib/editor/block-meta";
import { toYouTubeEmbedUrl } from "@/lib/editor/media/youtube";

type VideoBlockProps = {
  block: Block;
  editable?: boolean;
  onSelect: () => void;
};

type PickerTab = "upload" | "link";

export function videoSourceLabel(block: Block): string {
  if (block.attrs.name?.trim()) return block.attrs.name.trim();
  const src = block.attrs.src?.trim() ?? "";
  if (!src) return "No video";
  if (src.startsWith("data:")) return "Uploaded video";
  if (toYouTubeEmbedUrl(src)) return "YouTube video";
  try {
    const url = new URL(src);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || src;
  } catch {
    return src.length > 48 ? `${src.slice(0, 45)}…` : src;
  }
}

export function VideoBlock({
  block,
  editable = true,
  onSelect,
}: VideoBlockProps) {
  const updateBlockAttrs = useDocumentStore((s) => s.updateBlockAttrs);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [tab, setTab] = useState<PickerTab>("upload");
  const [linkDraft, setLinkDraft] = useState("");

  const src = block.attrs.src?.trim() ?? "";
  const width = mediaWidthClass(block.attrs.width);
  const align = mediaAlignClass(block.attrs.align);
  const mode = block.attrs.videoMode ?? "auto";
  const youtubeEmbed = toYouTubeEmbedUrl(src);
  const useIframe =
    mode === "iframe" || (mode === "auto" && Boolean(youtubeEmbed));
  const iframeSrc =
    mode === "iframe" ? youtubeEmbed || src : youtubeEmbed || "";

  const patch = (attrs: Partial<Block["attrs"]>) => {
    updateBlockAttrs(block.id, attrs);
  };

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      patch({
        src: String(reader.result ?? ""),
        name: file.name,
        videoMode: "file",
      });
    };
    reader.readAsDataURL(file);
  };

  const applyLink = () => {
    const url = linkDraft.trim();
    if (!url) return;
    const embed = toYouTubeEmbedUrl(url);
    patch({
      src: url,
      name: "",
      videoMode: embed ? "auto" : "file",
    });
    setLinkDraft("");
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
                accept="video/*"
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
                placeholder="Paste video or YouTube link"
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

  return (
    <div className="space-y-2" onFocus={onSelect}>
      {useIframe && iframeSrc ? (
        <div
          className={`aspect-video overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-black)] ${width} ${align}`}
        >
          <iframe
            src={iframeSrc}
            title={block.attrs.name || "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : (
        <video
          src={src}
          controls
          className={`max-h-80 rounded-[var(--radius-xl)] bg-[var(--color-black)] ${width} ${align} w-full`}
        />
      )}
      {block.attrs.name ? (
        <p className="text-[var(--font-size-2xs)] text-[var(--color-mid-gray)]">
          {block.attrs.name}
        </p>
      ) : null}
    </div>
  );
}
