"use client";

import {
  useEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  getActiveDocElement,
  registerActiveDocElement,
} from "@/lib/document-block/active-element";
import { registerActiveTextEditor } from "@/lib/editor/rich-text/active-editor";
import {
  ensureEditableHtml,
  htmlToPlainText,
  isEmptyHtml,
  normalizeEmptyHtml,
} from "@/lib/editor/rich-text/html";
import { setCaretPlainOffset, splitHtmlAtCaret } from "@/lib/editor/rich-text/marks";
import type { DocElementEditorProps } from "./types";

type DocTextElementProps = DocElementEditorProps & {
  className?: string;
  placeholder?: string;
  splitOnEnter?: boolean;
};

function caretAtStart(el: HTMLElement): boolean {
  const sel = window.getSelection();
  if (!sel || !sel.isCollapsed || sel.rangeCount === 0) return false;
  const range = sel.getRangeAt(0);
  const pre = document.createRange();
  pre.selectNodeContents(el);
  pre.setEnd(range.startContainer, range.startOffset);
  return pre.toString().length === 0;
}

function caretAtEnd(el: HTMLElement): boolean {
  const sel = window.getSelection();
  if (!sel || !sel.isCollapsed || sel.rangeCount === 0) return false;
  const range = sel.getRangeAt(0);
  const post = document.createRange();
  post.selectNodeContents(el);
  post.setStart(range.endContainer, range.endOffset);
  return post.toString().length === 0;
}

export function DocTextElement({
  blockId,
  element,
  editable,
  autofocus,
  caret,
  className = "",
  placeholder = "",
  splitOnEnter = true,
  onFocused,
  onAutofocusHandled,
  onContentChange,
  onInsertAfter,
  onSplitAfter,
  onBackspaceAtStart,
}: DocTextElementProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const skipSync = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }
    if (document.activeElement === el) return;
    const next = ensureEditableHtml(element.content);
    if (el.innerHTML !== next) {
      el.innerHTML = next;
    }
    el.dataset.empty = isEmptyHtml(next) ? "true" : "false";
  }, [element.content, element.id]);

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
    registerEditor(el);
    onAutofocusHandled?.();
  }, [autofocus, caret, editable, onAutofocusHandled]);

  const persistFromEl = (el: HTMLElement) => {
    const inner = normalizeEmptyHtml(el.innerHTML);
    skipSync.current = true;
    onContentChange(element.id, inner);
    el.dataset.empty = isEmptyHtml(inner) ? "true" : "false";
  };

  const registerEditor = (el: HTMLElement) => {
    const handle = {
      blockId,
      elementId: element.id,
      root: el,
      persist: () => persistFromEl(el),
      notify: () => registerEditor(el),
    };
    registerActiveDocElement(handle);
    registerActiveTextEditor({
      blockId,
      root: el,
      persist: () => persistFromEl(el),
      notify: () => registerEditor(el),
    });
  };

  const onInput = (event: FormEvent<HTMLDivElement>) => {
    if (!editable) return;
    persistFromEl(event.currentTarget);
    registerEditor(event.currentTarget);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!editable) return;
    const el = event.currentTarget;

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (splitOnEnter && !caretAtEnd(el)) {
        const { before, after } = splitHtmlAtCaret(el);
        skipSync.current = true;
        onContentChange(element.id, before);
        el.innerHTML = ensureEditableHtml(before);
        el.dataset.empty = isEmptyHtml(before) ? "true" : "false";
        onSplitAfter(element.id, before, after);
        return;
      }
      onInsertAfter(element.id);
      return;
    }

    if (event.key === "Backspace" && caretAtStart(el)) {
      event.preventDefault();
      onBackspaceAtStart(element.id);
    }
  };

  return (
    <div
      ref={ref}
      role="textbox"
      aria-multiline="true"
      contentEditable={editable}
      suppressContentEditableWarning
      data-placeholder={placeholder || undefined}
      data-empty={isEmptyHtml(element.content) ? "true" : "false"}
      onFocus={() => {
        onFocused(element.id);
        if (ref.current) registerEditor(ref.current);
      }}
      onBlur={() => {
        if (getActiveDocElement()?.elementId === element.id) {
          registerActiveDocElement(null);
        }
        registerActiveTextEditor(null);
      }}
      onMouseUp={() => ref.current && registerEditor(ref.current)}
      onKeyUp={() => ref.current && registerEditor(ref.current)}
      onInput={onInput}
      onKeyDown={onKeyDown}
      className={`block w-full leading-7 text-[var(--color-dark-gray-2)] outline-none ${
        placeholder
          ? "data-[empty=true]:before:pointer-events-none data-[empty=true]:before:text-[var(--color-mid-gray)] data-[empty=true]:before:content-[attr(data-placeholder)]"
          : ""
      } ${className}`}
    />
  );
}
