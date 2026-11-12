import React, { useState } from 'react';
import { X, Table } from 'lucide-react';

interface TableInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTable: (rows: number, cols: number) => void;
}

export const TableInsertModal: React.FC<TableInsertModalProps> = ({ isOpen, onClose, onInsertTable }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Table size={16} color="#0055b8" />
            <span>표 만들기 (Ctrl+N, T)</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="modal-input-group" style={{ flex: 1 }}>
              <label>줄 수 (행):</label>
              <input type="number" min={1} max={50} className="modal-text-input" value={rows} onChange={(e) => setRows(Math.max(1, parseInt(e.target.value, 10) || 1))} />
            </div>

            <div className="modal-input-group" style={{ flex: 1 }}>
              <label>칸 수 (열):</label>
              <input type="number" min={1} max={20} className="modal-text-input" value={cols} onChange={(e) => setCols(Math.max(1, parseInt(e.target.value, 10) || 1))} />
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#666', marginTop: '10px' }}>공공 표준 규격의 테두리 및 헤더 스타일이 자동으로 적용됩니다.</div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="modal-btn primary"
            onClick={() => {
              onInsertTable(rows, cols);
              onClose();
            }}
          >
            만들기
          </button>
          <button type="button" className="modal-btn" onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
