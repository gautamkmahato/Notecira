"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { CornerDownRight, GripVertical, Plus } from "lucide-react";
import { displayTitle, useDocumentStore } from "@/lib/document-store";
import type { BlockType } from "@/lib/domain/types";
import { canLinkBlock } from "@/lib/editor/block-meta";
import { BlockBody } from "./editor/BlockBody";
import { SlashCommandMenu } from "./editor/SlashCommandMenu";

type BlockRowProps = {
  blockId: string;
  columnIndex: number;
  compactGutter: boolean;
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
  compactGutter,
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
  const [menuOpensUp, setMenuOpensUp] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const didDragRef = useRef(false);
  const slashOpen = editable && slashQuery !== null;

  const block = getBlock(blockId);
  const linkedDoc = block?.linkedDocumentId
    ? getDocument(block.linkedDocumentId)
    : undefined;

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: globalThis.MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [menuOpen]);

  useLayoutEffect(() => {
    if (!menuOpen || compactGutter) {
      setMenuOpensUp(false);
      return;
    }

    const updatePlacement = () => {
      const menu = dropdownRef.current;
      const anchor = menuRef.current;
      if (!menu || !anchor) return;

      const anchorRect = anchor.getBoundingClientRect();
      const menuHeight = menu.scrollHeight;
      const spaceBelow = window.innerHeight - anchorRect.bottom - 8;
      const spaceAbove = anchorRect.top - 8;

      setMenuOpensUp(spaceBelow < menuHeight && spaceAbove > spaceBelow);
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);
    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [compactGutter, linkedDoc, menuOpen]);

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

  const handleUnlink = () => {
    unlinkBlock(blockId);
    setMenuOpen(false);
  };

  const handleGripClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    setMenuOpen((open) => !open);
  };

  const contentClassName = `relative min-w-0 flex-1 rounded-[var(--radius-xl)] py-0.5 transition-colors duration-[var(--duration-fast)] ${
    dragOver ? "shadow-[inset_0_4px_0_0_var(--color-blue)]" : ""
  }`;

  const gutterClassName = compactGutter
    ? "absolute right-full py-1.5 top-0.5 z-[var(--z-3)] mr-1 flex flex-col items-center gap-0.5 opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 group-focus-within:opacity-100"
    : "absolute right-full py-1.5 top-0.5 z-[var(--z-3)] mr-1 flex flex-row items-center gap-0.5 opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 group-focus-within:opacity-100";

  return (
    <div
      className="group relative py-1.5"
      data-block-type={block.type}
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
        <div
          className={`${gutterClassName}${menuOpen ? " opacity-100" : ""}`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            title="Add block below"
            aria-label="Add block below"
            onClick={(e) => {
              e.stopPropagation();
              onInsertBelow(blockId);
            }}
            className="notion-icon-btn"
          >
            <Plus size={14} strokeWidth={1.75} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              title="Drag to reorder · click for actions"
              aria-label="Drag to reorder, click for block actions"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              draggable
              onDragStart={(e) => {
                didDragRef.current = true;
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", blockId);
                onDragStart(blockId);
              }}
              onDragEnd={() => {
                onDragEnd();
                window.setTimeout(() => {
                  didDragRef.current = false;
                }, 0);
              }}
              onClick={handleGripClick}
              className="notion-icon-btn cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={14} strokeWidth={1.75} />
            </button>

            {menuOpen ? (
              <div
                ref={dropdownRef}
                className={`notion-menu absolute z-[var(--z-14)] w-36 ${
                  compactGutter
                    ? "left-full top-0 ml-1"
                    : menuOpensUp
                      ? "bottom-full left-0 mb-1"
                      : "left-0 top-full mt-1"
                }`}
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleDuplicate}
                  className="notion-menu-item"
                >
                  Duplicate
                </button>
                {linkedDoc && editable ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleUnlink}
                    className="notion-menu-item"
                  >
                    Unlink
                  </button>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleDelete}
                  className="notion-menu-item notion-menu-item-danger"
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={contentClassName}>
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
            <div className="pointer-events-none absolute bottom-0.5 right-0 z-[var(--z-2)] max-w-full opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
              <button
                type="button"
                onClick={handleOpen}
                className="inline-flex max-w-full items-center gap-1 truncate rounded-[var(--radius-lg)] bg-[var(--color-white)] px-1 text-right text-xs font-medium text-[var(--color-blue)] shadow-[var(--shadow-sm)] hover:underline"
              >
                <CornerDownRight
                  size={12}
                  strokeWidth={1.75}
                  className="shrink-0"
                />
                {displayTitle(linkedDoc.title)}
              </button>
            </div>
          ) : editable ? (
            <div className="pointer-events-none absolute bottom-0.5 right-0 z-[var(--z-2)] opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
              <button
                type="button"
                onClick={handleLink}
                className="inline-flex items-center gap-1 rounded-[var(--radius-lg)] bg-[var(--color-white)] px-1 text-xs text-[var(--color-mid-gray)] shadow-[var(--shadow-sm)] hover:text-[var(--color-blue)]"
              >
                <CornerDownRight size={12} strokeWidth={1.75} />
                Link
              </button>
            </div>
          ) : null
        ) : null}
      </div>
    </div>
  );
}
