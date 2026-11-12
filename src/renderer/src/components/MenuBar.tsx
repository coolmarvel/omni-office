import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { MenuTabId } from '../types';

interface MenuBarProps {
  activeMenu: MenuTabId;
  onSelectMenu: (menu: MenuTabId) => void;
  isFileMenuOpen: boolean;
  onToggleFileMenu: () => void;
  isRibbonCollapsed: boolean;
  onToggleRibbon: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({ activeMenu, onSelectMenu, isFileMenuOpen, onToggleFileMenu, isRibbonCollapsed, onToggleRibbon }) => {
  const menuItems: { id: MenuTabId; label: string }[] = [
    { id: 'edit', label: '편집' },
    { id: 'view', label: '보기' },
    { id: 'insert', label: '입력' },
    { id: 'format', label: '서식' },
    { id: 'page', label: '쪽' },
    { id: 'table', label: '표' },
    { id: 'tools', label: '도구' },
  ];

  return (
    <div className="omni-menu-tabs">
      <button type="button" className={`menu-tab-btn file-btn ${isFileMenuOpen ? 'active' : ''}`} onClick={onToggleFileMenu}>
        파일
      </button>

      {menuItems.map((item) => (
        <button key={item.id} type="button" className={`menu-tab-btn ${activeMenu === item.id ? 'active' : ''}`} onClick={() => onSelectMenu(item.id)}>
          {item.label}
        </button>
      ))}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: '6px' }}>
        <button type="button" className="format-icon-btn" onClick={onToggleRibbon} title={isRibbonCollapsed ? '리본 메뉴 펼치기' : '리본 메뉴 접기'}>
          {isRibbonCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
    </div>
  );
};
