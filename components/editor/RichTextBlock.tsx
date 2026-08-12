"use client";

import {
  useEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { Block } from "@/lib/domain/types";
import { useDocumentStore } from "@/lib/document-store";
import {
  getActiveTextEditor,
  registerActiveTextEditor,
} from "@/lib/editor/rich-text/active-editor";
import {
  ensureEditableHtml,
  htmlToPlainText,
  isEmptyHtml,
  normalizeEmptyHtml,
} from "@/lib/editor/rich-text/html";
import {
  setCaretPlainOffset,
  splitHtmlAtCaret,
} from "@/lib/editor/rich-text/marks";

type RichTextBlockProps = {
  block: Block;
  placeholder?: string;
  className?: string;
  autofocus?: boolean;
  caret?: number;
  /** When true, Enter inserts a soft line break (used inside list items). */
  softBreakOnEnter?: boolean;
  onFocused: () => void;
  onAutofocusHandled?: () => void;
  onRequestFocus: (blockId: string, caret?: number) => void;
  onSlashQueryChange?: (query: string | null) => void;
  /** Optional override for Enter (e.g. list item split). Return true if handled. */
  onEnter?: () => boolean;
  /** Optional override for Backspace at start. Return true if handled. */
  onBackspaceAtStart?: () => boolean;
  /** Persist HTML somewhere other than block.content (list items). */
  onHtmlChange?: (html: string) => void;
  initialHtml?: string;
};

export function RichTextBlock({
  block,
  placeholder = "Press '/' for commands",
  className = "",
  autofocus,
  caret,
  softBreakOnEnter = false,
  onFocused,
  onAutofocusHandled,
  onRequestFocus,
  onSlashQueryChange,
  onEnter,
  onBackspaceAtStart,
  onHtmlChange,
  initialHtml,
}: RichTextBlockProps) {
  const updateBlockContent = useDocumentStore((s) => s.updateBlockContent);
  const splitBlock = useDocumentStore((s) => s.splitBlock);
  const mergeWithPrevious = useDocumentStore((s) => s.mergeWithPrevious);
  const ref = useRef<HTMLDivElement | null>(null);
  const skipSync = useRef(false);
  const sourceHtml = initialHtml ?? block.content;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }
    if (document.activeElement === el) return;
    const next = ensureEditableHtml(sourceHtml);
    if (el.innerHTML !== next) {
      el.innerHTML = next;
    }
    el.dataset.empty = isEmptyHtml(next) ? "true" : "false";
  }, [sourceHtml]);

  useEffect(() => {
    if (!autofocus) return;
    const el = ref.current;
    if (!el) return;
    el.focus();
    if (typeof caret === "number") {
      setCaretPlainOffset(el, caret);
    } else {
      setCaretPlainOffset(el, htmlToPlainText(el.innerHTML).length);
    }
    onAutofocusHandled?.();
  }, [autofocus, caret, onAutofocusHandled]);

  const notifyMarks = () => {
    const el = ref.current;
    if (!el) return;
    registerActiveTextEditor({
      blockId: block.id,
      root: el,
      persist: () => {
        const html = normalizeEmptyHtml(el.innerHTML);
        skipSync.current = true;
        if (onHtmlChange) {
          onHtmlChange(html);
        } else {
          updateBlockContent(block.id, html);
        }
        el.dataset.empty = isEmptyHtml(html) ? "true" : "false";
      },
      notify: notifyMarks,
    });
  };

  const persistHtml = (html: string) => {
    const normalized = normalizeEmptyHtml(html);
    skipSync.current = true;
    if (onHtmlChange) {
      onHtmlChange(normalized);
    } else {
      updateBlockContent(block.id, normalized);
    }
    if (ref.current) {
      ref.current.dataset.empty = isEmptyHtml(normalized) ? "true" : "false";
    }
  };

  const syncSlash = (html: string) => {
    if (!onSlashQueryChange) return;
    const plain = htmlToPlainText(html);
    if (plain.startsWith("/")) {
      onSlashQueryChange(plain.slice(1));
    } else {
      onSlashQueryChange(null);
    }
  };

  const onInput = (event: FormEvent<HTMLDivElement>) => {
    const html = event.currentTarget.innerHTML;
    persistHtml(html);
    syncSlash(html);
    notifyMarks();
  };

  const caretAtStart = (el: HTMLElement): boolean => {
    const sel = window.getSelection();
    if (!sel || !sel.isCollapsed || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0);
    const pre = document.createRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.startContainer, range.startOffset);
    return pre.toString().length === 0;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const el = event.currentTarget;

    if (event.key === "Enter" && !event.shiftKey) {
      if (softBreakOnEnter) return;
      event.preventDefault();

      if (onEnter?.()) {
        onSlashQueryChange?.(null);
        return;
      }

      const { before, after } = splitHtmlAtCaret(el);
      const newId = splitBlock(block.documentId, block.id, before, after);
      onSlashQueryChange?.(null);
      onRequestFocus(newId, 0);
      return;
    }

    if (event.key === "Backspace" && caretAtStart(el)) {
      if (onBackspaceAtStart?.()) {
        event.preventDefault();
        onSlashQueryChange?.(null);
        return;
      }

      if (onHtmlChange) return;

      const merged = mergeWithPrevious(block.documentId, block.id);
      if (!merged) return;
      event.preventDefault();
      onSlashQueryChange?.(null);
      onRequestFocus(merged.previousBlockId, merged.caretOffset);
    }
  };

  return (
    <div
      ref={ref}
      role="textbox"
      aria-multiline="true"
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      data-empty={isEmptyHtml(sourceHtml) ? "true" : "false"}
      onFocus={() => {
        onFocused();
        notifyMarks();
      }}
      onBlur={() => {
        if (getActiveTextEditor()?.blockId === block.id) {
          registerActiveTextEditor(null);
        }
      }}
      onMouseUp={notifyMarks}
      onKeyUp={notifyMarks}
      onInput={onInput}
      onKeyDown={onKeyDown}
      className={`rich-text-block block w-full leading-7 text-slate-800 outline-none data-[empty=true]:before:pointer-events-none data-[empty=true]:before:text-slate-400 data-[empty=true]:before:content-[attr(data-placeholder)] ${className}`}
    />
  );
}
