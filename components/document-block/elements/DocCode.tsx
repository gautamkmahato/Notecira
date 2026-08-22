"use client";

import { useCallback, useEffect, useRef } from "react";
import Editor from "react-simple-code-editor";
import {
  getActiveDocElement,
  registerActiveDocElement,
} from "@/lib/document-block/active-element";
import { registerActiveTextEditor } from "@/lib/editor/rich-text/active-editor";
import { highlightCode } from "@/lib/editor/code-highlight";
import type { DocElementEditorProps } from "./types";

export function DocCode({
  blockId,
  element,
  editable,
  autofocus,
  caret,
  onFocused,
  onAutofocusHandled,
  onContentChange,
  onBackspaceAtStart,
}: DocElementEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!autofocus || !editable) return;
    const textarea = editorRef.current?.querySelector("textarea");
    if (!textarea) return;
    textarea.focus();
    const offset =
      typeof caret === "number" ? caret : element.content.length;
    textarea.setSelectionRange(offset, offset);
    onAutofocusHandled?.();
  }, [autofocus, caret, editable, element.content.length, onAutofocusHandled]);

  const onValueChange = useCallback(
    (code: string) => {
      if (!editable) return;
      onContentChange(element.id, code);
    },
    [editable, element.id, onContentChange],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!editable || event.key !== "Backspace") return;
    const textarea = event.currentTarget as HTMLTextAreaElement;
    if (textarea.selectionStart !== 0 || textarea.selectionEnd !== 0) return;
    if (element.content.length > 0) return;
    event.preventDefault();
    onBackspaceAtStart(element.id);
  };

  return (
    <div
      ref={editorRef}
      className="code-block-shell overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-dark-gray-2)] shadow-[var(--shadow-sm)]"
      onFocus={() => {
        onFocused(element.id);
        registerActiveDocElement({
          blockId,
          elementId: element.id,
          root: editorRef.current!,
          persist: () => {},
          notify: () => {},
        });
        registerActiveTextEditor(null);
      }}
      onBlur={() => {
        if (getActiveDocElement()?.elementId === element.id) {
          registerActiveDocElement(null);
        }
      }}
    >
      <div className="scrollbar-custom overflow-x-auto">
        <Editor
          value={element.content}
          onValueChange={onValueChange}
          highlight={(code) => highlightCode(code, "plain")}
          disabled={!editable}
          padding={12}
          onKeyDown={onKeyDown}
          textareaClassName="code-editor-textarea"
          preClassName="code-editor-pre"
          className="code-editor code-editor-wrap font-mono text-sm leading-6 text-[var(--color-white)] outline-none"
          style={{
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            minHeight: "2.5rem",
          }}
        />
      </div>
    </div>
  );
}
