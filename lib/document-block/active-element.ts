"use client";

import { useSyncExternalStore } from "react";
import type { DocumentInsertableType } from "./types";

export type ActiveDocElementHandle = {
  blockId: string;
  elementId: string;
  root: HTMLElement;
  persist: () => void;
  notify: () => void;
};

type InsertRequest = {
  blockId: string;
  type: DocumentInsertableType;
};

type Listener = () => void;

let active: ActiveDocElementHandle | null = null;
let revision = 0;
let insertRequest: InsertRequest | null = null;
let insertRevision = 0;
const listeners = new Set<Listener>();

function emit() {
  revision += 1;
  insertRevision += 1;
  listeners.forEach((listener) => listener());
}

export function registerActiveDocElement(
  handle: ActiveDocElementHandle | null,
) {
  active = handle;
  emit();
}

export function getActiveDocElement(): ActiveDocElementHandle | null {
  return active;
}

export function requestDocumentElementInsert(
  blockId: string,
  type: DocumentInsertableType,
) {
  insertRequest = { blockId, type };
  emit();
}

export function consumeDocumentElementInsert(
  blockId: string,
): InsertRequest | null {
  if (!insertRequest || insertRequest.blockId !== blockId) return null;
  const request = insertRequest;
  insertRequest = null;
  return request;
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return revision;
}

function getInsertSnapshot() {
  return insertRevision;
}

export function useActiveDocElementRevision(): number {
  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}

export function useDocumentElementInsertRevision(): number {
  return useSyncExternalStore(subscribe, getInsertSnapshot, () => 0);
}
