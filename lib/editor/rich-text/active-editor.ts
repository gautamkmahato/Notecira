"use client";

import { useSyncExternalStore } from "react";
import type { BlockAttrs } from "@/lib/domain/types";
import {
  applyInlineCommand,
  emptyInlineState,
  FONT_SIZE_PX,
  queryInlineState,
  type InlineMarkState,
} from "./marks";

export type ActiveTextEditorHandle = {
  blockId: string;
  root: HTMLElement;
  /** Persist current HTML to the correct store field (content or list item). */
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
  return queryInlineState();
}

export type InlineFormatApi = {
  available: boolean;
  state: InlineMarkState;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  setColor: (color: string) => void;
  setFontSize: (size: NonNullable<BlockAttrs["fontSize"]>) => void;
};

export function buildInlineFormatApi(
  blockId: string | null,
  state: InlineMarkState,
): InlineFormatApi {
  const available = Boolean(active && blockId && active.blockId === blockId);

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
    setFontSize: (size) =>
      run(() =>
        applyInlineCommand(
          getActiveTextEditor()!.root,
          "fontSize",
          FONT_SIZE_PX[size],
        ),
      ),
  };
}
