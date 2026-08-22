"use client";

import { DocTextElement } from "./DocTextElement";
import type { DocElementEditorProps } from "./types";

export function DocBulletList(props: DocElementEditorProps) {
  return <DocTextElement {...props} />;
}
