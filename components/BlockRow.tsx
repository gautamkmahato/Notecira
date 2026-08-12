"use client";

import { useEffect, useRef, useState } from "react";
import { displayTitle, useDocumentStore } from "@/lib/document-store";
import type { BlockType } from "@/lib/domain/types";
import { canLinkBlock } from "@/lib/editor/block-meta";
import { BlockBody } from "./editor/BlockBody";
import { SlashCommandMenu } from "./editor/SlashCommandMenu";

type BlockRowProps = {
  blockId: string;
  columnIndex: number;
  isActiveInPath: boolean;
  isSelected: boolean;
  editable: boolean;
  dragOver: boolean;
  autofocusRequest: { blockId: string; caret?: number } | null;
  onSelect: (blockId: string) => void;
  onAutofocusHandled: () => void;
  onRequestFocus: (blockId: string, caret?: number) => void;
  onOpenLinked: (columnIndex: number, docId: string) => void;
  onInsertBelow: (blockId: string, type?: BlockType) => void;
  onConvertBlock: (blockId: string, type: BlockType) => void;
  onDragStart: (blockId: string) => void;
  onDragOver: (blockId: string) => void;
  onDrop: (blockId: string) => void;
  onDragEnd: () => void;
};

export function BlockRow({
  blockId,
  columnIndex,
  isActiveInPath,
  isSelected,
  editable,
  dragOver,
  autofocusRequest,
  onSelect,
  onAutofocusHandled,
  onRequestFocus,
  onOpenLinked,
  onInsertBelow,
  onConvertBlock,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: BlockRowProps) {
  const getBlock = useDocumentStore((s) => s.getBlock);
  const getDocument = useDocumentStore((s) => s.getDocument);
  const linkBlockToNewDoc = useDocumentStore((s) => s.linkBlockToNewDoc);
  const unlinkBlock = useDocumentStore((s) => s.unlinkBlock);
  const updateBlockContent = useDocumentStore((s) => s.updateBlockContent);
  const duplicateBlock = useDocumentStore((s) => s.duplicateBlock);
  const deleteBlock = useDocumentStore((s) => s.deleteBlock);

  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const slashOpen = editable && slashQuery !== null;

  const block = getBlock(blockId);
  const linkedDoc = block?.linkedDocumentId
    ? getDocument(block.linkedDocumentId)
    : undefined;

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [menuOpen]);

  if (!block) return null;

  const showLink = canLinkBlock(block);

  const handleLink = () => {
    const childId = linkBlockToNewDoc(blockId);
    if (childId) onOpenLinked(columnIndex, childId);
  };

  const handleOpen = () => {
    if (block.linkedDocumentId) {
      onOpenLinked(columnIndex, block.linkedDocumentId);
    }
  };

  const handleSlashSelect = (type: BlockType) => {
    updateBlockContent(blockId, "");
    onConvertBlock(blockId, type);
    setSlashQuery(null);
    onRequestFocus(blockId, 0);
  };

  const handleDuplicate = () => {
    const newId = duplicateBlock(blockId);
    setMenuOpen(false);
    if (newId) onRequestFocus(newId, 0);
  };

  const handleDelete = () => {
    const focusId = deleteBlock(blockId);
    setMenuOpen(false);
    if (focusId) onRequestFocus(focusId, 0);
  };

  return (
    <div
      className={`group relative flex items-start gap-0.5 rounded-sm px-1 py-0.5 transition-colors ${
        dragOver
          ? "border-t-2 border-teal-500"
          : isSelected
            ? "bg-sky-50/70"
            : isActiveInPath
              ? "bg-teal-50/80"
              : "hover:bg-slate-50/80"
      }`}
      onMouseDown={() => onSelect(blockId)}
      onDragOver={(e) => {
        if (!editable) return;
        e.preventDefault();
        onDragOver(blockId);
      }}
      onDrop={(e) => {
        if (!editable) return;
        e.preventDefault();
        onDrop(blockId);
      }}
    >
      {editable ? (
        <div className="flex w-[76px] shrink-0 items-center justify-end gap-0.5 pt-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            title="Add block below"
            aria-label="Add block below"
            onClick={(e) => {
              e.stopPropagation();
              onInsertBelow(blockId);
            }}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-200/80 hover:text-slate-700"
          >
            <PlusIcon />
          </button>
          <button
            type="button"
            title="Drag to reorder"
            aria-label="Drag to reorder"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", blockId);
              onDragStart(blockId);
            }}
            onDragEnd={onDragEnd}
            className="flex h-6 w-6 cursor-grab items-center justify-center rounded text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 active:cursor-grabbing"
          >
            <DragHandleIcon />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              title="Block actions"
              aria-label="Block actions"
              aria-expanded={menuOpen}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-200/80 hover:text-slate-700"
            >
              <MoreIcon />
            </button>
            {menuOpen ? (
              <div className="absolute left-0 top-full z-30 mt-1 w-36 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="block w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="w-3 shrink-0" />
      )}

      <div className="relative min-w-0 flex-1 py-0.5">
        <BlockBody
          block={block}
          isSelected={isSelected}
          editable={editable}
          autofocus={editable && autofocusRequest?.blockId === blockId}
          caret={
            autofocusRequest?.blockId === blockId
              ? autofocusRequest.caret
              : undefined
          }
          onSelect={() => onSelect(blockId)}
          onAutofocusHandled={onAutofocusHandled}
          onRequestFocus={onRequestFocus}
          onSlashQueryChange={editable ? setSlashQuery : undefined}
        />

        {slashOpen ? (
          <SlashCommandMenu
            query={slashQuery}
            onSelect={handleSlashSelect}
            onClose={() => setSlashQuery(null)}
          />
        ) : null}

        {showLink ? (
          linkedDoc ? (
            <div className="mb-1 mt-0.5 flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleOpen}
                className="max-w-full truncate text-left font-medium text-teal-700 hover:underline"
              >
                ↳ {displayTitle(linkedDoc.title)}
              </button>
              {editable ? (
                <button
                  type="button"
                  onClick={() => unlinkBlock(blockId)}
                  className="text-slate-400 opacity-0 transition hover:text-slate-600 group-hover:opacity-100"
                >
                  Unlink
                </button>
              ) : null}
            </div>
          ) : editable ? (
            <button
              type="button"
              onClick={handleLink}
              className="mb-1 mt-0.5 text-xs text-slate-400 opacity-0 transition hover:text-teal-700 group-hover:opacity-100 focus:opacity-100"
            >
              Link →
            </button>
          ) : null
        ) : null}
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M7 2.5v9M2.5 7h9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden>
      <circle cx="3" cy="2.5" r="1.1" />
      <circle cx="7" cy="2.5" r="1.1" />
      <circle cx="3" cy="7" r="1.1" />
      <circle cx="7" cy="7" r="1.1" />
      <circle cx="3" cy="11.5" r="1.1" />
      <circle cx="7" cy="11.5" r="1.1" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <circle cx="7" cy="3" r="1.2" />
      <circle cx="7" cy="7" r="1.2" />
      <circle cx="7" cy="11" r="1.2" />
    </svg>
  );
}
