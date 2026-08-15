"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Block } from "@/lib/domain/types";
import { useDocumentStore } from "@/lib/document-store";
import { ensureTableAttrs } from "@/lib/editor/block-meta";
import {
  deleteCol,
  deleteRow,
  insertColAfter,
  insertColBefore,
  insertRowAfter,
  insertRowBefore,
  updateCell,
  type TableData,
} from "@/lib/editor/table-ops";
import { useDismissOnOutsideClick } from "@/lib/editor/toolbar/hooks/use-dismiss-on-outside-click";

type TableBlockProps = {
  block: Block;
  editable?: boolean;
  onSelect: () => void;
};

type ActiveCell = { row: number; col: number };

const MENU_ITEMS = [
  { id: "row-before", label: "Insert row before" },
  { id: "row-after", label: "Insert row after" },
  { id: "col-before", label: "Insert column before" },
  { id: "col-after", label: "Insert column after" },
  { id: "delete-row", label: "Delete row", danger: true },
  { id: "delete-col", label: "Delete column", danger: true },
] as const;

export function TableBlock({ block, editable = true, onSelect }: TableBlockProps) {
  const updateBlockAttrs = useDocumentStore((s) => s.updateBlockAttrs);
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const table = ensureTableAttrs(block.attrs);

  useDismissOnOutsideClick(menuRef, menuOpen, () => setMenuOpen(false));

  useEffect(() => {
    setMenuOpen(false);
  }, [activeCell?.row, activeCell?.col]);

  const onPatch = (next: TableData) => {
    updateBlockAttrs(block.id, next);
  };

  const handleMenuAction = (actionId: (typeof MENU_ITEMS)[number]["id"]) => {
    if (!activeCell) return;
    const { row, col } = activeCell;
    let next: TableData | null = table;

    switch (actionId) {
      case "row-before":
        next = insertRowBefore(table, row);
        break;
      case "row-after":
        next = insertRowAfter(table, row);
        break;
      case "col-before":
        next = insertColBefore(table, col);
        break;
      case "col-after":
        next = insertColAfter(table, col);
        break;
      case "delete-row":
        next = deleteRow(table, row);
        if (next) {
          setActiveCell({ row: Math.min(row, next.rows - 1), col });
        } else {
          return;
        }
        break;
      case "delete-col":
        next = deleteCol(table, col);
        if (next) {
          setActiveCell({ row, col: Math.min(col, next.cols - 1) });
        } else {
          return;
        }
        break;
    }

    if (!next) return;
    onPatch(next);
    setMenuOpen(false);
  };

  const isMenuDisabled = (actionId: (typeof MENU_ITEMS)[number]["id"]) => {
    if (!activeCell) return true;
    if (actionId === "delete-row") return table.rows <= 1;
    if (actionId === "delete-col") return table.cols <= 1;
    return false;
  };

  return (
    <div className="scrollbar-custom overflow-x-auto" onFocus={onSelect}>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {table.cells.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => {
                const isActive =
                  activeCell?.row === r && activeCell?.col === c;
                return (
                  <td
                    key={`${r}-${c}`}
                    className={`relative border border-[var(--color-light-gray-2)] bg-[var(--color-white)] p-0 ${
                      isActive ? "ring-1 ring-inset ring-[var(--color-blue-40)]" : ""
                    }`}
                  >
                    {isActive && editable ? (
                      <div
                        ref={menuRef}
                        className="absolute left-1/2 top-0 z-[var(--z-2)] -translate-x-1/2 -translate-y-1/2"
                      >
                        <button
                          type="button"
                          title="Table options"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setMenuOpen((v) => !v)}
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-light-gray-2)] bg-[var(--color-white)] text-[var(--color-mid-gray)] shadow-[var(--shadow-sm)] hover:bg-[var(--notion-hover)]"
                        >
                          <ChevronDown size={12} strokeWidth={2} />
                        </button>
                        {menuOpen ? (
                          <div className="notion-menu absolute left-1/2 top-full z-[var(--z-14)] mt-1 w-48 -translate-x-1/2 py-1">
                            {MENU_ITEMS.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                disabled={isMenuDisabled(item.id)}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleMenuAction(item.id)}
                                className={`notion-menu-item disabled:opacity-40 ${
                                  "danger" in item && item.danger
                                    ? "text-[var(--notion-danger)] hover:bg-[var(--notion-danger-bg)]"
                                    : ""
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <input
                      value={cell}
                      onFocus={() => {
                        setActiveCell({ row: r, col: c });
                        onSelect();
                      }}
                      readOnly={!editable}
                      onChange={(e) => {
                        if (!editable) return;
                        onPatch(updateCell(table, r, c, e.target.value));
                      }}
                      className="w-full min-w-[80px] bg-transparent px-2 py-2 pt-2.5 outline-none"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
