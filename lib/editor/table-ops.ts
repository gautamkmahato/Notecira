export type TableData = {
  rows: number;
  cols: number;
  cells: string[][];
};

export function insertRowBefore(
  table: TableData,
  rowIndex: number,
): TableData {
  const cells = [...table.cells];
  cells.splice(rowIndex, 0, Array.from({ length: table.cols }, () => ""));
  return { rows: table.rows + 1, cols: table.cols, cells };
}

export function insertRowAfter(table: TableData, rowIndex: number): TableData {
  return insertRowBefore(table, rowIndex + 1);
}

export function insertColBefore(
  table: TableData,
  colIndex: number,
): TableData {
  const cells = table.cells.map((row) => {
    const next = [...row];
    next.splice(colIndex, 0, "");
    return next;
  });
  return { rows: table.rows, cols: table.cols + 1, cells };
}

export function insertColAfter(table: TableData, colIndex: number): TableData {
  return insertColBefore(table, colIndex + 1);
}

export function deleteRow(table: TableData, rowIndex: number): TableData | null {
  if (table.rows <= 1) return null;
  const cells = table.cells.filter((_, i) => i !== rowIndex);
  return { rows: table.rows - 1, cols: table.cols, cells };
}

export function deleteCol(table: TableData, colIndex: number): TableData | null {
  if (table.cols <= 1) return null;
  const cells = table.cells.map((row) => row.filter((_, i) => i !== colIndex));
  return { rows: table.rows, cols: table.cols - 1, cells };
}

export function updateCell(
  table: TableData,
  rowIndex: number,
  colIndex: number,
  value: string,
): TableData {
  const cells = table.cells.map((rowCells, ri) =>
    rowCells.map((cell, ci) =>
      ri === rowIndex && ci === colIndex ? value : cell,
    ),
  );
  return { ...table, cells };
}
