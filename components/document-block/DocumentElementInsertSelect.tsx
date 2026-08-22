"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { requestDocumentElementInsert } from "@/lib/document-block/active-element";
import type { DocumentInsertableType } from "@/lib/document-block/types";
import { DOCUMENT_ELEMENT_INSERT_OPTIONS } from "./constants";

const PLACEHOLDER_VALUE = "__insert__" as const;
type InsertSelectValue = DocumentInsertableType | typeof PLACEHOLDER_VALUE;

type DocumentElementInsertSelectProps = {
  blockId: string | null;
};

export function DocumentElementInsertSelect({
  blockId,
}: DocumentElementInsertSelectProps) {
  const [value, setValue] = useState<InsertSelectValue>(PLACEHOLDER_VALUE);

  return (
    <Select<InsertSelectValue>
      value={value}
      onChange={(next) => {
        if (!blockId || next === PLACEHOLDER_VALUE) return;
        requestDocumentElementInsert(blockId, next);
        setValue(PLACEHOLDER_VALUE);
      }}
      options={[
        { value: PLACEHOLDER_VALUE, label: "Insert element" },
        ...DOCUMENT_ELEMENT_INSERT_OPTIONS,
      ]}
      placeholder="Insert element"
      disabled={!blockId}
      className="min-w-[148px]"
      groupLabel="Elements"
    />
  );
}
