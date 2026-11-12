import React from 'react';
import { FileText, FileSpreadsheet, FileCode, FolderOpen, Save, Printer, X, PlusCircle, FileEdit } from 'lucide-react';
import { DocType } from '../types';

interface FileMenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNewDoc: (docType: DocType) => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onSaveAsFile: () => void;
  onPrint: () => void;
  onExportPdf: () => void;
}

export const FileMenuDropdown: React.FC<FileMenuDropdownProps> = ({ isOpen, onClose, onNewDoc, onOpenFile, onSaveFile, onSaveAsFile, onPrint, onExportPdf }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="file-dropdown-backdrop" onClick={onClose} />
      <div className="file-dropdown-overlay">
        <div className="file-menu-header">새 문서 만들기 (New Document)</div>

        <button
          type="button"
          className="file-menu-item"
          onClick={() => {
            onNewDoc('hwp');
            onClose();
          }}
        >
          <FileText size={16} color="#0055b8" />
          <span>새 한글 문서 (.hwp)</span>
          <span className="file-menu-shortcut">Ctrl+N</span>
        </button>

        <button
          type="button"
          className="file-menu-item"
          onClick={() => {
            onNewDoc('xlsx');
            onClose();
          }}
        >
          <FileSpreadsheet size={16} color="#107c41" />
          <span>새 스프레드시트 (.xlsx)</span>
          <span className="file-menu-shortcut">Alt+N</span>
        </button>

        <button
          type="button"
          className="file-menu-item"
          onClick={() => {
            onNewDoc('docx');
            onClose();
          }}
        >
          <FileEdit size={16} color="#2b579a" />
          <span>새 워드 문서 (.docx)</span>
        </button>

        <button
          type="button"
          className="file-menu-item"
          onClick={() => {
            onNewDoc('md');
            onClose();
          }}
        >
          <FileCode size={16} color="#4b5563" />
          <span>새 마크다운 문서 (.md)</span>
        </button>

        <div className="file-menu-divider" />

        <div className="file-menu-header">파일 관리 및 저장</div>

        <button
          type="button"
          className="file-menu-item"
          onClick={() => {
            onOpenFile();
            onClose();
          }}
        >
          <FolderOpen size={16} color="#d97706" />
          <span>문서 열기...</span>
          <span className="file-menu-shortcut">Ctrl+O</span>
        </button>

        <button
          type="button"
          className="file-menu-item"
          onClick={() => {
            onSaveFile();
            onClose();
          }}
        >
          <Save size={16} color="#0055b8" />
          <span>저장</span>
          <span className="file-menu-shortcut">Ctrl+S</span>
        </button>

        <button
          type="button"
          className="file-menu-item"
          onClick={() => {
            onSaveAsFile();
            onClose();
          }}
        >
          <PlusCircle size={16} color="#059669" />
          <span>다른 이름으로 저장...</span>
          <span className="file-menu-shortcut">Ctrl+Shift+S</span>
        </button>

        <div className="file-menu-divider" />

        <button
          type="button"
          className="file-menu-item"
          onClick={() => {
            onExportPdf();
            onClose();
          }}
        >
          <FileText size={16} color="#dc2626" />
          <span>PDF로 내보내기...</span>
          <span className="file-menu-shortcut">Ctrl+E</span>
        </button>

        <button
          type="button"
          className="file-menu-item"
          onClick={() => {
            onPrint();
            onClose();
          }}
        >
          <Printer size={16} color="#374151" />
          <span>인쇄 미리보기 및 출력</span>
          <span className="file-menu-shortcut">Ctrl+P</span>
        </button>

        <div className="file-menu-divider" />

        <button type="button" className="file-menu-item" onClick={onClose}>
          <X size={16} color="#dc2626" />
          <span>메뉴 닫기</span>
          <span className="file-menu-shortcut">Esc</span>
        </button>
      </div>
    </>
  );
};
