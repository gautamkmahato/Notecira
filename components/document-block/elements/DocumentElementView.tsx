"use client";

import type { DocumentElement } from "@/lib/document-block/types";
import { DocBulletList } from "./DocBulletList";
import { DocCode } from "./DocCode";
import { DocHeading1 } from "./DocHeading1";
import { DocHeading2 } from "./DocHeading2";
import { DocHeading3 } from "./DocHeading3";
import { DocHeading4 } from "./DocHeading4";
import { DocNumberedList } from "./DocNumberedList";
import { DocParagraph } from "./DocParagraph";
import type { DocElementEditorProps } from "./types";

type DocumentElementViewProps = Omit<DocElementEditorProps, "element"> & {
  element: DocumentElement;
};

export function DocumentElementView(props: DocumentElementViewProps) {
  switch (props.element.type) {
    case "heading_1":
      return <DocHeading1 {...props} />;
    case "heading_2":
      return <DocHeading2 {...props} />;
    case "heading_3":
      return <DocHeading3 {...props} />;
    case "heading_4":
      return <DocHeading4 {...props} />;
    case "bullet_list":
      return <DocBulletList {...props} />;
    case "numbered_list":
      return <DocNumberedList {...props} />;
    case "code":
      return <DocCode {...props} />;
    case "paragraph":
    default:
      return <DocParagraph {...props} />;
  }
}
