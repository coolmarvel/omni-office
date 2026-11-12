import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TitleBar } from './components/TitleBar';
import { MenuBar } from './components/MenuBar';
import { FileMenuDropdown } from './components/FileMenuDropdown';
import { DocTabs } from './components/DocTabs';
import { HwpRibbon } from './components/HwpRibbon';
import { ExcelRibbon, CellStyle } from './components/ExcelRibbon';
import { HwpCanvas } from './components/HwpCanvas';
import { SheetCanvas } from './components/SheetCanvas';
import { StatusBar } from './components/StatusBar';
import { FindReplaceModal } from './components/modals/FindReplaceModal';
import { TableInsertModal } from './components/modals/TableInsertModal';
import { PageSetupModal } from './components/modals/PageSetupModal';
import { SymbolModal } from './components/modals/SymbolModal';
import { DocumentTab, DocType, MenuTabId } from './types';
import { computeRangeStats } from './utils/formulaEngine';
import { getCellsInRange } from './utils/spreadsheetRange';

// 초기 공공기관 샘플 HWP 문서
const INITIAL_HWP_HTML = `
<div class="hwp-header-block">
  <span>문서번호: 행정-2026-1112호</span>
  <span>시행일자: 2026. 11. 12.</span>
  <span>수신: 전 부서장 및 산하기관장</span>
</div>

<h1 class="hwp-doc-title">2026년도 공공 데이터 및 업무 프로세스 디지털 전환 계획(안)</h1>

<table class="hwp-meta-table">
  <thead>
    <tr>
      <th style="width: 20%;">과제 구분</th>
      <th style="width: 32%;">핵심 추진 내용</th>
      <th style="width: 24%;">담당 부서</th>
      <th style="width: 24%;">목표 기한</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>전자문서 고도화</td>
      <td>HWP/HWPX 및 오피스 통합 편집기(Omni Office) 도입</td>
      <td>디지털혁신팀</td>
      <td>2026. 12. 31.</td>
    </tr>
    <tr>
      <td>데이터 연계</td>
      <td>로컬 바이트 보존형 스프레드시트 엔진 연동</td>
      <td>정보보안팀</td>
      <td>2026. 11. 30.</td>
    </tr>
    <tr>
      <td>인프라 최적화</td>
      <td>Rust + WASM 기반 초경량 실행 엔진 탑재</td>
      <td>시스템운영팀</td>
      <td>2026. 10. 31.</td>
    </tr>
  </tbody>
</table>

<div class="hwp-section-heading">1. 추진 배경 및 필요성</div>
<p class="hwp-content-text">
  가. 기존 상용 오피스 및 한글 뷰어의 높은 메모리 점유율과 기동 지연으로 인한 업무 생산성 저하를 해결하고자 함.<br/>
  나. 외부 클라우드 전송 없이 100% 로컬 오프라인 환경에서 안전하게 한글(HWP) 및 엑셀(XLSX) 문서를 동시 편집할 수 있는 체계 구축 필요.<br/>
  다. Rust 기반의 고속 WASM 파서를 통해 대용량 공문서의 지연 없는 실시간 렌더링을 보장함.
</p>

<div class="hwp-section-heading">2. 주요 세부 추진 과제</div>
<p class="hwp-content-text">
  - <strong>초경량 데스크톱 독립 서비스 구축</strong>: 웹 브라우저 종속성을 탈피하고 단일 독립 실행 프로세스로 구동.<br/>
  - <strong>표 및 문단 무결성 보존</strong>: 복잡한 한글 표 서식, 글자 모양 및 자간 줄간격을 깨짐 없이 네이티브급으로 가공.<br/>
  - <strong>원클릭 로컬 입출력</strong>: Windows 탐색기와 완벽 연동되는 네이티브 다이얼로그 및 자동 세션 복구 지원.
</p>

<div class="hwp-section-heading">3. 기대 효과</div>
<p class="hwp-content-text">
  - 업무 문서 로딩 속도 1초 이내 단축 및 메모리 사용량 100MB 이하 유지 달성.<br/>
  - 모든 행정 실무자가 별도의 유료 라이선스 제약 없이 최적화된 오피스 환경에서 신속하게 결재 및 서식을 작성함.
</p>
`;

