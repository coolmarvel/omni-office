---
id: fluent-office
name: Fluent Office
category: desktop-office
reference: Microsoft Fluent Design System / MS Office 365 Desktop
primary_color: '#0f6cbd'
created: '2026-11-12'
updated: '2026-11-12'
author: 이성현 (SeongHyun Lee)
platforms: [css, ts, react, tauri]
typography:
  font-family: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Noto Sans KR', sans-serif"
  font-family-doc: "'Batang', 'Malgun Gothic', 'Noto Serif KR', serif"
  size:
    xs: 11px
    sm: 12px
    base: 13px
    md: 14px
    lg: 16px
    xl: 20px
    xxl: 24px
colors:
  primary: '#0f6cbd'
  primary-hover: '#0d599f'
  primary-pressed: '#0c4a84'
  excel-green: '#107c41'
  word-blue: '#0f6cbd'
  canvas-bg: '#f3f3f3'
  surface-white: '#ffffff'
  border-subtle: '#e1e1e1'
  border-default: '#d1d1d1'
  text-primary: '#242424'
  text-secondary: '#605e5c'
components:
  ribbon-tab:
    height: 36px
    active-border: '2px solid #0f6cbd'
    text-color: '#444'
    active-text: '#0f6cbd'
  tool-button:
    height: 42px
    min-width: 44px
    border-radius: 4px
    hover-bg: '#edebe9'
  doc-tab:
    height: 32px
    active-bg: '#ffffff'
    inactive-bg: '#e1dfdd'
    active-border: '#d1d1d1'
  status-bar:
    height: 24px
    bg: '#0f6cbd'
    text-color: '#ffffff'
---

# DESIGN.md - omni-office 디자인 계약

## 기본 원칙

1. **일관된 Fluent 데스크톱 조작감**: MS Office 365의 리본 툴바, 탭 바, 단축키 동작과 동일한 사용자 경험 제공.
2. **반응형 캔버스**: HWP 문서는 A4 96dpi 인쇄 비율(794px) 렌더링을 준수하며, XLSX 스프레드시트는 가상 스크롤 그리드 적용.
3. **고대비 및 가독성**: 본문 및 셀 텍스트는 선명한 고대비 색상을 유지하고 가독성을 최우선으로 고려.
