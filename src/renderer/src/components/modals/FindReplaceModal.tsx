import React, { useState } from 'react';
import { X, Search, Replace } from 'lucide-react';

interface FindReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFind: (term: string) => void;
  onReplaceAll: (findTerm: string, replaceTerm: string) => void;
}

export const FindReplaceModal: React.FC<FindReplaceModalProps> = ({ isOpen, onClose, onFind, onReplaceAll }) => {
  const [findTerm, setFindTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Search size={16} color="#0055b8" />
            <span>찾기 및 바꾸기 (Ctrl+F)</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-input-group">
            <label>찾을 내용:</label>
            <input
              type="text"
              className="modal-text-input"
              value={findTerm}
              onChange={(e) => setFindTerm(e.target.value)}
              placeholder="검색할 단어를 입력하세요"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && findTerm) onFind(findTerm);
              }}
            />
          </div>

          <div className="modal-input-group">
            <label>바꿀 내용:</label>
            <input type="text" className="modal-text-input" value={replaceTerm} onChange={(e) => setReplaceTerm(e.target.value)} placeholder="대체할 단어를 입력하세요" />
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="modal-btn"
            onClick={() => {
              if (findTerm) onFind(findTerm);
            }}
          >
            다음 찾기
          </button>
          <button
            type="button"
            className="modal-btn primary"
            onClick={() => {
              if (findTerm) {
                onReplaceAll(findTerm, replaceTerm);
                onClose();
              }
            }}
          >
            모두 바꾸기
          </button>
          <button type="button" className="modal-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
