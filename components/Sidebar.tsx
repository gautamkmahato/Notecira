"use client";

import { useEffect, useRef, useState } from "react";
import { displayTitle, useDocumentStore } from "@/lib/document-store";
import type { SidebarDocNode, SidebarFolderNode } from "@/lib/domain/types";
import { DocumentTitleInput } from "./DocumentTitleInput";
import { FolderTitleInput } from "./FolderTitleInput";

type SidebarProps = {
  open: boolean;
  activeDocId: string | null;
  onSelectDocument: (documentId: string) => void;
  onCreateDocument: (folderId?: string | null) => void;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className={`inline-block text-[10px] text-slate-500 transition-transform duration-150 ${
        open ? "rotate-90" : ""
      }`}
      aria-hidden
    >
      ▶
    </span>
  );
}

function DocIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 text-slate-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M7 4h7l3 3v13H7z" />
      <path d="M14 4v4h4" />
    </svg>
  );
}

function DocActionsMenu({
  documentId,
  title,
  onDelete,
  onClose,
}: {
  documentId: string;
  title: string;
  onDelete: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-30 mt-1 min-w-[140px] rounded-md border border-slate-200 bg-white py-1 shadow-lg"
      role="menu"
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="block w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50"
      >
        Delete
      </button>
      <p className="sr-only">Actions for {title}</p>
    </div>
  );
}

