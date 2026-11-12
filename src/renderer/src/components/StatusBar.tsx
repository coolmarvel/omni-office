import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { DocumentTab } from '../types';
import { APP_VERSION } from '../version';
import { formatNumberWithCommas } from '../utils/formulaEngine';

interface StatusBarProps {
  activeTab: DocumentTab;
  zoomLevel: number;
  onChangeZoom: (level: number) => void;
  hwpStats?: {
    charCount: number;
    charCountNoSpaces: number;
    wordCount: number;
  };
  sheetStats?: {
    count: number;
    sum: number;
    average: number;
    hasNumbers: boolean;
  } | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeTab, zoomLevel, onChangeZoom, hwpStats, sheetStats }) => {
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

        {activeTab.docType === 'hwp' && hwpStats && (
          <>
            <span>|</span>
            <span>1 / 1 쪽</span>
            <span>|</span>
            <span>
              글자: {hwpStats.charCount.toLocaleString('ko-KR')}자 (공백 제외: {hwpStats.charCountNoSpaces.toLocaleString('ko-KR')}자)
            </span>
            <span>|</span>
            <span>낱말: {hwpStats.wordCount.toLocaleString('ko-KR')}개</span>
            <span>|</span>
            <span>용지: A4 (세로 210 x 297 mm)</span>
          </>
        )}

        {activeTab.docType === 'xlsx' && sheetStats && sheetStats.count > 1 && sheetStats.hasNumbers && (
          <>
            <span>|</span>
            <span style={{ color: '#bbf7d0', fontWeight: 'bold' }}>평균: {formatNumberWithCommas(sheetStats.average)}</span>
            <span>|</span>
            <span style={{ color: '#bbf7d0', fontWeight: 'bold' }}>개수: {sheetStats.count}</span>
            <span>|</span>
            <span style={{ color: '#bbf7d0', fontWeight: 'bold' }}>합계: {formatNumberWithCommas(sheetStats.sum)}</span>
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
