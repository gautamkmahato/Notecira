"use client";

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import type { Block } from "@/lib/domain/types";
import { useDocumentStore } from "@/lib/document-store";
import {
  isEmptyMarkdown,
  normalizeMarkdownSource,
} from "@/lib/markdown-block/normalize";
import { MarkdownPreview } from "./MarkdownPreview";

type MarkdownBlockProps = {
  block: Block;
  editable?: boolean;
  autofocus?: boolean;
  onFocused: () => void;
  onAutofocusHandled?: () => void;
  onRequestFocus: (blockId: string, caret?: number) => void;
  onSlashQueryChange?: (query: string | null) => void;
};

export function MarkdownBlock({
  block,
  editable = true,
  autofocus,
  onFocused,
  onAutofocusHandled,
  onRequestFocus,
  onSlashQueryChange,
}: MarkdownBlockProps) {
  const updateBlockContent = useDocumentStore((s) => s.updateBlockContent);
  const mergeWithPrevious = useDocumentStore((s) => s.mergeWithPrevious);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const content = block.content ?? "";
  const hasContent = !isEmptyMarkdown(content);

  useEffect(() => {
    if (!autofocus || !editable) return;
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
    onAutofocusHandled?.();
  }, [autofocus, editable, onAutofocusHandled]);

  const persist = (next: string) => {
    updateBlockContent(block.id, normalizeMarkdownSource(next));
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!editable) return;
    const text = event.clipboardData.getData("text/plain");
    if (!text) return;

    event.preventDefault();
    const el = event.currentTarget;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const next = `${content.slice(0, start)}${text}${content.slice(end)}`;
    persist(next);

    requestAnimationFrame(() => {
      const caret = start + text.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const handleBlockPaste = (event: ClipboardEvent<HTMLDivElement>) => {
    if (!editable) return;
    if (event.target !== event.currentTarget) return;
    const text = event.clipboardData.getData("text/plain");
    if (!text.trim()) return;

    event.preventDefault();
    persist(text);
    onFocused();
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!editable || event.key !== "Backspace") return;
    const el = event.currentTarget;
    if (el.selectionStart !== 0 || el.selectionEnd !== 0) return;
    if (!isEmptyMarkdown(el.value)) return;

    const merged = mergeWithPrevious(block.documentId, block.id);
    if (!merged) return;
    event.preventDefault();
    onSlashQueryChange?.(null);
    onRequestFocus(merged.previousBlockId, merged.caretOffset);
  };

  return (
    <div
      className="markdown-block flex min-h-[200px] w-full flex-col gap-3"
      onPaste={handleBlockPaste}
    >
      {hasContent ? <MarkdownPreview source={content} /> : null}

      {editable ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => persist(event.target.value)}
          onFocus={onFocused}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder="Paste markdown here…"
          spellCheck={false}
          className="min-h-[120px] w-full resize-y rounded-[var(--radius-lg)] border border-transparent bg-transparent px-0 py-1 font-mono text-[var(--font-size-sm)] leading-6 text-[var(--color-dark-gray-2)] outline-none placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-light-gray-2)] focus:bg-[var(--color-white)] focus:px-3"
        />
      ) : hasContent ? null : (
        <p className="text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
          No markdown content
        </p>
      )}
    </div>
  );
}
