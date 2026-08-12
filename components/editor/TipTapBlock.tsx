"use client";

import { useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { DOMSerializer } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";
import type { Block } from "@/lib/domain/types";
import { useDocumentStore } from "@/lib/document-store";
import {
  createEditorExtensions,
  type TipTapBlockMode,
} from "@/lib/editor/tiptap/extensions";
import { toEditorHtml } from "@/lib/editor/tiptap/html";
import {
  clearActiveTipTap,
  notifyTipTapToolbar,
  registerActiveTipTap,
} from "@/lib/editor/tiptap/active-editor";
import {
  htmlToPlainText,
  normalizeEmptyHtml,
} from "@/lib/editor/rich-text/html";

type TipTapBlockProps = {
  block: Block;
  mode?: TipTapBlockMode;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  autofocus?: boolean;
  caret?: number;
  onFocused: () => void;
  onAutofocusHandled?: () => void;
  onRequestFocus: (blockId: string, caret?: number) => void;
  onSlashQueryChange?: (query: string | null) => void;
};

export function getHtmlBetween(editor: Editor, from: number, to: number): string {
  const slice = editor.state.doc.cut(from, to);
  const serializer = DOMSerializer.fromSchema(editor.schema);
  const holder = document.createElement("div");
  holder.appendChild(serializer.serializeFragment(slice.content));
  return holder.innerHTML;
}

/**
 * TipTap editor for one document block.
 * List Enter is handled in editorProps.handleKeyDown (before TipTap mutates),
 * so we never mistake a newly created empty <li> for "exit list".
 */
export function TipTapBlock({
  block,
  mode = "text",
  placeholder = "Press '/' for commands",
  className = "",
  editable = true,
  autofocus,
  caret,
  onFocused,
  onAutofocusHandled,
  onRequestFocus,
  onSlashQueryChange,
}: TipTapBlockProps) {
  const updateBlockContent = useDocumentStore((s) => s.updateBlockContent);
  const updateBlockAttrs = useDocumentStore((s) => s.updateBlockAttrs);
  const updateBlockType = useDocumentStore((s) => s.updateBlockType);
  const splitBlock = useDocumentStore((s) => s.splitBlock);
  const mergeWithPrevious = useDocumentStore((s) => s.mergeWithPrevious);
  const skipSync = useRef(false);
  const editorRef = useRef<Editor | null>(null);

  const initialContent = useMemo(
    () => toEditorHtml(block.content, mode, block.attrs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [block.id, mode],
  );

  const extensions = useMemo(
    () => createEditorExtensions(placeholder, mode),
    [placeholder, mode],
  );

  const callbacks = useRef({
    onFocused,
    onSlashQueryChange,
    onRequestFocus,
    updateBlockContent,
    updateBlockAttrs,
    updateBlockType,
    splitBlock,
    mergeWithPrevious,
    blockId: block.id,
    documentId: block.documentId,
    mode,
    editable,
  });
  callbacks.current = {
    onFocused,
    onSlashQueryChange,
    onRequestFocus,
    updateBlockContent,
    updateBlockAttrs,
    updateBlockType,
    splitBlock,
    mergeWithPrevious,
    blockId: block.id,
    documentId: block.documentId,
    mode,
    editable,
  };

  const editor = useEditor(
    {
      immediatelyRender: false,
      editable,
      extensions,
      content: initialContent,
      editorProps: {
        attributes: {
          class: `tiptap-prosemirror outline-none leading-7 text-slate-800 min-h-[1.75rem] ${className}`,
          "data-tiptap": "true",
          "data-block-mode": mode,
        },
        handleKeyDown: (_view: EditorView, event: KeyboardEvent) => {
          const ed = editorRef.current;
          const cb = callbacks.current;
          if (!ed || ed.isDestroyed || !cb.editable) return false;

          const isList =
            cb.mode === "bulletList" || cb.mode === "orderedList";

          if (event.key === "Enter" && !event.shiftKey) {
            if (isList) {
              // Check BEFORE TipTap creates the next <li>
              if (isEmptyListItem(ed)) {
                cb.updateBlockType(cb.blockId, "paragraph");
                cb.updateBlockContent(cb.blockId, "");
                cb.updateBlockAttrs(cb.blockId, { items: undefined });
                cb.onSlashQueryChange?.(null);
                cb.onRequestFocus(cb.blockId, 0);
                return true;
              }
              // Let TipTap insert another list item
              return false;
            }

            const from = ed.state.selection.from;
            const before = normalizeEmptyHtml(getHtmlBetween(ed, 0, from));
            const after = normalizeEmptyHtml(
              getHtmlBetween(ed, from, ed.state.doc.content.size),
            );
            const newId = cb.splitBlock(cb.documentId, cb.blockId, before, after);
            cb.onSlashQueryChange?.(null);
            cb.onRequestFocus(newId, 0);
            return true;
          }

          if (event.key === "Backspace") {
            const { empty, from } = ed.state.selection;
            if (!(empty && from <= 1)) return false;

            if (isList && isEmptyListItem(ed) && isSingleListItem(ed)) {
              cb.updateBlockType(cb.blockId, "paragraph");
              cb.updateBlockContent(cb.blockId, "");
              cb.updateBlockAttrs(cb.blockId, { items: undefined });
              cb.onRequestFocus(cb.blockId, 0);
              return true;
            }

            if (isList) return false;

            const merged = cb.mergeWithPrevious(cb.documentId, cb.blockId);
            if (!merged) return false;
            cb.onSlashQueryChange?.(null);
            cb.onRequestFocus(merged.previousBlockId, merged.caretOffset);
            return true;
          }

          return false;
        },
      },
      onCreate: ({ editor: ed }) => {
        editorRef.current = ed;
        if (
          (mode === "bulletList" || mode === "orderedList") &&
          Array.isArray(block.attrs.items) &&
          block.attrs.items.length > 0
        ) {
          const html = normalizeEmptyHtml(ed.getHTML());
          skipSync.current = true;
          updateBlockContent(block.id, html);
          updateBlockAttrs(block.id, { items: undefined });
        }
      },
    },
    [block.id, mode, extensions],
  );

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const persist = () => {
      const html = normalizeEmptyHtml(editor.getHTML());
      skipSync.current = true;
      const cb = callbacks.current;
      cb.updateBlockContent(cb.blockId, html);

      const plain = htmlToPlainText(html);
      if (cb.onSlashQueryChange) {
        if (plain.startsWith("/")) cb.onSlashQueryChange(plain.slice(1));
        else cb.onSlashQueryChange(null);
      }
      notifyTipTapToolbar();
    };

    const onFocus = () => {
      callbacks.current.onFocused();
      registerActiveTipTap({ blockId: callbacks.current.blockId, editor });
      notifyTipTapToolbar();
    };

    editor.on("update", persist);
    editor.on("selectionUpdate", notifyTipTapToolbar);
    editor.on("focus", onFocus);

    return () => {
      editor.off("update", persist);
      editor.off("selectionUpdate", notifyTipTapToolbar);
      editor.off("focus", onFocus);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }
    if (editor.isFocused) return;

    const next = toEditorHtml(block.content, mode, block.attrs);
    if (normalizeEmptyHtml(editor.getHTML()) !== normalizeEmptyHtml(next)) {
      editor.commands.setContent(next || "", { emitUpdate: false });
    }
  }, [editor, block.content, block.attrs, mode]);

  useEffect(() => {
    if (!autofocus || !editor || !editable || editor.isDestroyed) return;
    editor.commands.focus("end");
    if (typeof caret === "number") {
      try {
        editor.commands.setTextSelection(Math.max(1, caret + 1));
      } catch {
        editor.commands.focus("end");
      }
    }
    registerActiveTipTap({ blockId: block.id, editor });
    onAutofocusHandled?.();
  }, [autofocus, caret, editor, editable, block.id, onAutofocusHandled]);

  useEffect(() => {
    return () => {
      clearActiveTipTap(editor ?? undefined);
    };
  }, [editor]);

  if (!editor) {
    return (
      <div
        className={`min-h-[1.75rem] leading-7 text-slate-400 ${className}`}
        data-tiptap-loading="true"
      >
        {placeholder}
      </div>
    );
  }

  return (
    <div className="tiptap-block w-full" data-tiptap-root="true" data-mode={mode}>
      <EditorContent editor={editor} />
    </div>
  );
}

function isEmptyListItem(editor: Editor): boolean {
  if (!editor.isActive("listItem")) return false;
  const $from = editor.state.selection.$from;
  // Prefer the listItem node text, not only the inner paragraph
  for (let d = $from.depth; d > 0; d -= 1) {
    const node = $from.node(d);
    if (node.type.name === "listItem") {
      return node.textContent.trim().length === 0;
    }
  }
  return $from.parent.textContent.trim().length === 0;
}

function isSingleListItem(editor: Editor): boolean {
  let count = 0;
  editor.state.doc.descendants((node) => {
    if (node.type.name === "listItem") count += 1;
    return count < 3;
  });
  return count <= 1;
}
