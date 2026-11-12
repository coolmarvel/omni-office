import React from 'react';
import { FileText, FileSpreadsheet, FileCode, FileEdit, Plus, X } from 'lucide-react';
import { DocumentTab, DocType } from '../types';

interface DocTabsProps {
  tabs: DocumentTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: (docType: DocType) => void;
}

export const DocTabs: React.FC<DocTabsProps> = ({ tabs, activeTabId, onSelectTab, onCloseTab, onNewTab }) => {
  const renderDocIcon = (type: DocType) => {
    switch (type) {
      case 'xlsx':
        return <FileSpreadsheet size={14} color="#107c41" />;
      case 'docx':
        return <FileEdit size={14} color="#2b579a" />;
      case 'md':
        return <FileCode size={14} color="#4b5563" />;
      case 'hwp':
      default:
        return <FileText size={14} color="#0055b8" />;
    }
  };

  return (
    <div className="omni-doc-tabs">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <div key={tab.id} className={`doc-tab ${isActive ? 'active' : ''}`} onClick={() => onSelectTab(tab.id)} title={tab.filePath || tab.title}>
            {renderDocIcon(tab.docType)}
            <span className="doc-tab-title">
              {tab.title}
              {tab.isModified ? ' *' : ''}
            </span>
            {tabs.length > 1 && (
              <button type="button" className="doc-tab-close" onClick={(e) => onCloseTab(tab.id, e)} title="문서 닫기">
                <X size={10} />
              </button>
            )}
          </div>
        );
      })}

      <button type="button" className="doc-tab-add" onClick={() => onNewTab('hwp')} title="새 한글 문서 추가">
        <Plus size={14} color="#475569" />
      </button>
    </div>
  );
};
