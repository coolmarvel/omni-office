import React from 'react';
import { Plus } from 'lucide-react';

interface SheetCanvasProps {
  sheetData: Record<string, string>;
  selectedCell: string;
  onSelectCell: (coord: string) => void;
  onCellChange: (coord: string, value: string) => void;
  activeSheet: string;
  onSelectSheet: (sheetName: string) => void;
}

export const SheetCanvas: React.FC<SheetCanvasProps> = ({ sheetData, selectedCell, onSelectCell, onCellChange, activeSheet, onSelectSheet }) => {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const rows = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="sheet-container">
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
                  const cellVal = sheetData[cellId] || '';

                  // 정렬 및 스타일
                  const isHeader = row === 1;
                  const isTotal = row === 6;
                  const isNumberCol = col === 'C' || col === 'D' || col === 'E';
                  const isCenterCol = col === 'A' || col === 'F';

                  return (
                    <td
                      key={cellId}
                      className={isSelected ? 'active-cell' : ''}
                      onClick={() => onSelectCell(cellId)}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => onCellChange(cellId, e.currentTarget.textContent || '')}
                      style={{
                        textAlign: isNumberCol ? 'right' : isCenterCol ? 'center' : 'left',
                        fontWeight: isHeader || isTotal ? 'bold' : 'normal',
                        backgroundColor: isHeader ? '#f8f9fa' : isTotal ? '#f2f9f4' : undefined,
                      }}
                    >
                      {cellVal}
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
