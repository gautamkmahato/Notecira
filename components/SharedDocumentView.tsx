"use client";

import { useMemo } from "react";
import { CornerDownRight } from "lucide-react";
import type { SharedDocumentPayload } from "@/lib/domain/sharing";
import type { Block, BlockType } from "@/lib/domain/types";
import { displayTitle } from "@/lib/domain/helpers";
import { canLinkBlock } from "@/lib/editor/block-meta";
import { BlockBody } from "@/components/editor/BlockBody";

type SharedBlockListProps = {
  payload: SharedDocumentPayload;
  documentId: string;
  columnIndex: number;
  openLinkedDocId?: string;
  onOpenLinked: (columnIndex: number, docId: string) => void;
};

function orderedBlocks(
  payload: SharedDocumentPayload,
  documentId: string,
): Block[] {
  return Object.values(payload.blocks)
    .filter((block) => block.documentId === documentId)
    .sort((a, b) => a.position - b.position)
    .map(
      (block): Block => ({
        id: block.id,
        documentId: block.documentId,
        type: block.type as BlockType,
        content: block.content,
        attrs: block.attrs as Block["attrs"],
        position: block.position,
        linkedDocumentId: block.linkedDocumentId,
        createdAt: "",
        updatedAt: "",
      }),
    );
}

function SharedBlockItem({
  block,
  payload,
  columnIndex,
  openLinkedDocId,
  onOpenLinked,
}: {
  block: Block;
  payload: SharedDocumentPayload;
  columnIndex: number;
  openLinkedDocId?: string;
  onOpenLinked: (columnIndex: number, docId: string) => void;
}) {
  const linkedDoc = block.linkedDocumentId
    ? payload.documents[block.linkedDocumentId]
    : undefined;
  const showLink = canLinkBlock(block) && linkedDoc;
  const isActiveInPath = Boolean(
    block.linkedDocumentId &&
      openLinkedDocId &&
      block.linkedDocumentId === openLinkedDocId,
  );

  return (
    <div className="group relative py-1.5">
      <div className="relative min-w-0 flex-1 rounded-[var(--radius-xl)] py-0.5">
        <BlockBody
          block={block}
          isSelected={false}
          editable={false}
          onSelect={() => {}}
          onRequestFocus={() => {}}
        />

        {showLink ? (
          <div className="pointer-events-none absolute bottom-0.5 right-0 z-[var(--z-2)] max-w-full opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
            <button
              type="button"
              onClick={() =>
                onOpenLinked(columnIndex, block.linkedDocumentId!)
              }
              className={`inline-flex max-w-full items-center gap-1 truncate rounded-[var(--radius-lg)] bg-[var(--color-white)] px-1 text-right text-xs font-medium shadow-[var(--shadow-sm)] hover:underline ${
                isActiveInPath
                  ? "text-[var(--color-dark-gray-2)]"
                  : "text-[var(--color-blue)]"
              }`}
            >
              <CornerDownRight
                size={12}
                strokeWidth={1.75}
                className="shrink-0"
              />
              {displayTitle(linkedDoc.title || "Untitled")}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SharedBlockList({
  payload,
  documentId,
  columnIndex,
  openLinkedDocId,
  onOpenLinked,
}: SharedBlockListProps) {
  const blocks = useMemo(
    () => orderedBlocks(payload, documentId),
    [payload, documentId],
  );

  return (
    <div className="space-y-1">
      {blocks.map((block) => (
        <SharedBlockItem
          key={block.id}
          block={block}
          payload={payload}
          columnIndex={columnIndex}
          openLinkedDocId={openLinkedDocId}
          onOpenLinked={onOpenLinked}
        />
      ))}
    </div>
  );
}
