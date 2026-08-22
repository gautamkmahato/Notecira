"use client";

import { DocTextElement } from "./DocTextElement";
import type { DocElementEditorProps } from "./types";

export function DocHeading1(props: DocElementEditorProps) {
  return (
    <DocTextElement
      {...props}
      splitOnEnter={false}
      placeholder="Heading 1"
      className="font-serif text-3xl font-semibold tracking-tight"
    />
  );
}
