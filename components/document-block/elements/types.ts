import type { DocumentElement } from "@/lib/document-block/types";

export type DocElementEditorProps = {
  blockId: string;
  element: DocumentElement;
  editable: boolean;
  autofocus?: boolean;
  caret?: number;
  onFocused: (elementId: string) => void;
  onAutofocusHandled?: () => void;
  onContentChange: (elementId: string, content: string) => void;
  onInsertAfter: (elementId: string) => void;
  onSplitAfter: (elementId: string, before: string, after: string) => void;
  onBackspaceAtStart: (elementId: string) => void;
};
