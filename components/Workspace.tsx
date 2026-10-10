"use client";

import { notionBtnPrimary, scrollbarDocument, scrollbarCustom } from "@/lib/ui/notion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDocumentStore } from "@/lib/document-store";
import { useActiveBlockSelection } from "@/lib/editor/active-block";
import {
  FIXED_COLUMN_WIDTH_PX,
  clampColumnWidth,
  isScrollColumnLayout,
} from "@/lib/layout";
import { DocumentColumn } from "./DocumentColumn";
import { CanvasScrollControls } from "./CanvasScrollControls";
import { FormatToolbar } from "./editor/FormatToolbar";
import { DocumentFormatToolbar } from "./document-block/DocumentFormatToolbar";
import { MarkdownFormatToolbar } from "./markdown-block/MarkdownFormatToolbar";
import { CanvasFormatToolbar } from "./canvas-block/CanvasFormatToolbar";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function Workspace() {
  const { snapshot, hydrated, createRootDocument, buildPathTo } =
    useDocumentStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const openedFromQueryRef = useRef<string | null>(null);

  const [path, setPath] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [focusDocId, setFocusDocId] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
  const [isDocumentEditing, setIsDocumentEditing] = useState(false);
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

  useEffect(() => {
    if (!hydrated) return;
    const docId = searchParams.get("doc")?.trim();
    if (!docId || openedFromQueryRef.current === docId) return;
    const doc = snapshot.documents[docId];
    if (!doc || doc.deletedAt) {
      router.replace("/documents", { scroll: false });
      return;
    }
    openedFromQueryRef.current = docId;
    selectDocument(docId);
    router.replace("/documents", { scroll: false });
  }, [hydrated, searchParams, snapshot.documents, selectDocument, router]);

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

  const activeBlock = useActiveBlockSelection();
  const getBlock = useDocumentStore((s) => s.getBlock);
  const activeDocIdForEffect = path[path.length - 1] ?? null;

  useEffect(() => {
    setIsDocumentEditing(false);
  }, [activeDocIdForEffect]);

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
        Loading workspace…
      </div>
    );
  }

  const activeDocId = activeDocIdForEffect;

  const toolbarBlockId =
    activeBlock?.docId && path.includes(activeBlock.docId)
      ? activeBlock.blockId
      : null;
  const toolbarBlock = toolbarBlockId ? getBlock(toolbarBlockId) : undefined;
  const isDocumentToolbar = toolbarBlock?.type === "document";
  const isMarkdownToolbar = toolbarBlock?.type === "markdown";
  const isCanvasToolbar = toolbarBlock?.type === "canvas";
  const centerToolbar =
    path.length > 0 && toolbarBlockId
      ? isDocumentToolbar
        ? <DocumentFormatToolbar blockId={toolbarBlockId} embedded />
        : isMarkdownToolbar
          ? <MarkdownFormatToolbar blockId={toolbarBlockId} embedded />
          : isCanvasToolbar
            ? <CanvasFormatToolbar blockId={toolbarBlockId} embedded />
            : <FormatToolbar blockId={toolbarBlockId} embedded />
      : null;
  const layout = isFocused ? "focus" : scrollLayout ? "fixed" : "equal";
  const documentScrollClass = `${scrollbarDocument} ${scrollbarCustom} h-full min-h-0 flex-1 overflow-y-auto overflow-x-auto bg-[var(--color-white)]`;
  const documentContentClass =
    "w-full min-h-[calc(100dvh-3.5rem)] pl-12 pr-4 pt-[2.1rem]";
  const canFocus = path.length > 1;
  const focusedIndex = focusDocId ? path.indexOf(focusDocId) : -1;

  return (
    <div className="flex h-full min-h-0 flex-1">
      <Sidebar
        open={sidebarOpen}
        activeDocId={activeDocId}
        onSelectDocument={selectDocument}
        onCreateDocument={handleCreateDocument}
      />

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--color-white)]">
        <Topbar
          path={path}
          activeDocId={activeDocId}
          sidebarOpen={sidebarOpen}
          isDocumentEditing={isDocumentEditing}
          onToggleDocumentEditing={() =>
            setIsDocumentEditing((value) => !value)
          }
          onToggleSidebar={toggleSidebar}
          onSelectPathIndex={selectPathIndex}
          centerToolbar={centerToolbar}
        />

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <CanvasScrollControls
            scrollRef={scrollBoardRef}
            enabled={path.length > 1 && !isFocused}
          />
          <div ref={scrollBoardRef} className={documentScrollClass}>
          {path.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-[var(--font-size-xl)] font-medium text-[var(--color-dark-gray-2)]">No documents yet</p>
              <p className="max-w-sm text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
                Create a document to start writing. Link any block to open a
                sub-document beside it.
              </p>
              <button
                type="button"
                onClick={() => handleCreateDocument(null)}
                className={notionBtnPrimary}
              >
                Create document
              </button>
            </div>
          ) : isFocused && focusDocId ? (
            <div className={documentContentClass}>
              <DocumentColumn
                key={`focus-${focusDocId}`}
                docId={focusDocId}
                columnIndex={Math.max(0, focusedIndex)}
                columnCount={1}
                layout="focus"
                isLast
                isFocused
                canFocus={false}
                editable={isDocumentEditing}
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
            <div className={`flex w-max gap-4 ${documentContentClass}`}>
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
                  editable={isDocumentEditing}
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
            <div className={documentContentClass}>
              <div className="flex w-full gap-4">
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
                    editable={isDocumentEditing}
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
    </div>
  );
}
