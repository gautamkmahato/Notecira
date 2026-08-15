"use client";

import { useSyncExternalStore } from "react";
import {
  clampFontSizePx,
  DEFAULT_FONT_SIZE_PX,
  parseFontSizePx,
} from "./font-size";
import { DEFAULT_FONT_FAMILY } from "./font-family";
import {
  applyInlineCommand,
  emptyInlineState,
  queryInlineState,
  type InlineMarkState,
} from "./marks";

export type ActiveTextEditorHandle = {
  blockId: string;
  root: HTMLElement;
  persist: () => void;
  notify: () => void;
};

type Listener = () => void;

let active: ActiveTextEditorHandle | null = null;
let revision = 0;
const listeners = new Set<Listener>();

function emit() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

export function registerActiveTextEditor(handle: ActiveTextEditorHandle | null) {
  active = handle;
  emit();
}

export function getActiveTextEditor(): ActiveTextEditorHandle | null {
  return active;
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getRevision() {
  return revision;
}

export function useActiveTextEditor(): ActiveTextEditorHandle | null {
  useSyncExternalStore(subscribe, getRevision, () => 0);
  return active;
}

export function useInlineMarkState(blockId: string | null): InlineMarkState {
  useSyncExternalStore(subscribe, getRevision, () => 0);
  if (!active || !blockId || active.blockId !== blockId) {
    return emptyInlineState();
  }
  return queryInlineState(active.root);
}

export type InlineFormatApi = {
  available: boolean;
  state: InlineMarkState;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  setColor: (color: string) => void;
  setFontFamily: (fontFamily: string) => void;
  setFontSizePx: (px: number) => void;
};

export function buildInlineFormatApi(blockId: string | null): InlineFormatApi {
  const available = Boolean(active && blockId && active.blockId === blockId);
  const state = available ? queryInlineState(active!.root) : emptyInlineState();

  const run = (fn: () => void) => {
    const current = getActiveTextEditor();
    if (!current || !blockId || current.blockId !== blockId) return;
    fn();
    current.persist();
    current.notify();
    emit();
  };

  return {
    available,
    state,
    toggleBold: () =>
      run(() => applyInlineCommand(getActiveTextEditor()!.root, "bold")),
    toggleItalic: () =>
      run(() => applyInlineCommand(getActiveTextEditor()!.root, "italic")),
    toggleUnderline: () =>
      run(() => applyInlineCommand(getActiveTextEditor()!.root, "underline")),
    setColor: (color) =>
      run(() =>
        applyInlineCommand(getActiveTextEditor()!.root, "foreColor", color),
      ),
    setFontFamily: (fontFamily) =>
      run(() =>
        applyInlineCommand(getActiveTextEditor()!.root, "fontFamily", fontFamily),
      ),
    setFontSizePx: (px) =>
      run(() =>
        applyInlineCommand(
          getActiveTextEditor()!.root,
          "fontSize",
          `${clampFontSizePx(px)}px`,
        ),
      ),
  };
}

export function emptyInlineFormatApi(): InlineFormatApi {
  return {
    available: false,
    state: emptyInlineState(),
    toggleBold: () => {},
    toggleItalic: () => {},
    toggleUnderline: () => {},
    setColor: () => {},
    setFontFamily: () => {},
    setFontSizePx: () => {},
  };
}

export function notifyInlineToolbar() {
  emit();
}

export { DEFAULT_FONT_SIZE_PX, DEFAULT_FONT_FAMILY, parseFontSizePx };
