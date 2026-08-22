import { createId } from "@/lib/domain/ids";
import type { Block } from "@/lib/domain/types";
import { htmlToPlainText } from "@/lib/editor/rich-text/html";
import type {
  DocumentElement,
  DocumentElementType,
  DocumentInsertableType,
} from "./types";
import { isDocumentListElementType } from "./types";

export function defaultContentForElementType(type: DocumentElementType): string {
  return "";
}

export function createDocumentElement(
  type: DocumentElementType,
  content?: string,
): DocumentElement {
  return {
    id: createId(),
    type,
    content: content ?? defaultContentForElementType(type),
  };
}

function normalizeElementType(type: string): DocumentElementType {
  if (type === "list") return "bullet_list";
  if (
    type === "paragraph" ||
    type === "heading_1" ||
    type === "heading_2" ||
    type === "heading_3" ||
    type === "heading_4" ||
    type === "bullet_list" ||
    type === "numbered_list" ||
    type === "code"
  ) {
    return type;
  }
  return "paragraph";
}

export function getDocumentElements(block: Block): DocumentElement[] {
  const stored = block.attrs.elements;
  if (Array.isArray(stored) && stored.length > 0) {
    return stored.map((element) => ({
      id: element.id,
      type: normalizeElementType(element.type),
      content: element.content ?? "",
    }));
  }

  if (block.content) {
    return [createDocumentElement("paragraph", block.content)];
  }

  return [createDocumentElement("paragraph")];
}

export function isElementEmpty(element: DocumentElement): boolean {
  if (element.type === "code") {
    return element.content.trim().length === 0;
  }
  return htmlToPlainText(element.content).trim().length === 0;
}

export function findElementIndex(
  elements: DocumentElement[],
  elementId: string,
): number {
  return elements.findIndex((element) => element.id === elementId);
}

export function updateElementInList(
  elements: DocumentElement[],
  elementId: string,
  patch: Partial<Pick<DocumentElement, "content" | "type">>,
): DocumentElement[] {
  return elements.map((element) =>
    element.id === elementId ? { ...element, ...patch } : element,
  );
}

export function insertElementAfter(
  elements: DocumentElement[],
  afterId: string | null,
  type: DocumentElementType,
): { elements: DocumentElement[]; newId: string } {
  const next = createDocumentElement(type);
  if (!afterId) {
    return { elements: [...elements, next], newId: next.id };
  }

  const index = findElementIndex(elements, afterId);
  if (index === -1) {
    return { elements: [...elements, next], newId: next.id };
  }

  const copy = [...elements];
  copy.splice(index + 1, 0, next);
  return { elements: copy, newId: next.id };
}

export function nextElementTypeAfter(
  current: DocumentElement,
): DocumentElementType {
  return isDocumentListElementType(current.type) ? current.type : "paragraph";
}

export function splitElementInList(
  elements: DocumentElement[],
  elementId: string,
  before: string,
  after: string,
): { elements: DocumentElement[]; newId: string } {
  const index = findElementIndex(elements, elementId);
  if (index === -1) {
    const fallback = createDocumentElement("paragraph", after);
    return { elements: [...elements, fallback], newId: fallback.id };
  }

  const current = elements[index];
  const updated = { ...current, content: before };
  const inserted = createDocumentElement(nextElementTypeAfter(current), after);
  const copy = [...elements];
  copy[index] = updated;
  copy.splice(index + 1, 0, inserted);
  return { elements: copy, newId: inserted.id };
}

export function mergeElementWithPrevious(
  elements: DocumentElement[],
  elementId: string,
): { elements: DocumentElement[]; focusId: string; caretOffset: number } | null {
  const index = findElementIndex(elements, elementId);
  if (index <= 0) return null;

  const previous = elements[index - 1];
  const current = elements[index];
  const mergedContent = `${previous.content}${current.content}`;
  const caretOffset = htmlToPlainText(previous.content).length;

  const copy = [...elements];
  copy[index - 1] = { ...previous, content: mergedContent };
  copy.splice(index, 1);

  return { elements: copy, focusId: previous.id, caretOffset };
}

export function removeElementIfEmpty(
  elements: DocumentElement[],
  elementId: string,
): { elements: DocumentElement[]; focusId: string | null } | null {
  if (elements.length <= 1) return null;

  const index = findElementIndex(elements, elementId);
  if (index === -1) return null;

  const current = elements[index];
  if (!isElementEmpty(current)) return null;

  const focusId = index > 0 ? elements[index - 1].id : elements[index + 1]?.id ?? null;
  const copy = elements.filter((element) => element.id !== elementId);
  return { elements: copy, focusId };
}

export function isInsertableElementType(
  type: string,
): type is DocumentInsertableType {
  return (
    type === "heading_1" ||
    type === "heading_2" ||
    type === "heading_3" ||
    type === "heading_4" ||
    type === "bullet_list" ||
    type === "numbered_list" ||
    type === "code"
  );
}
