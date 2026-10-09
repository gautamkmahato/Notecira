"use client";

import { notionIconBtn } from "@/lib/ui/notion";


import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { Eye, Pencil } from "lucide-react";
import type { Block } from "@/lib/domain/types";
import { useDocumentStore } from "@/lib/document-store";
import {
  getActiveMarkdownEditor,
  notifyMarkdownToolbar,
  registerActiveMarkdownEditor,
} from "@/lib/markdown-block/active-editor";
import { extractPastedMarkdown } from "@/lib/markdown-block/clipboard";
import {
  isEmptyMarkdown,
  normalizeMarkdownSource,
} from "@/lib/markdown-block/normalize";
import { MarkdownPreview } from "./MarkdownPreview";

type MarkdownViewMode = "preview" | "edit";

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
  const [viewMode, setViewMode] = useState<MarkdownViewMode>(() =>
    hasContent ? "preview" : "edit",
  );

  const showPreview = !editable || viewMode === "preview";
  const showEdit = editable && viewMode === "edit";

  const syncTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(200, el.scrollHeight)}px`;
  };

  const focusTextarea = (caretAtEnd = true) => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    if (caretAtEnd) {
      el.setSelectionRange(el.value.length, el.value.length);
    }
    syncTextareaHeight();
  };

  useEffect(() => {
    if (!showEdit) return;
    syncTextareaHeight();
  }, [content, showEdit]);

  useEffect(() => {
    if (autofocus && editable) {
      setViewMode("edit");
    }
  }, [autofocus, editable]);

  useEffect(() => {
    if (!autofocus || !editable || viewMode !== "edit") return;
    focusTextarea();
    onAutofocusHandled?.();
  }, [autofocus, editable, onAutofocusHandled, viewMode]);

  const persist = (next: string) => {
    updateBlockContent(block.id, normalizeMarkdownSource(next));
  };

  const registerEditor = useCallback(() => {
    const el = textareaRef.current;
    if (!el || !editable || !showEdit) return;
    registerActiveMarkdownEditor({
      blockId: block.id,
      textarea: el,
      getContent: () => el.value,
      setContent: (next) => persist(next),
      notify: () => notifyMarkdownToolbar(),
    });
  }, [block.id, editable, showEdit]);

  const unregisterEditor = useCallback(() => {
    requestAnimationFrame(() => {
      const activeEl = document.activeElement;
      if (activeEl?.closest('[data-editor="markdown"]')) return;
      if (getActiveMarkdownEditor()?.blockId === block.id) {
        registerActiveMarkdownEditor(null);
      }
    });
  }, [block.id]);

  useEffect(() => {
    if (!showEdit) {
      unregisterEditor();
    }
  }, [showEdit, unregisterEditor]);

  const insertMarkdown = (markdown: string, replaceAll = false) => {
    const el = textareaRef.current;
    const normalized = normalizeMarkdownSource(markdown);
    if (!normalized) return;

    if (replaceAll || isEmptyMarkdown(content)) {
      persist(normalized);
      requestAnimationFrame(() => {
        if (!el) return;
        el.focus();
        el.setSelectionRange(normalized.length, normalized.length);
        syncTextareaHeight();
      });
      return;
    }

    if (el && document.activeElement === el) {
      const start = el.selectionStart ?? content.length;
      const end = el.selectionEnd ?? content.length;
      const next = `${content.slice(0, start)}${normalized}${content.slice(end)}`;
      persist(next);
      requestAnimationFrame(() => {
        const caret = start + normalized.length;
        el.setSelectionRange(caret, caret);
        syncTextareaHeight();
      });
      return;
    }

    const next = content ? `${content}\n\n${normalized}` : normalized;
    persist(next);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(next.length, next.length);
      syncTextareaHeight();
    });
  };

  const handlePaste = (event: ClipboardEvent<HTMLElement>) => {
    if (!editable) return;
    const markdown = extractPastedMarkdown(event.clipboardData);
    if (!markdown.trim()) return;

    event.preventDefault();
    event.stopPropagation();
    onFocused();
    insertMarkdown(markdown);
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
      className={`markdown-block relative flex w-full flex-col ${
        showEdit ? "min-h-[200px]" : "h-auto"
      }`}
      onPasteCapture={handlePaste}
    >
      {editable ? (
        <div className="absolute left-full top-0.5 z-[var(--z-3)] ml-1 flex flex-row items-center gap-0.5 opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            title="Preview"
            aria-label="Preview"
            aria-pressed={viewMode === "preview"}
            onClick={() => setViewMode("preview")}
            className={`${notionIconBtn} ${
              viewMode === "preview"
                ? "bg-[var(--color-dark-gray-2)] text-[var(--color-white)] hover:bg-[var(--color-dark-gray-3)]"
                : ""
            }`}
          >
            <Eye size={14} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            title="Edit"
            aria-label="Edit"
            aria-pressed={viewMode === "edit"}
            onClick={() => {
              setViewMode("edit");
              requestAnimationFrame(() => focusTextarea());
            }}
            className={`${notionIconBtn} ${
              viewMode === "edit"
                ? "bg-[var(--color-dark-gray-2)] text-[var(--color-white)] hover:bg-[var(--color-dark-gray-3)]"
                : ""
            }`}
          >
            <Pencil size={14} strokeWidth={1.75} />
          </button>
        </div>
      ) : null}

      {showPreview ? (
        hasContent ? (
          <MarkdownPreview source={content} />
        ) : editable ? null : (
          <p className="text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
            No markdown content
          </p>
        )
      ) : null}

      {showEdit ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => {
            persist(event.target.value);
            requestAnimationFrame(syncTextareaHeight);
          }}
          onFocus={() => {
            onFocused();
            registerEditor();
          }}
          onSelect={registerEditor}
          onKeyUp={registerEditor}
          onMouseUp={registerEditor}
          onBlur={unregisterEditor}
          onKeyDown={handleKeyDown}
          placeholder="Paste markdown here…"
          spellCheck={false}
          rows={1}
          className="min-h-[200px] w-full resize-none overflow-hidden rounded-[var(--radius-lg)] bg-transparent px-0 py-1 font-mono text-[var(--font-size-sm)] leading-6 text-[var(--color-dark-gray-2)] outline-none placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-light-gray-2)] focus:bg-[var(--color-white)] focus:px-3"
        />
      ) : null}
    </div>
  );
}
