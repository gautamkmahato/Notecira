"use client";

import { DocTextElement } from "./DocTextElement";
import type { DocElementEditorProps } from "./types";

export function DocNumberedList(props: DocElementEditorProps) {
  return <DocTextElement {...props} />;
}
