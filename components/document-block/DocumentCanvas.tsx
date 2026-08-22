"use client";

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import type { Block } from "@/lib/domain/types";
import { useDocumentStore } from "@/lib/document-store";
import {
  consumeDocumentElementInsert,
  useDocumentElementInsertRevision,
} from "@/lib/document-block/active-element";
import {
  getDocumentElements,
  insertElementAfter,
  isElementEmpty,
  mergeElementWithPrevious,
  nextElementTypeAfter,
  removeElementIfEmpty,
  splitElementInList,
  updateElementInList,
} from "@/lib/document-block/model";
import type { DocumentElement } from "@/lib/document-block/types";
import { isDocumentListElementType } from "@/lib/document-block/types";
import { htmlToPlainText } from "@/lib/editor/rich-text/html";
import { DocumentElementView } from "./elements/DocumentElementView";

type DocumentCanvasProps = {
  block: Block;
  editable?: boolean;
  autofocus?: boolean;
  caret?: number;
  onFocused: () => void;
  onAutofocusHandled?: () => void;
  onMergeWithPreviousBlock: () => void;
  onSlashQueryChange?: (query: string | null) => void;
};

type FocusRequest = {
  elementId: string;
  caret?: number;
};

export function DocumentCanvas({
  block,
  editable = true,
  autofocus,
  caret,
  onFocused,
  onAutofocusHandled,
  onMergeWithPreviousBlock,
  onSlashQueryChange,
}: DocumentCanvasProps) {
  const updateBlockAttrs = useDocumentStore((s) => s.updateBlockAttrs);
  const [focusedElementId, setFocusedElementId] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const insertRevision = useDocumentElementInsertRevision();

  const elements = useMemo(
    () => getDocumentElements(block),
    [block.attrs.elements, block.content, block.id],
  );

  const persistElements = useCallback(
    (next: DocumentElement[]) => {
      updateBlockAttrs(block.id, { elements: next });
    },
    [block.id, updateBlockAttrs],
  );

  const queueFocus = useCallback((elementId: string, nextCaret?: number) => {
    setFocusRequest({ elementId, caret: nextCaret });
    setFocusedElementId(elementId);
  }, []);

  const handleContentChange = useCallback(
    (elementId: string, content: string) => {
      persistElements(updateElementInList(elements, elementId, { content }));
      if (onSlashQueryChange && elements[0]?.id === elementId) {
        const plain = htmlToPlainText(content);
        if (plain.startsWith("/")) onSlashQueryChange(plain.slice(1));
        else onSlashQueryChange(null);
      }
    },
    [elements, onSlashQueryChange, persistElements],
  );

  const handleInsertAfter = useCallback(
    (elementId: string) => {
      const current = elements.find((element) => element.id === elementId);
      if (!current) return;

      if (isDocumentListElementType(current.type) && isElementEmpty(current)) {
        persistElements(
          updateElementInList(elements, elementId, {
            type: "paragraph",
            content: "",
          }),
        );
        queueFocus(elementId, 0);
        return;
      }

      const result = insertElementAfter(
        elements,
        elementId,
        nextElementTypeAfter(current),
      );
      persistElements(result.elements);
      queueFocus(result.newId, 0);
    },
    [elements, persistElements, queueFocus],
  );

  const handleSplitAfter = useCallback(
    (elementId: string, before: string, after: string) => {
      const result = splitElementInList(elements, elementId, before, after);
      persistElements(result.elements);
      queueFocus(result.newId, 0);
    },
    [elements, persistElements, queueFocus],
  );

  const handleBackspaceAtStart = useCallback(
    (elementId: string) => {
      const current = elements.find((element) => element.id === elementId);
      if (!current) return;

      if (isDocumentListElementType(current.type) && isElementEmpty(current)) {
        persistElements(
          updateElementInList(elements, elementId, {
            type: "paragraph",
            content: "",
          }),
        );
        queueFocus(elementId, 0);
        return;
      }

      if (isElementEmpty(current)) {
        const removed = removeElementIfEmpty(elements, elementId);
        if (!removed) {
          if (elements.length === 1 && elementId === elements[0].id) {
            onMergeWithPreviousBlock();
          }
          return;
        }
        persistElements(removed.elements);
        if (removed.focusId) {
          const focusElement = removed.elements.find(
            (element) => element.id === removed.focusId,
          );
          const end = focusElement
            ? htmlToPlainText(focusElement.content).length
            : 0;
          queueFocus(removed.focusId, end);
        }
        return;
      }

      const merged = mergeElementWithPrevious(elements, elementId);
      if (!merged) {
        if (elements.length === 1 && elementId === elements[0].id) {
          onMergeWithPreviousBlock();
        }
        return;
      }
      persistElements(merged.elements);
      queueFocus(merged.focusId, merged.caretOffset);
    },
    [elements, onMergeWithPreviousBlock, persistElements, queueFocus],
  );

  useEffect(() => {
    const request = consumeDocumentElementInsert(block.id);
    if (!request) return;

    const anchorId = focusedElementId ?? elements.at(-1)?.id ?? null;
    const result = insertElementAfter(elements, anchorId, request.type);
    persistElements(result.elements);
    queueFocus(result.newId, 0);
  }, [
    block.id,
    elements,
    focusedElementId,
    insertRevision,
    persistElements,
    queueFocus,
  ]);

  useEffect(() => {
    if (!autofocus || elements.length === 0) return;
    queueFocus(elements[0].id, caret);
    onAutofocusHandled?.();
  }, [autofocus, caret, elements, onAutofocusHandled, queueFocus]);

  const sharedProps = {
    blockId: block.id,
    editable,
    onFocused: (elementId: string) => {
      setFocusedElementId(elementId);
      onFocused();
    },
    onContentChange: handleContentChange,
    onInsertAfter: handleInsertAfter,
    onSplitAfter: handleSplitAfter,
    onBackspaceAtStart: handleBackspaceAtStart,
  };

  const appendParagraphAtClick = useCallback(
    (clickY: number, container: HTMLElement) => {
      onFocused();

      let insertAfterId: string | null = null;
      const elementNodes = container.querySelectorAll("[data-doc-element-id]");
      elementNodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (clickY >= rect.bottom - 4) {
          insertAfterId = node.getAttribute("data-doc-element-id");
        }
      });

      const anchorId = insertAfterId ?? elements.at(-1)?.id ?? null;
      const anchor = anchorId
        ? elements.find((element) => element.id === anchorId)
        : undefined;
      const last = elements.at(-1);

      if (
        anchorId &&
        anchorId === last?.id &&
        anchor?.type === "paragraph" &&
        isElementEmpty(anchor)
      ) {
        queueFocus(anchorId, 0);
        return;
      }

      const result = insertElementAfter(elements, anchorId, "paragraph");
      persistElements(result.elements);
      queueFocus(result.newId, 0);
    },
    [elements, onFocused, persistElements, queueFocus],
  );

  const handleEmptyAreaMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!editable) return;
    const target = event.target as HTMLElement;
    if (
      target.closest(
        '[contenteditable="true"], textarea, .code-block-shell, button, select, a',
      )
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    appendParagraphAtClick(event.clientY, event.currentTarget);
  };

  return (
    <div
      className="document-canvas rich-text-block flex min-h-[200px] w-full flex-col"
      onMouseDown={handleEmptyAreaMouseDown}
    >
      <div className="document-canvas-elements space-y-1">
        {elements.map((element) => {
          const isFocusTarget = focusRequest?.elementId === element.id;
          return (
            <div
              key={element.id}
              data-doc-element-id={element.id}
              data-doc-element-type={element.type}
            >
              <DocumentElementView
                element={element}
                {...sharedProps}
                autofocus={isFocusTarget}
                caret={isFocusTarget ? focusRequest?.caret : undefined}
                onAutofocusHandled={
                  isFocusTarget ? () => setFocusRequest(null) : undefined
                }
              />
            </div>
          );
        })}
      </div>
      {editable ? (
        <div
          className="min-h-12 flex-1 cursor-text"
          aria-hidden
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            appendParagraphAtClick(
              event.clientY,
              event.currentTarget.parentElement ?? event.currentTarget,
            );
          }}
        />
      ) : null}
    </div>
  );
}