// 초기 예산 명세서 샘플 스프레드시트 데이터
const INITIAL_SHEET_DATA: Record<string, string> = {
  A1: '사업코드',
  B1: '과제명',
  C1: '예산액(원)',
  D1: '집행액(원)',
  E1: '집행률(%)',
  F1: '비고',
  A2: 'IT-01',
  B2: '초고속 HWP 엔진 구축',
  C2: '45,000,000',
  D2: '38,000,000',
  E2: '84.4',
  F2: '정상추진',
  A3: 'IT-02',
  B3: '엑셀 수식 계산 엔진 연동',
  C3: '35,000,000',
  D3: '31,500,000',
  E3: '90.0',
  F3: '우수',
  A4: 'IT-03',
  B4: '로컬 SQLite 캐시 최적화',
  C4: '20,000,000',
  D4: '19,000,000',
  E4: '95.0',
  F4: '완료임박',
  A5: 'IT-04',
  B5: '데스크톱 인스톨러 패키징',
  C5: '15,000,000',
  D5: '12,000,000',
  E5: '80.0',
  F5: '진행중',
  A6: '합계',
  B6: '총 소요 예산',
  C6: '=SUM(C2:C5)',
  D6: '=SUM(D2:D5)',
  E6: '87.4',
  F6: '목표달성',
};

// 초기 스프레드시트 셀 스타일
const INITIAL_CELL_STYLES: Record<string, CellStyle> = {
  A1: { bold: true, align: 'center', bgColor: '#f8f9fa' },
  B1: { bold: true, align: 'center', bgColor: '#f8f9fa' },
  C1: { bold: true, align: 'center', bgColor: '#f8f9fa' },
  D1: { bold: true, align: 'center', bgColor: '#f8f9fa' },
  E1: { bold: true, align: 'center', bgColor: '#f8f9fa' },
  F1: { bold: true, align: 'center', bgColor: '#f8f9fa' },
  A6: { bold: true, align: 'center', bgColor: '#f2f9f4' },
  B6: { bold: true, align: 'left', bgColor: '#f2f9f4' },
  C6: { bold: true, align: 'right', bgColor: '#f2f9f4' },
  D6: { bold: true, align: 'right', bgColor: '#f2f9f4' },
  E6: { bold: true, align: 'right', bgColor: '#f2f9f4' },
  F6: { bold: true, align: 'center', bgColor: '#f2f9f4' },
};

interface SheetSnapshot {
  data: Record<string, string>;
  styles: Record<string, CellStyle>;
}

