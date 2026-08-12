"use client";

import { useSyncExternalStore } from "react";
import type { Editor } from "@tiptap/react";
import type { BlockAttrs } from "@/lib/domain/types";
import { FONT_SIZE_MAP, type FontSizeToken } from "./font-size";

export type TipTapMarkState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string | null;
  fontSize: FontSizeToken | null;
};

export type ActiveTipTapHandle = {
  blockId: string;
  editor: Editor;
};

type Listener = () => void;

let active: ActiveTipTapHandle | null = null;
let revision = 0;
const listeners = new Set<Listener>();

function emit() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

/**
 * Register the focused TipTap instance for the format toolbar.
 * Do not clear on blur — toolbar buttons use mousedown preventDefault,
 * and clearing on blur would make TipTap commands no-ops.
 */
export function registerActiveTipTap(handle: ActiveTipTapHandle | null) {
  if (
    handle &&
    active &&
    active.blockId === handle.blockId &&
    active.editor === handle.editor
  ) {
    emit();
    return;
  }
  active = handle;
  emit();
}

export function clearActiveTipTap(editor?: Editor) {
  if (!active) return;
  if (editor && active.editor !== editor) return;
  active = null;
  emit();
}

export function getActiveTipTap(): ActiveTipTapHandle | null {
  return active;
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getRevision() {
  return revision;
}

export function useActiveTipTap(blockId: string | null): Editor | null {
  useSyncExternalStore(subscribe, getRevision, () => 0);
  if (!active || !blockId || active.blockId !== blockId) return null;
  return active.editor;
}

export function queryTipTapMarks(editor: Editor | null): TipTapMarkState {
  if (!editor || editor.isDestroyed) {
    return {
      bold: false,
      italic: false,
      underline: false,
      color: null,
      fontSize: null,
    };
  }

  const color = (editor.getAttributes("textStyle").color as string) || null;
  const fontSizePx =
    (editor.getAttributes("textStyle").fontSize as string) || null;
  const fontSize =
    (Object.entries(FONT_SIZE_MAP).find(([, px]) => px === fontSizePx)?.[0] as
      | FontSizeToken
      | undefined) ?? null;

  return {
    bold: editor.isActive("bold"),
    italic: editor.isActive("italic"),
    underline: editor.isActive("underline"),
    color,
    fontSize,
  };
}

export type TipTapFormatApi = {
  available: boolean;
  state: TipTapMarkState;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  setColor: (color: string) => void;
  setFontSize: (size: NonNullable<BlockAttrs["fontSize"]>) => void;
};

export function buildTipTapFormatApi(
  blockId: string | null,
  editor: Editor | null,
): TipTapFormatApi {
  const usable = Boolean(editor && blockId && !editor.isDestroyed);
  const state = queryTipTapMarks(editor);

  const run = (fn: (ed: Editor) => void) => {
    if (!editor || editor.isDestroyed) return;
    fn(editor);
    emit();
  };

  return {
    available: usable,
    state,
    toggleBold: () =>
      run((ed) => ed.chain().focus().toggleBold().run()),
    toggleItalic: () =>
      run((ed) => ed.chain().focus().toggleItalic().run()),
    toggleUnderline: () =>
      run((ed) => ed.chain().focus().toggleUnderline().run()),
    setColor: (color) =>
      run((ed) => ed.chain().focus().setColor(color).run()),
    setFontSize: (size) =>
      run((ed) =>
        ed.chain().focus().setFontSize(FONT_SIZE_MAP[size]).run(),
      ),
  };
}

export function emptyTipTapFormatApi(): TipTapFormatApi {
  return {
    available: false,
    state: {
      bold: false,
      italic: false,
      underline: false,
      color: null,
      fontSize: null,
    },
    toggleBold: () => {},
    toggleItalic: () => {},
    toggleUnderline: () => {},
    setColor: () => {},
    setFontSize: () => {},
  };
}

export function notifyTipTapToolbar() {
  emit();
}
