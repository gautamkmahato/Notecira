"use client";

import { useSyncExternalStore } from "react";
import type { CanvasElement } from "./types";
import type { CanvasTool } from "./types";

export type ActiveCanvasApi = {
  blockId: string;
  tool: CanvasTool;
  setTool: (tool: CanvasTool) => void;
  deleteSelected: () => void;
  selectedId: string | null;
  selectedIds: string[];
  getSelectedElement: () => CanvasElement | null;
  patchSelected: (patch: Partial<CanvasElement>) => void;
  beginTextEdit: (elementId?: string) => void;
  openImagePicker: () => void;
};

let active: ActiveCanvasApi | null = null;
let revision = 0;
const listeners = new Set<() => void>();

function notify() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

export function registerActiveCanvas(api: ActiveCanvasApi | null) {
  active = api;
  notify();
}

export function getActiveCanvas() {
  return active;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getRevisionSnapshot() {
  return revision;
}

export function useActiveCanvas(blockId: string | null) {
  useSyncExternalStore(subscribe, getRevisionSnapshot, () => 0);

  if (!blockId || !active || active.blockId !== blockId) {
    return null;
  }

  return { api: active };
}
