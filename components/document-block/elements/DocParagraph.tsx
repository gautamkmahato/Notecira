"use client";

import { DocTextElement } from "./DocTextElement";
import type { DocElementEditorProps } from "./types";

export function DocParagraph(props: DocElementEditorProps) {
  return <DocTextElement {...props} />;
}