export const App: React.FC = () => {
  // 문서 탭 관리
  const [tabs, setTabs] = useState<DocumentTab[]>([
    {
      id: 'tab-1',
      title: '2026년 공공기관 디지털 전환 추진 계획서.hwp',
      docType: 'hwp',
      filePath: 'C:\\Users\\user\\Documents\\2026년 공공기관 디지털 전환 추진 계획서.hwp',
      isModified: false,
    },
    {
      id: 'tab-2',
      title: '2026년도 사업별 예산 및 집행 명세서.xlsx',
      docType: 'xlsx',
      filePath: 'C:\\Users\\user\\Documents\\2026년도 사업별 예산 및 집행 명세서.xlsx',
      isModified: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // 메뉴 & 리본 제어
  const [activeMenu, setActiveMenu] = useState<MenuTabId>('format');
  const [isFileMenuOpen, setIsFileMenuOpen] = useState<boolean>(false);
  const [isRibbonCollapsed, setIsRibbonCollapsed] = useState<boolean>(false);

  // 모달 제어 상태
  const [isFindModalOpen, setIsFindModalOpen] = useState(false);
  const [isPageSetupModalOpen, setIsPageSetupModalOpen] = useState(false);
  const [isSymbolModalOpen, setIsSymbolModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // HWP 상태
  const [hwpHtml, setHwpHtml] = useState<string>(INITIAL_HWP_HTML);
  const [fontFamily, setFontFamily] = useState<string>("'Batang', '바탕', '함초롬바탕', serif");
  const [fontSize, setFontSize] = useState<number>(10.0);
  const [lineHeight, setLineHeight] = useState<number>(160);
  const [showControlMarks, setShowControlMarks] = useState<boolean>(false);
  const [showParagraphMarks, setShowParagraphMarks] = useState<boolean>(true);
  const [showGridLines, setShowGridLines] = useState<boolean>(false);
  const [textColor, setTextColor] = useState<string>('#111111');
  const [highlightColor, setHighlightColor] = useState<string>('#fef08a');
  const [pageMargins, setPageMargins] = useState<{
    top: number;
    bottom: number;
    left: number;
    right: number;
  }>({
    top: 20,
    bottom: 15,
    left: 30,
    right: 30,
  });

  // 엑셀 상태 및 히스토리 스택 (Undo / Redo)
  const [sheetData, setSheetData] = useState<Record<string, string>>(INITIAL_SHEET_DATA);
  const [cellStyles, setCellStyles] = useState<Record<string, CellStyle>>(INITIAL_CELL_STYLES);
  const [sheetHistory, setSheetHistory] = useState<SheetSnapshot[]>([{ data: INITIAL_SHEET_DATA, styles: INITIAL_CELL_STYLES }]);
  const [sheetHistoryIdx, setSheetHistoryIdx] = useState<number>(0);

  const [selectedCell, setSelectedCell] = useState<string>('C2');
  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string } | null>(null);
  const [formulaValue, setFormulaValue] = useState<string>('45,000,000');
  const [activeSubSheet, setActiveSubSheet] = useState<string>('예산총괄');

  // 뷰포트 배율
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // HWP Undo / Redo (브라우저 contentEditable 네이티브 실행 엔진 활용)
  const handleHwpUndo = useCallback(() => {
    const editor = document.querySelector('.hwp-editor-content') as HTMLElement;
    if (editor) {
      editor.focus();
      document.execCommand('undo');
      setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, isModified: true } : t)));
    }
  }, [activeTabId]);

  const handleHwpRedo = useCallback(() => {
    const editor = document.querySelector('.hwp-editor-content') as HTMLElement;
    if (editor) {
      editor.focus();
      document.execCommand('redo');
      setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, isModified: true } : t)));
    }
  }, [activeTabId]);

  // 서식 명령 실행
  const handleExecCommand = useCallback(
    (command: string, value: string = '') => {
      const editor = document.querySelector('.hwp-editor-content') as HTMLElement;
      editor?.focus();
      document.execCommand(command, false, value);
      setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, isModified: true } : t)));
    },
    [activeTabId],
  );

  // 엑셀 셀 내용 변경 및 히스토리 기록
  const handleCellChange = useCallback(
    (coord: string, val: string) => {
      setSheetData((prev) => {
        const next = { ...prev, [coord]: val };
        setSheetHistory((hPrev) => {
          const sliced = hPrev.slice(0, sheetHistoryIdx + 1);
          return [...sliced, { data: next, styles: cellStyles }];
        });
        setSheetHistoryIdx((iPrev) => iPrev + 1);
        return next;
      });
      setFormulaValue(val);
      setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, isModified: true } : t)));
    },
    [activeTabId, cellStyles, sheetHistoryIdx],
  );

  // 엑셀 서식 스타일 변경 (선택 영역 전체에 동시 적용)
  const handleUpdateCellStyle = useCallback(
    (styleUpdate: Partial<CellStyle>) => {
      const targetCells = selectedRange && selectedRange.start !== selectedRange.end ? getCellsInRange(`${selectedRange.start}:${selectedRange.end}`) : [selectedCell];

      setCellStyles((prev) => {
        const next = { ...prev };
        for (const c of targetCells) {
          next[c] = { ...(next[c] || {}), ...styleUpdate };
        }
        setSheetHistory((hPrev) => {
          const sliced = hPrev.slice(0, sheetHistoryIdx + 1);
          return [...sliced, { data: sheetData, styles: next }];
        });
        setSheetHistoryIdx((iPrev) => iPrev + 1);
        return next;
      });
      setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, isModified: true } : t)));
    },
    [selectedRange, selectedCell, sheetData, sheetHistoryIdx, activeTabId],
  );

  // 엑셀 셀 다중 삭제
  const handleDeleteCells = useCallback(
    (coords: string[]) => {
      setSheetData((prev) => {
        const next = { ...prev };
        coords.forEach((c) => {
          delete next[c];
        });
        setSheetHistory((hPrev) => {
          const sliced = hPrev.slice(0, sheetHistoryIdx + 1);
          return [...sliced, { data: next, styles: cellStyles }];
        });
        setSheetHistoryIdx((iPrev) => iPrev + 1);
        return next;
      });
      setFormulaValue('');
      setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, isModified: true } : t)));
    },
    [activeTabId, cellStyles, sheetHistoryIdx],
  );

  // 엑셀 Undo / Redo
  const handleSheetUndo = useCallback(() => {
    if (sheetHistoryIdx > 0) {
      const nextIdx = sheetHistoryIdx - 1;
      setSheetHistoryIdx(nextIdx);
      const prevSnapshot = sheetHistory[nextIdx];
      setSheetData(prevSnapshot.data);
      setCellStyles(prevSnapshot.styles);
      setFormulaValue(prevSnapshot.data[selectedCell] || '');
    }
  }, [selectedCell, sheetHistory, sheetHistoryIdx]);

  const handleSheetRedo = useCallback(() => {
    if (sheetHistoryIdx < sheetHistory.length - 1) {
      const nextIdx = sheetHistoryIdx + 1;
      setSheetHistoryIdx(nextIdx);
      const nextSnapshot = sheetHistory[nextIdx];
      setSheetData(nextSnapshot.data);
      setCellStyles(nextSnapshot.styles);
      setFormulaValue(nextSnapshot.data[selectedCell] || '');
    }
  }, [selectedCell, sheetHistory, sheetHistoryIdx]);

  // 통합 Undo / Redo
  const handleUndo = useCallback(() => {
    if (activeTab.docType === 'xlsx') {
      handleSheetUndo();
    } else {
      handleHwpUndo();
    }
  }, [activeTab.docType, handleHwpUndo, handleSheetUndo]);

  const handleRedo = useCallback(() => {
    if (activeTab.docType === 'xlsx') {
      handleSheetRedo();
    } else {
      handleHwpRedo();
    }
  }, [activeTab.docType, handleHwpRedo, handleSheetRedo]);

  // 새 문서 생성
  const handleNewDoc = (docType: DocType) => {
    const ext = docType;
    const num = tabs.length + 1;
    const newId = `tab-${Date.now()}`;
    const newTab: DocumentTab = {
      id: newId,
      title: docType === 'xlsx' ? `통합문서_${num}.${ext}` : `새문서_${num}.${ext}`,
      docType,
      isModified: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  // 탭 닫기
  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[0].id);
    }
  };

  // 네이티브 파일 열기
  const handleOpenFile = async () => {
    try {
      if (window.electronAPI?.openFileDialog) {
        const file = await window.electronAPI.openFileDialog();
        if (file) {
          const newTabId = `tab-${Date.now()}`;
          const isSheet = file.docType === 'xlsx' || file.docType === 'csv';
          setTabs((prev) => [
            ...prev,
            {
              id: newTabId,
              title: file.fileName,
              docType: isSheet ? 'xlsx' : 'hwp',
              filePath: file.filePath,
              isModified: false,
            },
          ]);
          setActiveTabId(newTabId);
        }
      } else {
        alert('로컬 파일 열기 다이얼로그 (데스크톱 모드)');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 파일 저장 (기존 경로 덮어쓰기)
  const handleSaveFile = useCallback(async () => {
    try {
      if (window.electronAPI?.saveFileDirect && activeTab.filePath) {
        const payload = activeTab.docType === 'xlsx' ? JSON.stringify(sheetData) : hwpHtml;
        const b64 = btoa(unescape(encodeURIComponent(payload)));
        await window.electronAPI.saveFileDirect({
          filePath: activeTab.filePath,
          data: b64,
        });
        setTabs((prev) => prev.map((t) => (t.id === activeTab.id ? { ...t, isModified: false } : t)));
        alert(`[${activeTab.title}] 로컬 파일 저장 완료!`);
      } else {
        handleSaveAsFile();
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeTab, hwpHtml, sheetData]);

  // 다른 이름으로 저장 다이얼로그
  const handleSaveAsFile = useCallback(async () => {
    try {
      if (window.electronAPI?.saveFileDialog) {
        const payload = activeTab.docType === 'xlsx' ? JSON.stringify(sheetData) : hwpHtml;
        const b64 = btoa(unescape(encodeURIComponent(payload)));
        const res = await window.electronAPI.saveFileDialog({
          defaultName: activeTab.title,
          docType: activeTab.docType,
          data: b64,
        });
        if (res) {
          setTabs((prev) => prev.map((t) => (t.id === activeTab.id ? { ...t, title: res.fileName, filePath: res.filePath, isModified: false } : t)));
          alert(`[${res.fileName}] 저장 완료!`);
        }
      } else {
        setTabs((prev) => prev.map((t) => (t.id === activeTab.id ? { ...t, isModified: false } : t)));
        alert(`[${activeTab.title}] 저장 완료 (로컬 세션)`);
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeTab, hwpHtml, sheetData]);

  // PDF 내보내기 (golbin/hop 스타일)
  const handleExportPdf = useCallback(async () => {
    try {
      if (window.electronAPI?.exportPdf) {
        const savedPath = await window.electronAPI.exportPdf();
        if (savedPath) {
          alert(`[PDF 내보내기 완료]\n${savedPath}`);
        }
      } else {
        window.print();
      }
    } catch (e) {
      console.error('PDF 내보내기 실패:', e);
      alert('PDF 내보내기 중 오류가 발생했습니다.');
    }
  }, []);

  // 인쇄
  const handlePrint = useCallback(() => {
    if (window.electronAPI?.print) {
      window.electronAPI.print();
    } else {
      window.print();
    }
  }, []);

  // 엑셀 셀 선택
  const handleCellClick = (coord: string) => {
    setSelectedCell(coord);
    setFormulaValue(sheetData[coord] || '');
  };

  // 수식 적용
  const handleApplyFormula = (formula: string) => {
    setFormulaValue(formula);
    handleCellChange(selectedCell, formula);
  };

  // 표 만들기 모달에서 생성 요청
  const handleInsertTable = (rows: number, cols: number) => {
    let rowsHtml = '';
    for (let r = 0; r < rows; r++) {
      rowsHtml += '<tr>';
      for (let c = 0; c < cols; c++) {
        if (r === 0) {
          rowsHtml += `<th>열 ${c + 1}</th>`;
        } else {
          rowsHtml += '<td>&nbsp;</td>';
        }
      }
      rowsHtml += '</tr>';
    }
    const tableHtml = `
      <table class="hwp-meta-table">
        <tbody>
          ${rowsHtml}
        </tbody>
      </table><p><br/></p>
    `;
    handleExecCommand('insertHTML', tableHtml);
  };

  // 문자표 선택
  const handleSelectSymbol = (sym: string) => {
    if (activeTab.docType === 'xlsx') {
      handleCellChange(selectedCell, (sheetData[selectedCell] || '') + sym);
    } else {
      handleExecCommand('insertText', sym);
    }
  };

  // 찾기 및 바꾸기
  const handleFind = (term: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).find) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).find(term);
    }
  };

  const handleReplaceAll = (findTerm: string, replaceTerm: string) => {
    if (!findTerm) return;
    if (activeTab.docType === 'hwp') {
      const replaced = hwpHtml.replaceAll(findTerm, replaceTerm);
      setHwpHtml(replaced);
      setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, isModified: true } : t)));
      alert(`[${findTerm}] 단어를 모두 [${replaceTerm}]으로 바꾸었습니다.`);
    } else {
      setSheetData((prev) => {
        const next: Record<string, string> = {};
        for (const [k, v] of Object.entries(prev)) {
          next[k] = v.replaceAll(findTerm, replaceTerm);
        }
        return next;
      });
      alert(`스프레드시트에서 [${findTerm}] 단어를 모두 바꾸었습니다.`);
    }
  };

  // 전역 단축키 바인딩 (Ctrl+Z, Ctrl+Y, Ctrl+S, Ctrl+O, Ctrl+P, Ctrl+E, Ctrl+F, F7, Ctrl+F10)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      if (isCtrlOrMeta && !e.shiftKey && e.key.toLowerCase() === 'z') {
        if (activeTab.docType === 'hwp') {
          const inEditor = document.activeElement && document.activeElement.closest('.hwp-editor-content');
          if (!inEditor) {
            e.preventDefault();
            handleHwpUndo();
          }
        } else {
          e.preventDefault();
          handleSheetUndo();
        }
      } else if ((isCtrlOrMeta && e.shiftKey && e.key.toLowerCase() === 'z') || (isCtrlOrMeta && e.key.toLowerCase() === 'y')) {
        if (activeTab.docType === 'hwp') {
          const inEditor = document.activeElement && document.activeElement.closest('.hwp-editor-content');
          if (!inEditor) {
            e.preventDefault();
            handleHwpRedo();
          }
        } else {
          e.preventDefault();
          handleSheetRedo();
        }
      } else if (isCtrlOrMeta && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveFile();
      } else if (isCtrlOrMeta && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveAsFile();
      } else if (isCtrlOrMeta && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFile();
      } else if (isCtrlOrMeta && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      } else if (isCtrlOrMeta && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExportPdf();
      } else if (isCtrlOrMeta && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFindModalOpen(true);
      } else if (e.key === 'F7') {
        e.preventDefault();
        setIsPageSetupModalOpen(true);
      } else if (isCtrlOrMeta && e.key === 'F10') {
        e.preventDefault();
        setIsSymbolModalOpen(true);
      } else if (isCtrlOrMeta && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewDoc('hwp');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleHwpUndo, handleHwpRedo, handleSheetUndo, handleSheetRedo, handleSaveFile, handleSaveAsFile, handleOpenFile, handlePrint, handleExportPdf, activeTab.docType]);

  // HWP 텍스트 통계 계산 (실시간)
  const hwpStats = useMemo(() => {
    if (activeTab.docType !== 'hwp') return undefined;
    const temp = document.createElement('div');
    temp.innerHTML = hwpHtml;
    const text = temp.textContent || '';
    const charCount = text.length;
    const charCountNoSpaces = text.replace(/\s+/g, '').length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { charCount, charCountNoSpaces, wordCount };
  }, [hwpHtml, activeTab.docType]);

  // 엑셀 범위 통계 계산 (실시간)
  const sheetStats = useMemo(() => {
    if (activeTab.docType !== 'xlsx') return null;
    const rangeStr = selectedRange && selectedRange.start !== selectedRange.end ? `${selectedRange.start}:${selectedRange.end}` : selectedCell;
    return computeRangeStats(rangeStr, sheetData);
  }, [sheetData, selectedCell, selectedRange, activeTab.docType]);

  const currentCellStyle = cellStyles[selectedCell];

  return (
    <div className="omni-shell">
      {/* 1. 단일 커스텀 타이틀바 (OS 타이틀바 완전 제거, 프레임 일체형) */}
      <TitleBar activeTab={activeTab} />

      {/* 2. 상단 메뉴 바 (파일, 편집, 보기, 입력, 서식, 쪽, 표, 도구) */}
      <MenuBar
        activeMenu={activeMenu}
        onSelectMenu={(menu) => setActiveMenu(menu)}
        isFileMenuOpen={isFileMenuOpen}
        onToggleFileMenu={() => setIsFileMenuOpen((prev) => !prev)}
        isRibbonCollapsed={isRibbonCollapsed}
        onToggleRibbon={() => setIsRibbonCollapsed((prev) => !prev)}
      />

      {/* 3. 파일 드롭다운 오버레이 */}
      <FileMenuDropdown
        isOpen={isFileMenuOpen}
        onClose={() => setIsFileMenuOpen(false)}
        onNewDoc={handleNewDoc}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onSaveAsFile={handleSaveAsFile}
        onPrint={handlePrint}
        onExportPdf={handleExportPdf}
      />

      {/* 4. 리본 툴바 (문서 타입에 따라 rhwp vs genoffice 융합 전환) */}
      {activeTab.docType === 'xlsx' ? (
        <ExcelRibbon
          selectedCell={selectedCell}
          selectedRange={selectedRange}
          formulaValue={formulaValue}
          onChangeFormula={(val) => {
            setFormulaValue(val);
            handleCellChange(selectedCell, val);
          }}
          onApplyFormula={handleApplyFormula}
          currentCellStyle={currentCellStyle}
          onUpdateCellStyle={handleUpdateCellStyle}
          onUndo={handleSheetUndo}
          onRedo={handleSheetRedo}
          canUndo={sheetHistoryIdx > 0}
          canRedo={sheetHistoryIdx < sheetHistory.length - 1}
          isRibbonCollapsed={isRibbonCollapsed}
        />
      ) : (
        <HwpRibbon
          onExecCommand={handleExecCommand}
          onUndo={handleHwpUndo}
          onRedo={handleHwpRedo}
          canUndo={true}
          canRedo={true}
          onOpenFindModal={() => setIsFindModalOpen(true)}
          onOpenPageSetupModal={() => setIsPageSetupModalOpen(true)}
          onOpenSymbolModal={() => setIsSymbolModalOpen(true)}
          onOpenTableModal={() => setIsTableModalOpen(true)}
          fontFamily={fontFamily}
          onChangeFontFamily={setFontFamily}
          fontSize={fontSize}
          onChangeFontSize={setFontSize}
          lineHeight={lineHeight}
          onChangeLineHeight={setLineHeight}
          showControlMarks={showControlMarks}
          onToggleControlMarks={() => setShowControlMarks((v) => !v)}
          showParagraphMarks={showParagraphMarks}
          onToggleParagraphMarks={() => setShowParagraphMarks((v) => !v)}
          showGridLines={showGridLines}
          onToggleGridLines={() => setShowGridLines((v) => !v)}
          textColor={textColor}
          onChangeTextColor={setTextColor}
          highlightColor={highlightColor}
          onChangeHighlightColor={setHighlightColor}
          isRibbonCollapsed={isRibbonCollapsed}
        />
      )}

      {/* 5. 다중 문서 탭 바 */}
      <DocTabs tabs={tabs} activeTabId={activeTabId} onSelectTab={setActiveTabId} onCloseTab={handleCloseTab} onNewTab={handleNewDoc} />

      {/* 6. 주 작업 영역 (A4 한글 vs 스프레드시트 그리드) */}
      <div className="omni-workspace">
        {activeTab.docType === 'xlsx' ? (
          <SheetCanvas
            sheetData={sheetData}
            cellStyles={cellStyles}
            selectedCell={selectedCell}
            selectedRange={selectedRange}
            onSelectCell={handleCellClick}
            onSelectRange={(start, end) => setSelectedRange({ start, end })}
            onCellChange={handleCellChange}
            onDeleteCells={handleDeleteCells}
            activeSheet={activeSubSheet}
            onSelectSheet={setActiveSubSheet}
          />
        ) : (
          <HwpCanvas
            htmlContent={hwpHtml}
            onContentChange={(newHtml) => {
              setHwpHtml(newHtml);
              setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, isModified: true } : t)));
            }}
            fontFamily={fontFamily}
            fontSize={fontSize}
            lineHeight={lineHeight}
            zoomLevel={zoomLevel}
            showControlMarks={showControlMarks}
            showParagraphMarks={showParagraphMarks}
            showGridLines={showGridLines}
            pageMargins={pageMargins}
          />
        )}
      </div>

      {/* 7. 하단 상태 표시줄 (실시간 통계 및 배율) */}
      <StatusBar activeTab={activeTab} zoomLevel={zoomLevel} onChangeZoom={setZoomLevel} hwpStats={hwpStats} sheetStats={sheetStats} />

      {/* 8. 대화형 모달 다이얼로그 (찾기/바꾸기, 쪽 여백, 문자표, 표 만들기) */}
      <FindReplaceModal isOpen={isFindModalOpen} onClose={() => setIsFindModalOpen(false)} onFind={handleFind} onReplaceAll={handleReplaceAll} />

      <PageSetupModal isOpen={isPageSetupModalOpen} onClose={() => setIsPageSetupModalOpen(false)} onApplyMargin={(margins) => setPageMargins(margins)} />

      <SymbolModal isOpen={isSymbolModalOpen} onClose={() => setIsSymbolModalOpen(false)} onSelectSymbol={handleSelectSymbol} />

      <TableInsertModal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} onInsertTable={handleInsertTable} />
    </div>
  );
};

export default App;
