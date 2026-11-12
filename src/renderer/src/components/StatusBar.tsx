import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { DocumentTab } from '../types';
import { APP_VERSION } from '../version';

interface StatusBarProps {
  activeTab: DocumentTab;
  zoomLevel: number;
  onChangeZoom: (level: number) => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeTab, zoomLevel, onChangeZoom }) => {
  return (
    <div className="omni-statusbar">
      <div className="omni-statusbar-left">
        <span>준비 완료</span>
        <span>|</span>
        <span>
          포맷: <strong>{activeTab.docType.toUpperCase()}</strong>
        </span>
        <span>|</span>
        <span>상태: {activeTab.isModified ? '수정됨 (미저장*)' : '저장 완료'}</span>
        {activeTab.docType === 'hwp' && (
          <>
            <span>|</span>
            <span>1 / 1 쪽</span>
            <span>|</span>
            <span>구역: 1/1</span>
            <span>|</span>
            <span>삽입</span>
            <span>|</span>
            <span>용지: A4 (세로 210 x 297 mm)</span>
          </>
        )}
      </div>

      <div className="omni-statusbar-right">
        <span>인코딩: UTF-8</span>
        <span>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button type="button" className="status-zoom-btn" onClick={() => onChangeZoom(Math.max(50, zoomLevel - 10))} title="축소">
            <ZoomOut size={12} />
          </button>
          <span style={{ minWidth: '40px', textAlign: 'center' }}>{zoomLevel}%</span>
          <button type="button" className="status-zoom-btn" onClick={() => onChangeZoom(Math.min(200, zoomLevel + 10))} title="확대">
            <ZoomIn size={12} />
          </button>
        </div>
        <span>|</span>
        <span style={{ color: '#cce4f7' }}>v{APP_VERSION} (Standalone Desktop)</span>
      </div>
    </div>
  );
};
