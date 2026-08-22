"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { MARKDOWN_INSERT_OPTIONS } from "./constants";

const PLACEHOLDER_VALUE = "__insert__" as const;

type MarkdownElementInsertSelectProps = {
  blockId: string | null;
};

/** Stub for future markdown-specific insert actions. */
export function MarkdownElementInsertSelect({
  blockId,
}: MarkdownElementInsertSelectProps) {
  const [value, setValue] = useState<string>(PLACEHOLDER_VALUE);

  return (
    <Select
      value={value}
      onChange={(next) => {
        if (!blockId || next === PLACEHOLDER_VALUE) return;
        setValue(PLACEHOLDER_VALUE);
      }}
      options={[
        { value: PLACEHOLDER_VALUE, label: "Insert element" },
        ...MARKDOWN_INSERT_OPTIONS,
      ]}
      placeholder="Insert element"
      disabled={!blockId}
      className="min-w-[148px]"
      groupLabel="Elements"
    />
  );
}
