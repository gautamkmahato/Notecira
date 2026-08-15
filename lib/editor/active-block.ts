"use client";

import { useSyncExternalStore } from "react";

export type ActiveBlockSelection = {
  docId: string;
  blockId: string | null;
  editable: boolean;
};

type Listener = () => void;

let active: ActiveBlockSelection | null = null;
let revision = 0;
const listeners = new Set<Listener>();

function emit() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

export function registerActiveBlock(selection: ActiveBlockSelection | null) {
  active = selection;
  emit();
}

export function clearActiveBlockIfDoc(docId: string) {
  if (active?.docId === docId) {
    active = null;
    emit();
  }
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getRevision() {
  return revision;
}

export function useActiveBlockSelection(): ActiveBlockSelection | null {
  useSyncExternalStore(subscribe, getRevision, () => 0);
  return active;
}
