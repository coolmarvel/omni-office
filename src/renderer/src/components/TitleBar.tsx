import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { DocumentTab } from '../types';
import { APP_VERSION } from '../version';
import appIcon from '../assets/icon.png';

interface TitleBarProps {
  activeTab: DocumentTab;
}

export const TitleBar: React.FC<TitleBarProps> = ({ activeTab }) => {
  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow?.();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow?.();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow?.();
  };

  return (
    <div className="omni-titlebar">
      <div className="omni-titlebar-left">
        <img src={appIcon} alt="Omni Office" className="omni-titlebar-icon" />
        <span className="omni-titlebar-name">Omni Office v{APP_VERSION}</span>
        <span className="omni-titlebar-separator">-</span>
        <span className="omni-titlebar-doc">
          {activeTab.title} {activeTab.isModified ? '(수정됨*)' : ''}
        </span>
      </div>
      <div className="omni-titlebar-right">
        <button type="button" className="window-btn" onClick={handleMinimize} title="최소화">
          <Minus size={12} />
        </button>
        <button type="button" className="window-btn" onClick={handleMaximize} title="최대화 / 이전 크기 복원">
          <Square size={10} />
        </button>
        <button type="button" className="window-btn close" onClick={handleClose} title="닫기">
          <X size={12} />
        </button>
      </div>
    </div>
  );
};
