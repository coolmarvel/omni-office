import React, { useState } from 'react';
import { X, Sliders } from 'lucide-react';

interface PageSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyMargin: (margins: { top: number; bottom: number; left: number; right: number }) => void;
}

export const PageSetupModal: React.FC<PageSetupModalProps> = ({ isOpen, onClose, onApplyMargin }) => {
  const [top, setTop] = useState(20);
  const [bottom, setBottom] = useState(15);
  const [left, setLeft] = useState(30);
  const [right, setRight] = useState(30);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Sliders size={16} color="#0055b8" />
            <span>쪽 여백 설정 (F7)</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '12px', color: '#1e3a8a' }}>용지 종류: A4 (210 x 297 mm) | 방향: 세로</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="modal-input-group">
              <label>위쪽 여백 (mm):</label>
              <input type="number" min={5} max={60} className="modal-text-input" value={top} onChange={(e) => setTop(parseInt(e.target.value, 10) || 20)} />
            </div>
            <div className="modal-input-group">
              <label>아래쪽 여백 (mm):</label>
              <input type="number" min={5} max={60} className="modal-text-input" value={bottom} onChange={(e) => setBottom(parseInt(e.target.value, 10) || 15)} />
            </div>
            <div className="modal-input-group">
              <label>왼쪽 여백 (mm):</label>
              <input type="number" min={5} max={60} className="modal-text-input" value={left} onChange={(e) => setLeft(parseInt(e.target.value, 10) || 30)} />
            </div>
            <div className="modal-input-group">
              <label>오른쪽 여백 (mm):</label>
              <input type="number" min={5} max={60} className="modal-text-input" value={right} onChange={(e) => setRight(parseInt(e.target.value, 10) || 30)} />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="modal-btn primary"
            onClick={() => {
              onApplyMargin({ top, bottom, left, right });
              onClose();
            }}
          >
            설정
          </button>
          <button type="button" className="modal-btn" onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
