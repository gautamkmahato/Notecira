"use client";

import { ensureTableAttrs } from "@/lib/editor/block-meta";
import type { ToolbarOptionDef } from "../types";

export const tableOptions: ToolbarOptionDef[] = [
  {
    id: "table-add-row",
    label: "Add row",
    render: ({ block, patchAttrs }) => {
      const table = ensureTableAttrs(block.attrs);
      return (
        <button
          type="button"
          className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
          onClick={() => {
            const cells = [
              ...table.cells,
              Array.from({ length: table.cols }, () => ""),
            ];
            patchAttrs({ rows: table.rows + 1, cols: table.cols, cells });
          }}
        >
          + Row
        </button>
      );
    },
  },
  {
    id: "table-add-col",
    label: "Add column",
    render: ({ block, patchAttrs }) => {
      const table = ensureTableAttrs(block.attrs);
      return (
        <button
          type="button"
          className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
          onClick={() => {
            const cells = table.cells.map((row) => [...row, ""]);
            patchAttrs({ rows: table.rows, cols: table.cols + 1, cells });
          }}
        >
          + Column
        </button>
      );
    },
  },
  {
    id: "table-remove-row",
    label: "Remove row",
    render: ({ block, patchAttrs }) => {
      const table = ensureTableAttrs(block.attrs);
      return (
        <button
          type="button"
          disabled={table.rows <= 1}
          className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          onClick={() => {
            if (table.rows <= 1) return;
            const cells = table.cells.slice(0, -1);
            patchAttrs({ rows: table.rows - 1, cols: table.cols, cells });
          }}
        >
          − Row
        </button>
      );
    },
  },
  {
    id: "table-remove-col",
    label: "Remove column",
    render: ({ block, patchAttrs }) => {
      const table = ensureTableAttrs(block.attrs);
      return (
        <button
          type="button"
          disabled={table.cols <= 1}
          className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          onClick={() => {
            if (table.cols <= 1) return;
            const cells = table.cells.map((row) => row.slice(0, -1));
            patchAttrs({ rows: table.rows, cols: table.cols - 1, cells });
          }}
        >
          − Column
        </button>
      );
    },
  },
];
