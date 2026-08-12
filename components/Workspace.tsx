"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDocumentStore } from "@/lib/document-store";
import {
  FIXED_COLUMN_WIDTH_PX,
  clampColumnWidth,
  isScrollColumnLayout,
} from "@/lib/layout";
import { DocumentColumn } from "./DocumentColumn";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function Workspace() {
  const { snapshot, hydrated, createRootDocument, buildPathTo } =
    useDocumentStore();

  const [path, setPath] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [focusDocId, setFocusDocId] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
  const sidebarOpenRef = useRef(sidebarOpen);
  const sidebarPrefRef = useRef(true);
  const wasScrollLayoutRef = useRef(false);
  const scrollBoardRef = useRef<HTMLDivElement | null>(null);

  sidebarOpenRef.current = sidebarOpen;

  useEffect(() => {
    if (!hydrated) return;

    setPath((prev) => {
      if (prev.length === 0) {
        const firstRoot = snapshot.rootDocumentIds[0];
        return firstRoot ? [firstRoot] : [];
      }

      const stillValid = prev.every((id) => {
        const doc = snapshot.documents[id];
        return Boolean(doc && doc.deletedAt === null);
      });
      if (!stillValid) {
        const fallback = snapshot.rootDocumentIds[0];
        return fallback ? [fallback] : [];
      }

      for (let i = 1; i < prev.length; i++) {
        const doc = snapshot.documents[prev[i]];
        if (!doc || doc.deletedAt) {
          return prev.slice(0, i);
        }
        const parentBlockId = doc.parentBlockId;
        if (!parentBlockId) {
          return prev.slice(0, i);
        }
        const parentBlock = snapshot.blocks[parentBlockId];
        if (!parentBlock || parentBlock.documentId !== prev[i - 1]) {
          return prev.slice(0, i);
        }
        if (parentBlock.linkedDocumentId !== prev[i]) {
          return prev.slice(0, i);
        }
      }

      return prev;
    });
  }, [hydrated, snapshot]);

  // Drop focus if the focused doc left the open path.
  useEffect(() => {
    if (focusDocId && !path.includes(focusDocId)) {
      setFocusDocId(null);
    }
  }, [focusDocId, path]);

  const columnCount = path.length;
  const scrollLayout = isScrollColumnLayout(columnCount);
  const isFocused = Boolean(focusDocId && path.includes(focusDocId));

  // Auto-hide sidebar when entering 3+ columns; restore preference when leaving.
  // Skip while focused — full view should keep current chrome.
  useEffect(() => {
    if (isFocused) return;

    if (scrollLayout && !wasScrollLayoutRef.current) {
      sidebarPrefRef.current = sidebarOpenRef.current;
      setSidebarOpen(false);
    } else if (!scrollLayout && wasScrollLayoutRef.current) {
      setSidebarOpen(sidebarPrefRef.current);
    }
    wasScrollLayoutRef.current = scrollLayout;
  }, [scrollLayout, isFocused]);

  // Keep the newest column in view under horizontal scroll.
  useEffect(() => {
    if (isFocused || !scrollLayout || !scrollBoardRef.current) return;
    const board = scrollBoardRef.current;
    board.scrollTo({ left: board.scrollWidth, behavior: "smooth" });
  }, [scrollLayout, columnCount, isFocused]);

  const openLinked = useCallback((fromColumnIndex: number, docId: string) => {
    // Exit focus so the new column is visible in the multi-doc board.
    setFocusDocId(null);
    setPath((prev) => prev.slice(0, fromColumnIndex + 1).concat(docId));
  }, []);

  const closeFrom = useCallback((columnIndex: number) => {
    setFocusDocId(null);
    setPath((prev) => prev.slice(0, Math.max(1, columnIndex)));
  }, []);

  const selectDocument = useCallback(
    (documentId: string) => {
      setFocusDocId(null);
      const nextPath = buildPathTo(documentId);
      if (nextPath && nextPath.length > 0) {
        setPath(nextPath);
        return;
      }
      if (snapshot.documents[documentId]) {
        setPath([documentId]);
      }
    },
    [buildPathTo, snapshot.documents],
  );

  const handleCreateDocument = useCallback(
    (folderId: string | null = null) => {
      setFocusDocId(null);
      const id = createRootDocument("Untitled", folderId);
      setPath([id]);
    },
    [createRootDocument],
  );

  const selectPathIndex = useCallback((index: number) => {
    setFocusDocId(null);
    setPath((prev) => prev.slice(0, index + 1));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((open) => {
      const next = !open;
      if (!isScrollColumnLayout(path.length)) {
        sidebarPrefRef.current = next;
      }
      return next;
    });
  }, [path.length]);

  const enterFocus = useCallback((docId: string) => {
    setFocusDocId(docId);
  }, []);

  const exitFocus = useCallback(() => {
    setFocusDocId(null);
  }, []);

  const resizeColumn = useCallback((columnIndex: number, widthPx: number) => {
    setColumnWidths((prev) => ({
      ...prev,
      [columnIndex]: clampColumnWidth(widthPx),
    }));
  }, []);

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        Loading workspace…
      </div>
    );
  }

  const activeDocId = path[path.length - 1] ?? null;
  const layout = isFocused ? "focus" : scrollLayout ? "fixed" : "equal";
  const canFocus = path.length > 1;
  const focusedIndex = focusDocId ? path.indexOf(focusDocId) : -1;

  return (
    <div className="flex min-h-0 flex-1">
      <Sidebar
        open={sidebarOpen}
        activeDocId={activeDocId}
        onSelectDocument={selectDocument}
        onCreateDocument={handleCreateDocument}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          path={path}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          onSelectPathIndex={selectPathIndex}
          onCreateDocument={() => handleCreateDocument(null)}
        />

        <div
          ref={scrollBoardRef}
          className="relative min-h-0 flex-1 overflow-x-auto overflow-y-hidden"
        >
          {path.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="font-serif text-xl text-slate-800">No documents yet</p>
              <p className="max-w-sm text-sm text-slate-500">
                Create a document to start writing. Link any block to open a
                sub-document beside it.
              </p>
              <button
                type="button"
                onClick={() => handleCreateDocument(null)}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Create document
              </button>
            </div>
          ) : isFocused && focusDocId ? (
            <div className="flex h-full w-full justify-center px-3 py-3 sm:px-5">
              <DocumentColumn
                key={`focus-${focusDocId}`}
                docId={focusDocId}
                columnIndex={Math.max(0, focusedIndex)}
                columnCount={1}
                layout="focus"
                isLast
                isFocused
                canFocus={false}
                openLinkedDocId={
                  focusedIndex >= 0 ? path[focusedIndex + 1] : undefined
                }
                onOpenLinked={openLinked}
                onCloseFrom={closeFrom}
                onEnterFocus={enterFocus}
                onExitFocus={exitFocus}
              />
            </div>
          ) : scrollLayout ? (
            <div className="flex h-full min-h-0 w-max">
              {path.map((docId, index) => (
                <DocumentColumn
                  key={`${docId}-${index}`}
                  docId={docId}
                  columnIndex={index}
                  columnCount={columnCount}
                  layout={layout}
                  widthPx={columnWidths[index] ?? FIXED_COLUMN_WIDTH_PX}
                  isLast={index === path.length - 1}
                  isFocused={false}
                  canFocus={canFocus}
                  openLinkedDocId={path[index + 1]}
                  onOpenLinked={openLinked}
                  onCloseFrom={closeFrom}
                  onEnterFocus={enterFocus}
                  onExitFocus={exitFocus}
                  onResizeWidth={resizeColumn}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full w-full justify-center px-3 py-3 sm:px-5">
              <div
                className="flex h-full min-h-0"
                style={{
                  width:
                    columnCount === 1 ? "min(720px, 100%)" : "min(100%, 1400px)",
                  maxWidth: "100%",
                }}
              >
                {path.map((docId, index) => (
                  <DocumentColumn
                    key={`${docId}-${index}`}
                    docId={docId}
                    columnIndex={index}
                    columnCount={columnCount}
                    layout={layout}
                    widthPx={columnWidths[index]}
                    isLast={index === path.length - 1}
                    isFocused={false}
                    canFocus={canFocus}
                    openLinkedDocId={path[index + 1]}
                    onOpenLinked={openLinked}
                    onCloseFrom={closeFrom}
                    onEnterFocus={enterFocus}
                    onExitFocus={exitFocus}
                    onResizeWidth={
                      columnCount > 1 ? resizeColumn : undefined
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
