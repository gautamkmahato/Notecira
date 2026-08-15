"use client";

import { useCallback, useRef } from "react";
import Editor from "react-simple-code-editor";
import type { Block } from "@/lib/domain/types";
import { useDocumentStore } from "@/lib/document-store";
import { highlightCode } from "@/lib/editor/code-highlight";

type CodeBlockProps = {
  block: Block;
  editable?: boolean;
  onSelect: () => void;
};

export function CodeBlock({ block, editable = true, onSelect }: CodeBlockProps) {
  const updateBlockContent = useDocumentStore((s) => s.updateBlockContent);
  const theme = block.attrs.theme === "light" ? "light" : "dark";
  const wrap = block.attrs.wrap !== false;
  const language = block.attrs.language ?? "plain";
  const heightMode = block.attrs.codeHeight ?? "auto";
  const fixedHeight =
    typeof heightMode === "number" ? heightMode : undefined;

  const editorRef = useRef<HTMLDivElement | null>(null);

  const onValueChange = useCallback(
    (code: string) => {
      if (!editable) return;
      updateBlockContent(block.id, code);
    },
    [block.id, editable, updateBlockContent],
  );

  const editor = (
    <Editor
      value={block.content}
      onValueChange={onValueChange}
      highlight={(code) => highlightCode(code, language)}
      disabled={!editable}
      padding={12}
      onFocus={onSelect}
      textareaClassName="code-editor-textarea"
      preClassName="code-editor-pre"
      className={`code-editor font-mono text-sm leading-6 outline-none ${
        wrap ? "code-editor-wrap" : "code-editor-nowrap"
      }`}
      style={{
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        minHeight: fixedHeight ? undefined : "2.5rem",
      }}
    />
  );

  return (
    <div
      className={`code-block-shell overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] ${
        theme === "light"
          ? "code-block-light bg-[var(--color-white)]"
          : "code-block-dark bg-[var(--color-dark-gray-2)]"
      }`}
    >
      <div
        ref={editorRef}
        className={`scrollbar-custom ${
          fixedHeight ? "overflow-auto" : "overflow-x-auto overflow-y-visible"
        }`}
        style={fixedHeight ? { height: `${fixedHeight}px` } : undefined}
      >
        {editor}
      </div>
    </div>
  );
}
