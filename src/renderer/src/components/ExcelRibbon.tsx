import React from 'react';
import { Undo2, Redo2, Scissors, Copy, Clipboard, Paintbrush, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Sigma, Filter, Search, Grid, DollarSign, Percent } from 'lucide-react';

interface ExcelRibbonProps {
  selectedCell: string;
  formulaValue: string;
  onChangeFormula: (val: string) => void;
  onApplyFormula: (formula: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isRibbonCollapsed: boolean;
}

export const ExcelRibbon: React.FC<ExcelRibbonProps> = ({ selectedCell, formulaValue, onChangeFormula, onApplyFormula, onUndo, onRedo, canUndo = true, canRedo = true, isRibbonCollapsed }) => {
  return (
    <div className="omni-ribbon-container">
      {!isRibbonCollapsed && (
        <div className="omni-upper-ribbon">
          {/* 실행 취소 및 클립보드 그룹 */}
          <div className="tool-cluster">
            {onUndo && (
              <button type="button" className="rhwp-tool-btn" onClick={onUndo} disabled={!canUndo} title="실행 취소 (Ctrl+Z)" style={{ opacity: !canUndo ? 0.45 : 1 }}>
                <Undo2 size={18} color="#107c41" />
                <span>실행취소</span>
              </button>
            )}
            {onRedo && (
              <button type="button" className="rhwp-tool-btn" onClick={onRedo} disabled={!canRedo} title="다시 실행 (Ctrl+Y)" style={{ opacity: !canRedo ? 0.45 : 1 }}>
                <Redo2 size={18} color="#107c41" />
                <span>다시실행</span>
              </button>
            )}
            <button type="button" className="rhwp-tool-btn" onClick={() => alert('붙여넣기')} title="붙여넣기 (Ctrl+V)">
              <Clipboard size={18} color="#107c41" />
              <span>붙여넣기</span>
            </button>
            <button type="button" className="rhwp-tool-btn" onClick={() => alert('잘라내기')} title="잘라내기 (Ctrl+X)">
              <Scissors size={18} color="#d97706" />
              <span>잘라내기</span>
            </button>
            <button type="button" className="rhwp-tool-btn" onClick={() => alert('복사')} title="복사 (Ctrl+C)">
              <Copy size={18} color="#0055b8" />
              <span>복사</span>
            </button>
            <button type="button" className="rhwp-tool-btn" onClick={() => alert('서식 복사')} title="서식 복사">
              <Paintbrush size={18} color="#6366f1" />
              <span>서식복사</span>
            </button>
          </div>

          {/* 글꼴 및 셀 테두리 */}
          <div className="tool-cluster">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <select className="format-select" style={{ width: '110px' }} defaultValue="'Malgun Gothic'">
                  <option value="'Malgun Gothic'">맑은 고딕</option>
                  <option value="'Segoe UI'">Segoe UI</option>
                  <option value="'Batang'">바탕</option>
                </select>
                <select className="format-select" style={{ width: '52px' }} defaultValue="11">
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                  <option value="14">14</option>
                  <option value="16">16</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                <button type="button" className="format-icon-btn" title="굵게">
                  <Bold size={13} />
                </button>
                <button type="button" className="format-icon-btn" title="기울임꼴">
                  <Italic size={13} />
                </button>
                <button type="button" className="format-icon-btn" title="밑줄">
                  <Underline size={13} />
                </button>
                <button type="button" className="format-icon-btn" onClick={() => alert('모든 셀 테두리 적용')} title="모든 테두리">
                  <Grid size={13} color="#107c41" />
                </button>
              </div>
            </div>
          </div>

          {/* 맞춤 그룹 */}
          <div className="tool-cluster">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button type="button" className="format-icon-btn" title="왼쪽 맞춤">
                  <AlignLeft size={13} />
                </button>
                <button type="button" className="format-icon-btn" title="가운데 맞춤">
                  <AlignCenter size={13} />
                </button>
                <button type="button" className="format-icon-btn" title="오른쪽 맞춤">
                  <AlignRight size={13} />
                </button>
              </div>
              <button
                type="button"
                className="format-select"
                style={{ fontSize: '11px', height: '22px', cursor: 'pointer', textAlign: 'center' }}
                onClick={() => alert('병합하고 가운데 맞춤 적용')}
                title="병합하고 가운데 맞춤"
              >
                병합하고 가운데 맞춤
              </button>
            </div>
          </div>

          {/* 표시 형식 그룹 */}
          <div className="tool-cluster">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <select className="format-select" style={{ width: '100px' }} defaultValue="general">
                <option value="general">일반</option>
                <option value="number">숫자</option>
                <option value="currency">통화 (₩)</option>
                <option value="percent">백분율 (%)</option>
              </select>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="format-icon-btn"
                  onClick={() => {
                    const num = parseFloat(formulaValue.replace(/,/g, ''));
                    if (!isNaN(num)) onChangeFormula(`₩${num.toLocaleString('ko-KR')}`);
                  }}
                  title="통화 형식 (₩)"
                >
                  <DollarSign size={13} color="#107c41" />
                </button>
                <button
                  type="button"
                  className="format-icon-btn"
                  onClick={() => {
                    const num = parseFloat(formulaValue);
                    if (!isNaN(num)) onChangeFormula(`${(num * 100).toFixed(1)}%`);
                  }}
                  title="백분율 (%)"
                >
                  <Percent size={13} />
                </button>
                <button
                  type="button"
                  className="format-icon-btn"
                  onClick={() => {
                    const num = parseFloat(formulaValue.replace(/,/g, ''));
                    if (!isNaN(num)) onChangeFormula(num.toLocaleString('ko-KR'));
                  }}
                  title="쉼표 스타일 (,)"
                >
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>,</span>
                </button>
              </div>
            </div>
          </div>

          {/* 편집 & 자동합계 */}
          <div className="tool-cluster">
            <button type="button" className="rhwp-tool-btn" onClick={() => onApplyFormula('=SUM(C2:C5)')} title="자동합계 (=SUM)">
              <Sigma size={18} color="#107c41" />
              <span>자동합계</span>
            </button>
            <button type="button" className="rhwp-tool-btn" onClick={() => alert('정렬 및 필터 적용')} title="정렬 및 필터">
              <Filter size={18} color="#0055b8" />
              <span>정렬/필터</span>
            </button>
            <button
              type="button"
              className="rhwp-tool-btn"
              onClick={() => {
                const kw = prompt('검색할 셀 값을 입력하세요:');
                if (kw) window.find(kw);
              }}
              title="찾기 및 선택"
            >
              <Search size={18} color="#d97706" />
              <span>찾기</span>
            </button>
          </div>
        </div>
      )}

      {/* 수식 입력줄 (Formula Bar) */}
      <div className="sheet-formula-bar">
        <div className="sheet-cell-address" title="선택된 셀 좌표">
          {selectedCell}
        </div>
        <button
          type="button"
          className="format-icon-btn"
          style={{ width: '26px', height: '22px', fontStyle: 'italic', fontWeight: 'bold', color: '#107c41' }}
          onClick={() => {
            const func = prompt('삽입할 수식 함수를 입력하세요 (SUM, AVERAGE, MAX, MIN):', 'SUM(C2:C5)');
            if (func) onApplyFormula(`=${func}`);
          }}
          title="수식 함수(fx) 마법사"
        >
          fx
        </button>
        <input type="text" className="sheet-formula-input" value={formulaValue} onChange={(e) => onChangeFormula(e.target.value)} placeholder="수식(=SUM(C2:C5)) 또는 셀 값을 입력하세요" />
      </div>
    </div>
  );
};
