import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import { FontSize } from "./font-size";

export type TipTapBlockMode = "text" | "bulletList" | "orderedList";

/**
 * Shared TipTap extension factory.
 * Mode switches which block nodes TipTap owns (paragraph vs native lists).
 */
export function createEditorExtensions(
  placeholder: string,
  mode: TipTapBlockMode = "text",
) {
  const isList = mode === "bulletList" || mode === "orderedList";

  return [
    StarterKit.configure({
      heading: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
      // Text blocks: TipTap only owns inline marks + paragraphs
      bulletList: mode === "bulletList" ? undefined : false,
      orderedList: mode === "orderedList" ? undefined : false,
      listItem: isList ? undefined : false,
    }),
    Underline,
    TextStyle,
    Color.configure({ types: ["textStyle"] }),
    FontSize,
    Placeholder.configure({
      placeholder,
      emptyEditorClass: "is-editor-empty",
      showOnlyWhenEditable: true,
    }),
  ];
}

/** @deprecated use createEditorExtensions */
export function createTextExtensions(placeholder: string) {
  return createEditorExtensions(placeholder, "text");
}
