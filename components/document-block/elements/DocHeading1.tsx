"use client";

import { headingSerif } from "@/lib/ui/notion";


import { DocTextElement } from "./DocTextElement";
import type { DocElementEditorProps } from "./types";

export function DocHeading1(props: DocElementEditorProps) {
  return (
    <DocTextElement
      {...props}
      splitOnEnter={false}
      placeholder="Heading 1"
      className={`${headingSerif} text-3xl font-semibold tracking-tight`}
    />
  );
}
