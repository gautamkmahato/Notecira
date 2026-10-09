"use client";

import { useSyncExternalStore } from "react";
import {
  clampFontSizePx,
  DEFAULT_FONT_SIZE_PX,
  parseFontSizePx,
} from "@/lib/editor/rich-text/font-size";
import { DEFAULT_FONT_FAMILY } from "@/lib/editor/rich-text/font-family";
import {
  emptyInlineState,
  type InlineMarkState,
} from "@/lib/editor/rich-text/marks";
import type { InlineFormatApi } from "@/lib/editor/rich-text/active-editor";
import { registerActiveTextEditor } from "@/lib/editor/rich-text/active-editor";
import {
  applyBold,
  applyBulletList,
  applyCode,
  applyFontFamily,
  applyFontSize,
  applyHeading1,
  applyHeading3,
  applyItalic,
  applyOrderedList,
  applyTable,
  applyTextColor,
  applyUnderline,
} from "./format";
import { readSelection } from "./selection";

export type MarkdownEditorHandle = {
  blockId: string;
  textarea: HTMLTextAreaElement;
  getContent: () => string;
  setContent: (content: string) => void;
  notify: () => void;
};

export type MarkdownBlockFormatApi = {
  available: boolean;
  applyHeading1: () => void;
  applyHeading3: () => void;
  applyCode: () => void;
  applyTable: () => void;
  applyBulletList: () => void;
  applyOrderedList: () => void;
};

type Listener = () => void;

let active: MarkdownEditorHandle | null = null;
let revision = 0;
const listeners = new Set<Listener>();

function emit() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getRevision() {
  return revision;
}

export function registerActiveMarkdownEditor(handle: MarkdownEditorHandle | null) {
  active = handle;
  registerActiveTextEditor(null);
  emit();
}

export function getActiveMarkdownEditor(): MarkdownEditorHandle | null {
  return active;
}

export function notifyMarkdownToolbar() {
  emit();
}

function queryMarkdownInlineState(handle: MarkdownEditorHandle): InlineMarkState {
  const content = handle.getContent();
  const { start, end } = readSelection(handle.textarea);
  const selected = content.slice(start, end);

  const before = content.slice(Math.max(0, start - 2), start);
  const after = content.slice(end, end + 2);

  const bold =
    (selected.startsWith("**") && selected.endsWith("**")) ||
    before.endsWith("**") ||
    after.startsWith("**");
  const italic =
    (selected.startsWith("*") &&
      selected.endsWith("*") &&
      !selected.startsWith("**")) ||
    (before.endsWith("*") && !before.endsWith("**"));
  const underline =
    selected.startsWith("<u>") && selected.endsWith("</u>");

  return {
    bold,
    italic,
    underline,
    color: null,
    fontFamily: null,
    fontSizePx: null,
  };
}

function applyFormat(
  handle: MarkdownEditorHandle,
  transform: (
    content: string,
    selection: ReturnType<typeof readSelection>,
  ) => { content: string; selection: { start: number; end: number } },
) {
  const selection = readSelection(handle.textarea);
  const result = transform(handle.getContent(), selection);
  handle.setContent(result.content);
  requestAnimationFrame(() => {
    handle.textarea.focus();
    handle.textarea.setSelectionRange(
      result.selection.start,
      result.selection.end,
    );
    handle.notify();
    emit();
  });
}

export function buildMarkdownFormatApi(
  blockId: string | null,
): InlineFormatApi & MarkdownBlockFormatApi {
  const available = Boolean(active && blockId && active.blockId === blockId);
  const handle = available ? active! : null;
  const state = handle ? queryMarkdownInlineState(handle) : emptyInlineState();

  const run = (
    transform: (
      content: string,
      selection: ReturnType<typeof readSelection>,
    ) => { content: string; selection: { start: number; end: number } },
  ) => {
    if (!handle) return;
    applyFormat(handle, transform);
  };

  return {
    available,
    state,
    toggleBold: () => run(applyBold),
    toggleItalic: () => run(applyItalic),
    toggleUnderline: () => run(applyUnderline),
    setColor: (color) => run((content, selection) => applyTextColor(content, selection, color)),
    setFontFamily: (fontFamily) =>
      run((content, selection) => applyFontFamily(content, selection, fontFamily)),
    setFontSizePx: (px) =>
      run((content, selection) =>
        applyFontSize(content, selection, clampFontSizePx(px)),
      ),
    applyHeading1: () => run(applyHeading1),
    applyHeading3: () => run(applyHeading3),
    applyCode: () => run(applyCode),
    applyTable: () => run(applyTable),
    applyBulletList: () => run(applyBulletList),
    applyOrderedList: () => run(applyOrderedList),
  };
}

export function emptyMarkdownFormatApi(): InlineFormatApi &
  MarkdownBlockFormatApi {
  return {
    available: false,
    state: emptyInlineState(),
    toggleBold: () => {},
    toggleItalic: () => {},
    toggleUnderline: () => {},
    setColor: () => {},
    setFontFamily: () => {},
    setFontSizePx: () => {},
    applyHeading1: () => {},
    applyHeading3: () => {},
    applyCode: () => {},
    applyTable: () => {},
    applyBulletList: () => {},
    applyOrderedList: () => {},
  };
}

export function useMarkdownMarkState(blockId: string | null): InlineMarkState {
  useSyncExternalStore(subscribe, getRevision, () => 0);
  if (!active || !blockId || active.blockId !== blockId) {
    return emptyInlineState();
  }
  return queryMarkdownInlineState(active);
}

export { DEFAULT_FONT_SIZE_PX, DEFAULT_FONT_FAMILY, parseFontSizePx };
