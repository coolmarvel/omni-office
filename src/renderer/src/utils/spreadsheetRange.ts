// Utility for spreadsheet cell coordinates and range calculations

export interface CellCoord {
  col: string;
  colIndex: number;
  row: number;
}

export interface CellRange {
  start: CellCoord;
  end: CellCoord;
  minColIndex: number;
  maxColIndex: number;
  minRow: number;
  maxRow: number;
}

export function parseCellCoord(coord: string): CellCoord {
  const match = coord
    .trim()
    .toUpperCase()
    .match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    return { col: 'A', colIndex: 0, row: 1 };
  }
  const col = match[1];
  const row = parseInt(match[2], 10);
  let colIndex = 0;
  for (let i = 0; i < col.length; i++) {
    colIndex = colIndex * 26 + (col.charCodeAt(i) - 64);
  }
  return { col, colIndex: colIndex - 1, row };
}

export function colIndexToName(index: number): string {
  let name = '';
  let temp = index;
  while (temp >= 0) {
    name = String.fromCharCode((temp % 26) + 65) + name;
    temp = Math.floor(temp / 26) - 1;
  }
  return name;
}

export function parseRange(rangeStr: string): CellRange {
  const parts = rangeStr.split(':');
  const start = parseCellCoord(parts[0]);
  const end = parts.length > 1 ? parseCellCoord(parts[1]) : start;

  const minColIndex = Math.min(start.colIndex, end.colIndex);
  const maxColIndex = Math.max(start.colIndex, end.colIndex);
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);

  return {
    start,
    end,
    minColIndex,
    maxColIndex,
    minRow,
    maxRow,
  };
}

export function getCellsInRange(rangeStr: string): string[] {
  const range = parseRange(rangeStr);
  const cells: string[] = [];
  for (let r = range.minRow; r <= range.maxRow; r++) {
    for (let c = range.minColIndex; c <= range.maxColIndex; c++) {
      cells.push(`${colIndexToName(c)}${r}`);
    }
  }
  return cells;
}

export function isCellInRange(coord: string, range: CellRange): boolean {
  const { colIndex, row } = parseCellCoord(coord);
  return colIndex >= range.minColIndex && colIndex <= range.maxColIndex && row >= range.minRow && row <= range.maxRow;
}
