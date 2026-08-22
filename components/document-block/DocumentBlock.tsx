"use client";

import type { Block } from "@/lib/domain/types";
import { useDocumentStore } from "@/lib/document-store";
import { DocumentCanvas } from "./DocumentCanvas";

type DocumentBlockProps = {
  block: Block;
  editable?: boolean;
  autofocus?: boolean;
  caret?: number;
  onFocused: () => void;
  onAutofocusHandled?: () => void;
  onRequestFocus: (blockId: string, caret?: number) => void;
  onSlashQueryChange?: (query: string | null) => void;
};

export function DocumentBlock({
  block,
  editable = true,
  autofocus,
  caret,
  onFocused,
  onAutofocusHandled,
  onRequestFocus,
  onSlashQueryChange,
}: DocumentBlockProps) {
  const mergeWithPrevious = useDocumentStore((s) => s.mergeWithPrevious);

  return (
    <DocumentCanvas
      block={block}
      editable={editable}
      autofocus={autofocus}
      caret={caret}
      onFocused={onFocused}
      onAutofocusHandled={onAutofocusHandled}
      onSlashQueryChange={onSlashQueryChange}
      onMergeWithPreviousBlock={() => {
        const merged = mergeWithPrevious(block.documentId, block.id);
        if (!merged) return;
        onSlashQueryChange?.(null);
        onRequestFocus(merged.previousBlockId, merged.caretOffset);
      }}
    />
  );
}
