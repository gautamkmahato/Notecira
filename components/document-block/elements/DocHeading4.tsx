"use client";

import { DocTextElement } from "./DocTextElement";
import type { DocElementEditorProps } from "./types";

export function DocHeading4(props: DocElementEditorProps) {
  return (
    <DocTextElement
      {...props}
      splitOnEnter={false}
      placeholder="Heading 4"
      className="text-lg font-semibold"
    />
  );
}
