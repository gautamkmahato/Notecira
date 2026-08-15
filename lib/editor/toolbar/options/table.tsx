"use client";

import type { ToolbarOptionDef } from "../types";

export const tableOptions: ToolbarOptionDef[] = [
  {
    id: "table-hint",
    label: "Hint",
    render: () => (
      <span className="px-2 text-[var(--font-size-sm)] text-[var(--color-mid-gray)]">
        Use the arrow on a cell for row/column options
      </span>
    ),
  },
];
