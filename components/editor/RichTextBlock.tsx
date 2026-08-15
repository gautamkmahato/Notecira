"use client";

import {
  useEffect,
  useMemo,
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
  fromEditableHtml,
  toEditableHtml,
  type TextBlockMode,
} from "@/lib/editor/rich-text/editor-html";
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
  mode?: TextBlockMode;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  autofocus?: boolean;
  caret?: number;
  onFocused: () => void;
  onAutofocusHandled?: () => void;
  onRequestFocus: (blockId: string, caret?: number) => void;
  onSlashQueryChange?: (query: string | null) => void;
};

export function RichTextBlock({
  block,
  mode = "text",
  placeholder = "Press '/' for commands",
  className = "",
  editable = true,
  autofocus,
  caret,
  onFocused,
  onAutofocusHandled,
  onRequestFocus,
  onSlashQueryChange,
}: RichTextBlockProps) {
  const updateBlockContent = useDocumentStore((s) => s.updateBlockContent);
  const updateBlockAttrs = useDocumentStore((s) => s.updateBlockAttrs);
  const updateBlockType = useDocumentStore((s) => s.updateBlockType);
  const splitBlock = useDocumentStore((s) => s.splitBlock);
  const mergeWithPrevious = useDocumentStore((s) => s.mergeWithPrevious);
  const ref = useRef<HTMLDivElement | null>(null);
  const skipSync = useRef(false);
  const migrated = useRef(false);

  const isList = mode === "bulletList" || mode === "orderedList";

  const sourceHtml = useMemo(
    () => toEditableHtml(block.content, mode, block.attrs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [block.id, mode],
  );

  useEffect(() => {
    if (migrated.current || !isList) return;
    if (!Array.isArray(block.attrs.items) || block.attrs.items.length === 0) {
      return;
    }
    migrated.current = true;
    const html = fromEditableHtml(
      toEditableHtml(block.content, mode, block.attrs),
      mode,
    );
    skipSync.current = true;
    updateBlockContent(block.id, html);
    updateBlockAttrs(block.id, { items: undefined });
  }, [
    block.attrs.items,
    block.content,
    block.id,
    isList,
    mode,
    updateBlockAttrs,
    updateBlockContent,
  ]);

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
    if (!autofocus || !editable) return;
    const el = ref.current;
    if (!el) return;
    el.focus();
    if (typeof caret === "number") {
      setCaretPlainOffset(el, caret);
    } else {
      setCaretPlainOffset(el, htmlToPlainText(el.innerHTML).length);
    }
    registerActiveTextEditor({
      blockId: block.id,
      root: el,
      persist: () => persistFromEl(el),
      notify: () => registerMarks(el),
    });
    onAutofocusHandled?.();
  }, [autofocus, caret, editable, block.id, onAutofocusHandled]);

  const persistFromEl = (el: HTMLElement) => {
    const inner = normalizeEmptyHtml(el.innerHTML);
    skipSync.current = true;
    updateBlockContent(
      block.id,
      isList ? fromEditableHtml(inner, mode) : inner,
    );
    el.dataset.empty = isEmptyHtml(inner) ? "true" : "false";
  };

  const registerMarks = (el: HTMLElement) => {
    registerActiveTextEditor({
      blockId: block.id,
      root: el,
      persist: () => persistFromEl(el),
      notify: () => registerMarks(el),
    });
  };

  const syncSlash = (html: string) => {
    if (!onSlashQueryChange) return;
    const plain = htmlToPlainText(html);
    if (plain.startsWith("/")) onSlashQueryChange(plain.slice(1));
    else onSlashQueryChange(null);
  };

  const onInput = (event: FormEvent<HTMLDivElement>) => {
    if (!editable) return;
    const html = event.currentTarget.innerHTML;
    persistFromEl(event.currentTarget);
    syncSlash(html);
    registerMarks(event.currentTarget);
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

  const exitListToParagraph = () => {
    updateBlockType(block.id, "paragraph");
    updateBlockContent(block.id, "");
    updateBlockAttrs(block.id, { items: undefined });
    onSlashQueryChange?.(null);
    onRequestFocus(block.id, 0);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!editable) return;
    const el = event.currentTarget;

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (isList && isEmptyHtml(el.innerHTML)) {
        exitListToParagraph();
        return;
      }

      const { before, after } = splitHtmlAtCaret(el);
      const storedBefore = isList ? fromEditableHtml(before, mode) : before;
      const storedAfter = isList ? fromEditableHtml(after, mode) : after;
      const newId = splitBlock(
        block.documentId,
        block.id,
        storedBefore,
        storedAfter,
      );
      onSlashQueryChange?.(null);
      onRequestFocus(newId, 0);
      return;
    }

    if (event.key === "Backspace" && caretAtStart(el)) {
      if (isList && isEmptyHtml(el.innerHTML)) {
        event.preventDefault();
        exitListToParagraph();
        return;
      }

      const merged = mergeWithPrevious(block.documentId, block.id);
      if (!merged) return;
      event.preventDefault();
      onSlashQueryChange?.(null);
      onRequestFocus(merged.previousBlockId, merged.caretOffset);
    }
  };

  const listClass =
    mode === "orderedList"
      ? "list-decimal"
      : mode === "bulletList"
        ? "list-disc"
        : "";

  return (
    <div className={`rich-text-block w-full ${isList ? "ml-6" : ""}`} data-mode={mode}>
      <div
        ref={ref}
        role="textbox"
        aria-multiline="true"
        contentEditable={editable}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        data-empty={isEmptyHtml(sourceHtml) ? "true" : "false"}
        onFocus={() => {
          onFocused();
          if (ref.current) registerMarks(ref.current);
        }}
        onBlur={() => {
          if (getActiveTextEditor()?.blockId === block.id) {
            registerActiveTextEditor(null);
          }
        }}
        onMouseUp={() => ref.current && registerMarks(ref.current)}
        onKeyUp={() => ref.current && registerMarks(ref.current)}
        onInput={onInput}
        onKeyDown={onKeyDown}
        className={`block w-full leading-7 text-[var(--color-dark-gray-2)] outline-none data-[empty=true]:before:pointer-events-none data-[empty=true]:before:text-[var(--color-mid-gray)] data-[empty=true]:before:content-[attr(data-placeholder)] ${isList ? `list-item ${listClass}` : ""} ${className}`}
      />
    </div>
  );
}
