import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { parseCellCoord, parseRange, isCellInRange, colIndexToName, getCellsInRange } from '../utils/spreadsheetRange';
import { evaluateFormula } from '../utils/formulaEngine';

interface SheetCanvasProps {
  sheetData: Record<string, string>;
  selectedCell: string;
  selectedRange?: { start: string; end: string } | null;
  onSelectCell: (coord: string) => void;
  onSelectRange?: (start: string, end: string) => void;
  onCellChange: (coord: string, value: string) => void;
  onDeleteCells?: (coords: string[]) => void;
  activeSheet: string;
  onSelectSheet: (sheetName: string) => void;
}

export const SheetCanvas: React.FC<SheetCanvasProps> = ({ sheetData, selectedCell, selectedRange, onSelectCell, onSelectRange, onCellChange, onDeleteCells, activeSheet, onSelectSheet }) => {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const rows = Array.from({ length: 30 }, (_, i) => i + 1);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<string>(selectedCell);
  const [dragEnd, setDragEnd] = useState<string>(selectedCell);
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal range with props if provided
  useEffect(() => {
    if (selectedRange) {
      setDragStart(selectedRange.start);
      setDragEnd(selectedRange.end);
    }
  }, [selectedRange]);

  // Window mouseup listener to end dragging anywhere
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const activeRange = dragStart && dragEnd ? parseRange(`${dragStart}:${dragEnd}`) : null;

  const handleMouseDown = (coord: string) => {
    setIsDragging(true);
    setDragStart(coord);
    setDragEnd(coord);
    setEditingCell(null);
    onSelectCell(coord);
    onSelectRange?.(coord, coord);
  };

  const handleMouseEnter = (coord: string) => {
    if (isDragging) {
      setDragEnd(coord);
      onSelectRange?.(dragStart, coord);
    }
  };

  const moveSelection = (dCol: number, dRow: number) => {
    const { colIndex, row } = parseCellCoord(selectedCell);
    const newColIndex = Math.max(0, Math.min(cols.length - 1, colIndex + dCol));
    const newRow = Math.max(1, Math.min(rows.length, row + dRow));
    const newCoord = `${colIndexToName(newColIndex)}${newRow}`;
    setDragStart(newCoord);
    setDragEnd(newCoord);
    setEditingCell(null);
    onSelectCell(newCoord);
    onSelectRange?.(newCoord, newCoord);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editingCell) {
      if (e.key === 'Enter') {
        e.preventDefault();
        setEditingCell(null);
        moveSelection(0, 1);
      } else if (e.key === 'Escape') {
        setEditingCell(null);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveSelection(0, -1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveSelection(0, 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveSelection(-1, 0);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveSelection(1, 0);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      moveSelection(e.shiftKey ? -1 : 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      moveSelection(0, e.shiftKey ? -1 : 1);
    } else if (e.key === 'F2') {
      e.preventDefault();
      setEditingCell(selectedCell);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      if (dragStart && dragEnd && dragStart !== dragEnd) {
        const cells = getCellsInRange(`${dragStart}:${dragEnd}`);
        if (onDeleteCells) {
          onDeleteCells(cells);
        } else {
          cells.forEach((c) => onCellChange(c, ''));
        }
      } else {
        onCellChange(selectedCell, '');
      }
    }
  };

  return (
    <div className="sheet-container" ref={containerRef} tabIndex={0} onKeyDown={handleKeyDown} style={{ outline: 'none' }}>
      {/* 1. 스프레드시트 테이블 그리드 */}
      <div className="sheet-grid-wrapper">
        <table className="sheet-table">
          <thead>
            <tr>
              <th className="row-header" />
              {cols.map((col) => (
                <th
                  key={col}
                  style={{
                    width: col === 'B' ? '240px' : col === 'F' ? '140px' : col === 'C' || col === 'D' ? '120px' : '95px',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row}>
                <th className="row-header">{row}</th>
                {cols.map((col) => {
                  const cellId = `${col}${row}`;
                  const isSelected = selectedCell === cellId;
                  const inRange = activeRange ? isCellInRange(cellId, activeRange) : false;
                  const isEditing = editingCell === cellId;

                  const rawVal = sheetData[cellId] || '';
                  // Display formula evaluation result when not editing
                  const displayVal = isEditing || !rawVal.startsWith('=') ? rawVal : evaluateFormula(rawVal, sheetData);

                  // Formatting & Alignment
                  const isHeader = row === 1;
                  const isTotal = row === 6;
                  const isNumberCol = col === 'C' || col === 'D' || col === 'E';
                  const isCenterCol = col === 'A' || col === 'F';

                  const cellClasses = [isSelected ? 'active-cell' : '', inRange && !isSelected ? 'selected-in-range' : ''].filter(Boolean).join(' ');

                  return (
                    <td
                      key={cellId}
                      className={cellClasses}
                      onMouseDown={() => handleMouseDown(cellId)}
                      onMouseEnter={() => handleMouseEnter(cellId)}
                      onDoubleClick={() => setEditingCell(cellId)}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const val = e.currentTarget.textContent || '';
                        onCellChange(cellId, val);
                        setEditingCell(null);
                      }}
                      style={{
                        textAlign: isNumberCol ? 'right' : isCenterCol ? 'center' : 'left',
                        fontWeight: isHeader || isTotal ? 'bold' : 'normal',
                        backgroundColor: isHeader ? '#f8f9fa' : isTotal ? '#f2f9f4' : inRange && !isSelected ? '#e8f5e9' : undefined,
                        cursor: 'cell',
                        userSelect: isEditing ? 'text' : 'none',
                      }}
                    >
                      {displayVal}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. 하단 워크시트 탭 바 */}
      <div className="sheet-tabs-footer">
        <button type="button" className={`sheet-tab-btn ${activeSheet === '예산총괄' ? 'active' : ''}`} onClick={() => onSelectSheet('예산총괄')}>
          예산총괄
        </button>
        <button type="button" className={`sheet-tab-btn ${activeSheet === '세부명세' ? 'active' : ''}`} onClick={() => onSelectSheet('세부명세')}>
          세부명세
        </button>
        <button type="button" className="sheet-tab-add-btn" onClick={() => alert('새 워크시트 추가: Sheet3')} title="새 워크시트 추가">
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
};
