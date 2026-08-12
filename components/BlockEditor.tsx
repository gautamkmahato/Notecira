"use client";

import { useCallback, useState } from "react";
import { useDocumentStore } from "@/lib/document-store";
import type { BlockType } from "@/lib/domain/types";
import { BlockRow } from "./BlockRow";
import { FormatToolbar } from "./editor/FormatToolbar";
import { InsertBlockMenu } from "./editor/InsertBlockMenu";

type BlockEditorProps = {
  docId: string;
  columnIndex: number;
  editable: boolean;
  openLinkedDocId?: string;
  onOpenLinked: (columnIndex: number, docId: string) => void;
};

export function BlockEditor({
  docId,
  columnIndex,
  editable,
  openLinkedDocId,
  onOpenLinked,
}: BlockEditorProps) {
  const getDocument = useDocumentStore((s) => s.getDocument);
  const getBlocksForDocument = useDocumentStore((s) => s.getBlocksForDocument);
  const insertBlock = useDocumentStore((s) => s.insertBlock);
  const updateBlockType = useDocumentStore((s) => s.updateBlockType);
  const moveBlock = useDocumentStore((s) => s.moveBlock);
  const document = getDocument(docId);
  const blocks = getBlocksForDocument(docId);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    () => blocks[0]?.id ?? null,
  );
  const [autofocusRequest, setAutofocusRequest] = useState<{
    blockId: string;
    caret?: number;
  } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleAutofocusHandled = useCallback(() => {
    setAutofocusRequest(null);
  }, []);

  const handleRequestFocus = useCallback((blockId: string, caret?: number) => {
    setSelectedBlockId(blockId);
    setAutofocusRequest({ blockId, caret });
  }, []);

  const handleInsert = useCallback(
    (type: BlockType, afterId?: string | null) => {
      if (!editable) return;
      const resolvedAfter =
        afterId !== undefined
          ? afterId
          : selectedBlockId && blocks.some((b) => b.id === selectedBlockId)
            ? selectedBlockId
            : (blocks[blocks.length - 1]?.id ?? null);
      const newId = insertBlock(docId, resolvedAfter, "", type);
      setSelectedBlockId(newId);
      setAutofocusRequest({ blockId: newId, caret: 0 });
    },
    [blocks, docId, editable, insertBlock, selectedBlockId],
  );

  const handleInsertBelow = useCallback(
    (blockId: string, type: BlockType = "paragraph") => {
      handleInsert(type, blockId);
    },
    [handleInsert],
  );

  const handleConvertBlock = useCallback(
    (blockId: string, type: BlockType) => {
      if (!editable) return;
      updateBlockType(blockId, type);
      setSelectedBlockId(blockId);
      setAutofocusRequest({ blockId, caret: 0 });
    },
    [editable, updateBlockType],
  );

  const handleDragStart = useCallback((blockId: string) => {
    setDraggingId(blockId);
  }, []);

  const handleDragOver = useCallback((blockId: string) => {
    setDragOverId(blockId);
  }, []);

  const handleDrop = useCallback(
    (targetId: string) => {
      if (!editable || !draggingId || draggingId === targetId) {
        setDraggingId(null);
        setDragOverId(null);
        return;
      }
      const toIndex = blocks.findIndex((b) => b.id === targetId);
      if (toIndex === -1) {
        setDraggingId(null);
        setDragOverId(null);
        return;
      }
      moveBlock(docId, draggingId, toIndex);
      setSelectedBlockId(draggingId);
      setDraggingId(null);
      setDragOverId(null);
    },
    [blocks, draggingId, docId, editable, moveBlock],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverId(null);
  }, []);

  if (!document) {
    return (
      <p className="px-3 py-2 text-sm text-slate-500">Document not found.</p>
    );
  }

  const activeSelection =
    selectedBlockId && blocks.some((b) => b.id === selectedBlockId)
      ? selectedBlockId
      : (blocks[0]?.id ?? null);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {editable ? <FormatToolbar blockId={activeSelection} /> : null}

      <div className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto px-1 py-3">
        {blocks.map((block) => {
          const isActiveInPath = Boolean(
            openLinkedDocId && block.linkedDocumentId === openLinkedDocId,
          );

          return (
            <BlockRow
              key={block.id}
              blockId={block.id}
              columnIndex={columnIndex}
              isActiveInPath={isActiveInPath}
              isSelected={activeSelection === block.id}
              editable={editable}
              dragOver={dragOverId === block.id && draggingId !== block.id}
              onSelect={setSelectedBlockId}
              onOpenLinked={onOpenLinked}
              autofocusRequest={autofocusRequest}
              onAutofocusHandled={handleAutofocusHandled}
              onRequestFocus={handleRequestFocus}
              onInsertBelow={handleInsertBelow}
              onConvertBlock={handleConvertBlock}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          );
        })}

        {editable ? (
          <InsertBlockMenu onInsert={(type) => handleInsert(type)} />
        ) : null}
      </div>
    </div>
  );
}
