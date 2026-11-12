import React from 'react';
import { X } from 'lucide-react';

interface SymbolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol: (symbol: string) => void;
}

const COMMON_SYMBOLS = [
  '※',
  '★',
  '☆',
  '■',
  '□',
  '▲',
  '▼',
  '◀',
  '▶',
  '●',
  '○',
  '◆',
  '◇',
  '㈜',
  '㈀',
  '㈁',
  '㈂',
  '㈃',
  '㈄',
  '㈅',
  '㈆',
  '㈇',
  '㈈',
  '㈉',
  '①',
  '②',
  '③',
  '④',
  '⑤',
  '⑥',
  '⑦',
  '⑧',
  '⑨',
  '⑩',
  '℃',
  '℉',
  '±',
  '×',
  '÷',
  '≠',
  '≤',
  '≥',
  '∞',
  '≒',
  '√',
  '°',
  '′',
  '″',
  '§',
  '¶',
  '†',
  '‡',
  '‰',
  '∴',
  '∵',
  'Ω',
  '♠',
  '♣',
  '♥',
  '♦',
  '♀',
  '♂',
  '☞',
  '☜',
  '✓',
  '✔',
  '✕',
];

export const SymbolModal: React.FC<SymbolModalProps> = ({ isOpen, onClose, onSelectSymbol }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog symbol-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#0055b8' }}>※</span>
            <span>문자표 입력 (Ctrl+F10)</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ fontSize: '12px', color: '#4b5563', marginBottom: '8px' }}>자주 사용하는 특수문자 및 기호를 클릭하여 문서에 바로 삽입하세요:</div>

          <div className="symbol-grid">
            {COMMON_SYMBOLS.map((sym) => (
              <button
                key={sym}
                type="button"
                className="symbol-cell-btn"
                onClick={() => {
                  onSelectSymbol(sym);
                  onClose();
                }}
                title={sym}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="modal-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