function DocRow({
  node,
  activeDocId,
  onSelectDocument,
  expandedDocs,
  toggleDoc,
}: {
  node: SidebarDocNode;
  activeDocId: string | null;
  onSelectDocument: (documentId: string) => void;
  expandedDocs: Set<string>;
  toggleDoc: (documentId: string) => void;
}) {
  const { deleteDocument } = useDocumentStore();
  const [renaming, setRenaming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = node.documentId === activeDocId;
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedDocs.has(node.documentId);

  const handleDelete = () => {
    const label = displayTitle(node.title);
    if (
      window.confirm(
        `Move “${label}” to trash? Its sub-documents will also be moved to trash.`,
      )
    ) {
      deleteDocument(node.documentId);
    }
  };

  return (
    <div>
      <div
        className={`group/doc relative flex items-center gap-1 rounded-md pr-1 transition-colors ${
          isActive
            ? "bg-teal-50 text-teal-900"
            : "text-slate-700 hover:bg-slate-100/90"
        }`}
        style={{ paddingLeft: `${6 + node.depth * 12}px` }}
      >
        {renaming ? (
          <DocumentTitleInput
            docId={node.documentId}
            autoFocus
            onRenameDone={() => setRenaming(false)}
            className="my-0.5 min-w-0 flex-1 rounded border border-teal-200 bg-white px-2 py-1 text-sm outline-none"
          />
        ) : (
          <>
            <div className="relative h-6 w-5 shrink-0">
              <span
                className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity ${
                  menuOpen
                    ? "opacity-0"
                    : "opacity-100 group-hover/doc:opacity-0"
                }`}
              >
                <DocIcon />
              </span>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleDoc(node.documentId)}
                  className={`absolute inset-0 flex items-center justify-center rounded transition-opacity hover:bg-white/70 ${
                    menuOpen
                      ? "pointer-events-auto opacity-100"
                      : "pointer-events-none opacity-0 group-hover/doc:pointer-events-auto group-hover/doc:opacity-100"
                  }`}
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  <Chevron open={isExpanded} />
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => onSelectDocument(node.documentId)}
              className="min-w-0 flex-1 truncate py-1.5 text-left text-sm"
              title={node.title}
            >
              {node.title}
            </button>

            <div
              className={`relative flex shrink-0 items-center gap-0.5 transition-opacity ${
                menuOpen
                  ? "opacity-100"
                  : "opacity-0 group-hover/doc:opacity-100 focus-within:opacity-100"
              }`}
            >
              <button
                type="button"
                onClick={() => setRenaming(true)}
                title="Rename"
                aria-label={`Rename ${node.title}`}
                className="rounded p-1 text-slate-400 hover:bg-white/80 hover:text-slate-700"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                title="More options"
                aria-label={`More options for ${node.title}`}
                className="rounded p-1 text-slate-400 hover:bg-white/80 hover:text-slate-700"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" />
                </svg>
              </button>
              {menuOpen ? (
                <DocActionsMenu
                  documentId={node.documentId}
                  title={node.title}
                  onDelete={handleDelete}
                  onClose={() => setMenuOpen(false)}
                />
              ) : null}
            </div>
          </>
        )}
      </div>

      {hasChildren && isExpanded
        ? node.children.map((child) => (
            <DocRow
              key={child.documentId}
              node={child}
              activeDocId={activeDocId}
              onSelectDocument={onSelectDocument}
              expandedDocs={expandedDocs}
              toggleDoc={toggleDoc}
            />
          ))
        : null}
    </div>
  );
}

function FolderRow({
  node,
  activeDocId,
  onSelectDocument,
  onCreateDocument,
  expandedFolders,
  expandedDocs,
  toggleFolder,
  toggleDoc,
}: {
  node: SidebarFolderNode;
  activeDocId: string | null;
  onSelectDocument: (documentId: string) => void;
  onCreateDocument: (folderId?: string | null) => void;
  expandedFolders: Set<string>;
  expandedDocs: Set<string>;
  toggleFolder: (folderId: string) => void;
  toggleDoc: (documentId: string) => void;
}) {
  const { deleteFolder } = useDocumentStore();
  const [renaming, setRenaming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isExpanded = expandedFolders.has(node.folderId);
  const hasContent =
    node.folders.length > 0 || node.documents.length > 0;

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const confirmDelete = () => {
    if (
      window.confirm(
        `Delete folder “${node.name}”? Documents inside will move to Unfiled.`,
      )
    ) {
      deleteFolder(node.folderId);
    }
  };

  return (
    <div>
      <div
        className="group/folder relative flex items-center gap-1 rounded-md pr-1 text-slate-800 hover:bg-slate-100/90"
        style={{ paddingLeft: `${6 + node.depth * 12}px` }}
      >
        {renaming ? (
          <FolderTitleInput
            folderId={node.folderId}
            autoFocus
            onRenameDone={() => setRenaming(false)}
            className="my-0.5 min-w-0 flex-1 rounded border border-teal-200 bg-white px-2 py-1 text-sm outline-none"
          />
        ) : (
          <>
            <div className="relative h-6 w-5 shrink-0">
              <span
                className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity ${
                  menuOpen
                    ? "opacity-0"
                    : "opacity-100 group-hover/folder:opacity-0"
                }`}
              >
                <span className="inline-block h-2.5 w-2.5 rounded-[2px] border border-slate-400/80 bg-slate-200/80" />
              </span>
              <button
                type="button"
                onClick={() => toggleFolder(node.folderId)}
                className={`absolute inset-0 flex items-center justify-center rounded transition-opacity hover:bg-white/70 ${
                  menuOpen
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0 group-hover/folder:pointer-events-auto group-hover/folder:opacity-100"
                }`}
                aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
              >
                <Chevron open={isExpanded} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => toggleFolder(node.folderId)}
              className="min-w-0 flex-1 truncate py-1.5 text-left text-sm font-medium"
              title={node.name}
            >
              {node.name}
            </button>

            <div
              ref={menuRef}
              className={`relative flex shrink-0 items-center gap-0.5 transition-opacity ${
                menuOpen
                  ? "opacity-100"
                  : "opacity-0 group-hover/folder:opacity-100 focus-within:opacity-100"
              }`}
            >
              <button
                type="button"
                onClick={() => setRenaming(true)}
                title="Rename"
                aria-label={`Rename ${node.name}`}
                className="rounded p-1 text-slate-400 hover:bg-white/80 hover:text-slate-700"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                title="More options"
                aria-label={`More options for ${node.name}`}
                className="rounded p-1 text-slate-400 hover:bg-white/80 hover:text-slate-700"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" />
                </svg>
              </button>
              {menuOpen ? (
                <div className="absolute right-0 top-full z-30 mt-1 min-w-[150px] rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      onCreateDocument(node.folderId);
                      setMenuOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                  >
                    New document
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      confirmDelete();
                      setMenuOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>

      {isExpanded ? (
        <div>
          {node.folders.map((child) => (
            <FolderRow
              key={child.folderId}
              node={child}
              activeDocId={activeDocId}
              onSelectDocument={onSelectDocument}
              onCreateDocument={onCreateDocument}
              expandedFolders={expandedFolders}
              expandedDocs={expandedDocs}
              toggleFolder={toggleFolder}
              toggleDoc={toggleDoc}
            />
          ))}
          {node.documents.map((doc) => (
            <DocRow
              key={doc.documentId}
              node={doc}
              activeDocId={activeDocId}
              onSelectDocument={onSelectDocument}
              expandedDocs={expandedDocs}
              toggleDoc={toggleDoc}
            />
          ))}
          {!hasContent ? (
            <p
              className="py-1 text-[11px] text-slate-400"
              style={{ paddingLeft: `${22 + (node.depth + 1) * 12}px` }}
            >
              Empty folder
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar({
  open,
  activeDocId,
  onSelectDocument,
  onCreateDocument,
}: SidebarProps) {
  const {
    sidebarForest,
    hydrated,
    getDocument,
    createFolder,
    buildPathTo,
  } = useDocumentStore();

  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(() => new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => new Set(),
  );
  const foldersInitialized = useRef(false);

  useEffect(() => {
    if (!hydrated || foldersInitialized.current) return;
    setExpandedFolders(new Set(sidebarForest.folders.map((f) => f.folderId)));
    foldersInitialized.current = true;
  }, [hydrated, sidebarForest.folders]);

  useEffect(() => {
    if (!activeDocId) return;
    const path = buildPathTo(activeDocId);
    if (!path || path.length < 2) return;

    setExpandedDocs((prev) => {
      const next = new Set(prev);
      for (const id of path.slice(0, -1)) {
        next.add(id);
      }
      return next;
    });

    const rootDoc = getDocument(path[0]);
    if (rootDoc?.folderId) {
      setExpandedFolders((prev) => new Set(prev).add(rootDoc.folderId!));
    }
  }, [activeDocId, buildPathTo, getDocument]);

  const toggleDoc = (documentId: string) => {
    setExpandedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(documentId)) next.delete(documentId);
      else next.add(documentId);
      return next;
    });
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const handleCreateFolder = () => {
    const id = createFolder("New folder");
    setExpandedFolders((prev) => new Set(prev).add(id));
  };

  const activeTitle = activeDocId
    ? displayTitle(getDocument(activeDocId)?.title ?? "Untitled")
    : null;

  const isEmpty =
    sidebarForest.folders.length === 0 && sidebarForest.documents.length === 0;

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-slate-200/90 bg-[#f4f7fa] transition-[width,opacity] duration-300 ease-out ${
        open
          ? "w-[280px] opacity-100"
          : "w-0 overflow-hidden border-r-0 opacity-0"
      }`}
      aria-hidden={!open}
    >
      <div className="flex w-[280px] items-center justify-between gap-2 px-3 pb-2 pt-3">
        <div className="min-w-0">
          <p className="font-serif text-base tracking-tight text-slate-900">
            Branch
          </p>
          <p className="truncate text-[11px] text-slate-500">Documents</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleCreateFolder}
            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            title="New folder"
          >
            Folder
          </button>
          <button
            type="button"
            onClick={() => onCreateDocument(null)}
            className="rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700"
          >
            New
          </button>
        </div>
      </div>

      <div className="min-h-0 w-[280px] flex-1 overflow-y-auto px-2 pb-4">
        {!hydrated ? (
          <p className="px-2 py-2 text-xs text-slate-400">Loading…</p>
        ) : isEmpty ? (
          <p className="px-2 py-2 text-xs text-slate-400">No documents yet.</p>
        ) : (
          <nav className="flex flex-col gap-0.5" aria-label="Documents">
            {sidebarForest.folders.map((folder) => (
              <FolderRow
                key={folder.folderId}
                node={folder}
                activeDocId={activeDocId}
                onSelectDocument={onSelectDocument}
                onCreateDocument={onCreateDocument}
                expandedFolders={expandedFolders}
                expandedDocs={expandedDocs}
                toggleFolder={toggleFolder}
                toggleDoc={toggleDoc}
              />
            ))}

            {sidebarForest.folders.length > 0 &&
            sidebarForest.documents.length > 0 ? (
              <p className="px-2 pb-1 pt-3 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Unfiled
              </p>
            ) : null}

            {sidebarForest.documents.map((doc) => (
              <DocRow
                key={doc.documentId}
                node={doc}
                activeDocId={activeDocId}
                onSelectDocument={onSelectDocument}
                expandedDocs={expandedDocs}
                toggleDoc={toggleDoc}
              />
            ))}
          </nav>
        )}
      </div>

      <div className="w-[280px] border-t border-slate-200/80 px-3 py-2 text-[11px] text-slate-400">
        {activeTitle ? (
          <span className="block truncate">Open: {activeTitle}</span>
        ) : (
          "Select a page"
        )}
      </div>
    </aside>
  );
}
