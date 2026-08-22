"use client";

import { DocTextElement } from "./DocTextElement";
import type { DocElementEditorProps } from "./types";

export function DocHeading3(props: DocElementEditorProps) {
  return (
    <DocTextElement
      {...props}
      splitOnEnter={false}
      placeholder="Heading 3"
      className="text-xl font-semibold"
    />
  );
}
