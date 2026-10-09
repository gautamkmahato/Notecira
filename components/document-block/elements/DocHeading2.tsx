"use client";

import { headingSerif } from "@/lib/ui/notion";


import { DocTextElement } from "./DocTextElement";
import type { DocElementEditorProps } from "./types";

export function DocHeading2(props: DocElementEditorProps) {
  return (
    <DocTextElement
      {...props}
      splitOnEnter={false}
      placeholder="Heading 2"
      className={`${headingSerif} text-2xl font-semibold tracking-tight`}
    />
  );
}
