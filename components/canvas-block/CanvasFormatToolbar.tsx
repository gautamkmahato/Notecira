"use client";

import { useDocumentStore } from "@/lib/document-store";
import { canvasToolbarOptions } from "./canvas-toolbar-options";
import { CanvasSelectionSubToolbar } from "./CanvasSelectionSubToolbar";

type CanvasFormatToolbarProps = {
  blockId: string | null;
  embedded?: boolean;
  showSelectionSubToolbar?: boolean;
};

const EMPTY_BLOCK = {
  id: "",
  documentId: "",
  type: "canvas" as const,
  content: "",
  attrs: { canvasMode: "infinite" as const, canvasElements: [] },
  position: 0,
  linkedDocumentId: null,
  createdAt: "",
  updatedAt: "",
};

export function CanvasFormatToolbar({
  blockId,
  embedded = false,
  showSelectionSubToolbar = true,
}: CanvasFormatToolbarProps) {
  const getBlock = useDocumentStore((s) => s.getBlock);
  const updateBlockAttrs = useDocumentStore((s) => s.updateBlockAttrs);
  const updateBlockType = useDocumentStore((s) => s.updateBlockType);
  useDocumentStore((s) => s.snapshot.blocks);

  const block = blockId ? getBlock(blockId) : undefined;
  const renderBlock = block ?? EMPTY_BLOCK;
  const patchAttrs = block
    ? (patch: Partial<typeof block.attrs>) => updateBlockAttrs(block.id, patch)
    : () => {};
  const setType = block
    ? (type: typeof block.type) => updateBlockType(block.id, type)
    : () => {};

  const inner = (
    <div className="flex min-h-9 w-full min-w-0 flex-wrap items-center justify-center gap-2 overflow-visible rounded-[var(--radius-xl)] px-1.5 py-1.5">
      {canvasToolbarOptions.map((option) => (
        <div key={option.id} className="flex shrink-0 items-center">
          {option.render({
            block: renderBlock,
            blockId,
            patchAttrs,
            setType,
          })}
        </div>
      ))}
    </div>
  );

  if (embedded) {
    return <div data-editor="canvas">{inner}</div>;
  }

  return (
    <div
      className="relative z-[var(--z-10)] flex shrink-0 flex-col border-b border-[var(--color-light-gray-2)] bg-[var(--color-white)]"
      data-editor="canvas"
    >
      <div className="flex min-h-12 items-center justify-center overflow-visible px-3 sm:px-4">
        {inner}
      </div>
      {showSelectionSubToolbar ? (
        <CanvasSelectionSubToolbar blockId={blockId} />
      ) : null}
    </div>
  );
}

export function CanvasSelectionSubToolbarRow({
  blockId,
}: {
  blockId: string | null;
}) {
  return <CanvasSelectionSubToolbar blockId={blockId} />;
}
