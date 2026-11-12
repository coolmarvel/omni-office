import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { parseCellCoord, parseRange, isCellInRange, colIndexToName, getCellsInRange } from '../utils/spreadsheetRange';
import { evaluateFormula } from '../utils/formulaEngine';
import { CellStyle } from './ExcelRibbon';

interface SheetCanvasProps {
  sheetData: Record<string, string>;
  cellStyles?: Record<string, CellStyle>;
  selectedCell: string;
  selectedRange?: { start: string; end: string } | null;
  onSelectCell: (coord: string) => void;
  onSelectRange?: (start: string, end: string) => void;
  onCellChange: (coord: string, value: string) => void;
  onDeleteCells?: (coords: string[]) => void;
  activeSheet: string;
  onSelectSheet: (sheetName: string) => void;
}

export const SheetCanvas: React.FC<SheetCanvasProps> = ({
  sheetData,
  cellStyles = {},
  selectedCell,
  selectedRange,
  onSelectCell,
  onSelectRange,
  onCellChange,
  onDeleteCells,
  activeSheet,
  onSelectSheet,
}) => {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const rows = Array.from({ length: 30 }, (_, i) => i + 1);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<string>(selectedCell);
  const [dragEnd, setDragEnd] = useState<string>(selectedCell);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const activeRange = dragStart && dragEnd ? parseRange(`${dragStart}:${dragEnd}`) : null;

  const handleMouseDown = (coord: string) => {
    if (editingCell && editingCell !== coord) {
      commitEdit();
    }
    setIsDragging(true);
    setDragStart(coord);
    setDragEnd(coord);
    onSelectCell(coord);
    onSelectRange?.(coord, coord);
  };

  const handleMouseEnter = (coord: string) => {
    if (isDragging) {
      setDragEnd(coord);
      onSelectRange?.(dragStart, coord);
    }
  };

  const startEditing = (coord: string, initialChar?: string) => {
    setEditingCell(coord);
    if (initialChar !== undefined) {
      setEditValue(initialChar);
    } else {
      setEditValue(sheetData[coord] || '');
    }
  };

  const commitEdit = () => {
    if (editingCell) {
      onCellChange(editingCell, editValue);
      setEditingCell(null);
      containerRef.current?.focus();
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    containerRef.current?.focus();
  };

  const moveSelection = (dCol: number, dRow: number) => {
    if (editingCell) {
      commitEdit();
    }
    const { colIndex, row } = parseCellCoord(selectedCell);
    const newColIndex = Math.max(0, Math.min(cols.length - 1, colIndex + dCol));
    const newRow = Math.max(1, Math.min(rows.length, row + dRow));
    const newCoord = `${colIndexToName(newColIndex)}${newRow}`;
    setDragStart(newCoord);
    setDragEnd(newCoord);
    onSelectCell(newCoord);
    onSelectRange?.(newCoord, newCoord);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editingCell) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
        moveSelection(0, 1);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        commitEdit();
        moveSelection(e.shiftKey ? -1 : 1, 0);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
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
      startEditing(selectedCell);
    } else if (e.key === 'F2') {
      e.preventDefault();
      startEditing(selectedCell);
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
    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      // Printable key: start editing directly with that character (Excel behavior)
      e.preventDefault();
      startEditing(selectedCell, e.key);
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
                  const displayVal = !rawVal.startsWith('=') ? rawVal : evaluateFormula(rawVal, sheetData);

                  const customStyle = cellStyles[cellId] || {};

                  // 기본 서식
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
                      onDoubleClick={() => startEditing(cellId)}
                      style={{
                        textAlign: customStyle.align || (isNumberCol ? 'right' : isCenterCol ? 'center' : 'left'),
                        fontWeight: customStyle.bold ? 'bold' : isHeader || isTotal ? 'bold' : 'normal',
                        fontStyle: customStyle.italic ? 'italic' : 'normal',
                        textDecoration: customStyle.underline ? 'underline' : 'none',
                        fontFamily: customStyle.fontFamily || undefined,
                        fontSize: customStyle.fontSize ? `${customStyle.fontSize}pt` : undefined,
                        color: customStyle.textColor || undefined,
                        backgroundColor: customStyle.bgColor || (isHeader ? '#f8f9fa' : isTotal ? '#f2f9f4' : inRange && !isSelected ? '#e8f5e9' : undefined),
                        cursor: 'cell',
                        position: 'relative',
                        userSelect: isEditing ? 'text' : 'none',
                      }}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="text"
                          className="sheet-cell-editor"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              commitEdit();
                              moveSelection(0, 1);
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              cancelEdit();
                            }
                          }}
                        />
                      ) : (
                        displayVal
                      )}
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
