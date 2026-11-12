import React from 'react';
import {
  Scissors,
  Copy,
  Clipboard,
  Paintbrush,
  Grid,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Table,
  Square,
  Image,
  Sliders,
  Link,
  Search,
  History,
  GitCompare,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  FileText,
} from 'lucide-react';

interface HwpRibbonProps {
  onExecCommand: (command: string, value?: string) => void;
  fontFamily: string;
  onChangeFontFamily: (font: string) => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  lineHeight: number;
  onChangeLineHeight: (lh: number) => void;
  showControlMarks: boolean;
  onToggleControlMarks: () => void;
  showParagraphMarks: boolean;
  onToggleParagraphMarks: () => void;
  showGridLines: boolean;
  onToggleGridLines: () => void;
  textColor: string;
  onChangeTextColor: (color: string) => void;
  highlightColor: string;
  onChangeHighlightColor: (color: string) => void;
  isRibbonCollapsed: boolean;
}

export const HwpRibbon: React.FC<HwpRibbonProps> = ({
  onExecCommand,
  fontFamily,
  onChangeFontFamily,
  fontSize,
  onChangeFontSize,
  lineHeight,
  onChangeLineHeight,
  showControlMarks,
  onToggleControlMarks,
  showParagraphMarks,
  onToggleParagraphMarks,
  showGridLines,
  onToggleGridLines,
  textColor,
  onChangeTextColor,
  highlightColor,
  onChangeHighlightColor,
  isRibbonCollapsed,
}) => {
  if (isRibbonCollapsed) {
    return null;
  }

  return (
    <div className="omni-ribbon-container">
      {/* 1. 상단 툴바 (Upper Command Ribbon) */}
      <div className="omni-upper-ribbon">
        {/* 클립보드 그룹 */}
        <div className="tool-cluster">
          <button type="button" className="rhwp-tool-btn" onClick={() => onExecCommand('cut')} title="오려두기 (Ctrl+X)">
            <Scissors size={18} color="#d97706" />
            <span>오려두기</span>
          </button>
          <button type="button" className="rhwp-tool-btn" onClick={() => onExecCommand('copy')} title="복사하기 (Ctrl+C)">
            <Copy size={18} color="#0055b8" />
            <span>복사하기</span>
          </button>
          <button type="button" className="rhwp-tool-btn" onClick={() => onExecCommand('paste')} title="붙이기 (Ctrl+V)">
            <Clipboard size={18} color="#107c41" />
            <span>붙이기</span>
          </button>
          <button type="button" className="rhwp-tool-btn" onClick={() => alert('모양복사: 커서 위치의 글자/문단 모양을 복사하여 대상 영역에 적용합니다.')} title="모양복사 (Alt+C)">
            <Paintbrush size={18} color="#6366f1" />
            <span>모양복사</span>
          </button>
        </div>

        {/* 조판 및 보기 그룹 */}
        <div className="tool-cluster">
          <button type="button" className={`rhwp-tool-btn ${showControlMarks ? 'active' : ''}`} onClick={onToggleControlMarks} title="조판부호 켜기/끄기">
            <Type size={18} color="#475569" />
            <span>조판부호</span>
          </button>
          <button type="button" className={`rhwp-tool-btn ${showParagraphMarks ? 'active' : ''}`} onClick={onToggleParagraphMarks} title="문단부호(엔터 표시) 켜기/끄기">
            <FileText size={18} color="#475569" />
            <span>문단부호</span>
          </button>
          <button type="button" className={`rhwp-tool-btn ${showGridLines ? 'active' : ''}`} onClick={onToggleGridLines} title="원고지/조판 격자 보기">
            <Grid size={18} color="#475569" />
            <span>격자보기</span>
          </button>
        </div>

        {/* 문단 및 서식 그룹 */}
        <div className="tool-cluster">
          <button type="button" className="rhwp-tool-btn" onClick={() => alert('글자 모양 설정 다이얼로그 (Alt+L): 폰트, 장평, 자간, 위첨자/아래첨자')} title="글자모양 (Alt+L)">
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e3a8a' }}>가*</span>
            <span>글자모양</span>
          </button>
          <button type="button" className="rhwp-tool-btn" onClick={() => alert('문단 모양 설정 다이얼로그 (Alt+T): 줄간격, 여백, 들여쓰기')} title="문단모양 (Alt+T)">
            <Sliders size={18} color="#1e3a8a" />
            <span>문단모양</span>
          </button>
          <button type="button" className="rhwp-tool-btn" onClick={() => onExecCommand('insertOrderedList')} title="문단 번호 목록 삽입">
            <ListOrdered size={18} color="#334155" />
            <span>문단번호</span>
          </button>
          <button type="button" className="rhwp-tool-btn" onClick={() => onExecCommand('insertUnorderedList')} title="글머리표 목록 삽입">
            <List size={18} color="#334155" />
            <span>글머리표</span>
          </button>
          <button type="button" className="rhwp-tool-btn" onClick={() => onExecCommand('outdent')} title="내어쓰기 (수준 올리기)">
            <Outdent size={18} color="#334155" />
            <span>수준▲</span>
          </button>
          <button type="button" className="rhwp-tool-btn" onClick={() => onExecCommand('indent')} title="들여쓰기 (수준 낮추기)">
            <Indent size={18} color="#334155" />
            <span>수준▼</span>
          </button>
        </div>

        {/* 개체 삽입 그룹 */}
        <div className="tool-cluster">
          <button
            type="button"
            className="rhwp-tool-btn"
            onClick={() => {
              const tableHtml = `
                <table class="hwp-meta-table">
                  <thead>
                    <tr><th>구분</th><th>세부 내용</th><th>담당자</th><th>비고</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>항목 1</td><td>내용을 입력하세요</td><td>홍길동</td><td>-</td></tr>
                    <tr><td>항목 2</td><td>내용을 입력하세요</td><td>김철수</td><td>-</td></tr>
                  </tbody>
                </table><p><br/></p>
              `;
              onExecCommand('insertHTML', tableHtml);
            }}
            title="표(Table) 삽입 (Ctrl+N, T)"
          >
            <Table size={18} color="#0055b8" />
            <span>표 삽입</span>
          </button>
          <button
            type="button"
            className="rhwp-tool-btn"
            onClick={() => {
              const boxHtml = `
                <div style="border: 1px solid #1e3a8a; background-color: #f0f7ff; padding: 12px; margin: 10px 0; border-radius: 4px;">
                  <strong>[참고 박스]</strong> 내용을 입력하십시오.
                </div><p><br/></p>
              `;
              onExecCommand('insertHTML', boxHtml);
            }}
            title="도형/글상자 삽입"
          >
            <Square size={18} color="#0284c7" />
            <span>도형</span>
          </button>
          <button
            type="button"
            className="rhwp-tool-btn"
            onClick={() => {
              const url = prompt('삽입할 이미지 URL을 입력하세요:', 'https://via.placeholder.com/400x200.png?text=Omni+Office');
              if (url) onExecCommand('insertImage', url);
            }}
            title="그림 삽입 (Ctrl+N, I)"
          >
            <Image size={18} color="#059669" />
            <span>그림</span>
          </button>
          <button
            type="button"
            className="rhwp-tool-btn"
            onClick={() => {
              const sym = prompt('삽입할 특수문자 또는 기호를 선택하세요:', '※');
              if (sym) onExecCommand('insertText', sym);
            }}
            title="문자표 삽입 (Ctrl+F10)"
          >
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#475569' }}>※</span>
            <span>문자표</span>
          </button>
          <button
            type="button"
            className="rhwp-tool-btn"
            onClick={() => {
              const url = prompt('링크할 웹 주소(URL)를 입력하세요:', 'https://');
              if (url) onExecCommand('createLink', url);
            }}
            title="하이퍼링크 삽입 (Ctrl+K)"
          >
            <Link size={18} color="#2563eb" />
            <span>하이퍼링크</span>
          </button>
        </div>

        {/* 쪽 구성 및 도구 그룹 */}
        <div className="tool-cluster">
          <button type="button" className="rhwp-tool-btn" onClick={() => alert('머리말/꼬리말 설정 (Ctrl+N, H)')} title="머리말 설정">
            <FileText size={18} color="#64748b" />
            <span>머리말</span>
          </button>
          <button
            type="button"
            className="rhwp-tool-btn"
            onClick={() => {
              const fn = prompt('각주 내용을 입력하세요:');
              if (fn) {
                onExecCommand('insertHTML', `<sup style="color: #0055b8; font-weight: bold;">[각주: ${fn}]</sup>`);
              }
            }}
            title="각주 삽입 (Ctrl+N, N)"
          >
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>[1]</span>
            <span>각주</span>
          </button>
          <button
            type="button"
            className="rhwp-tool-btn"
            onClick={() => {
              const kw = prompt('찾을 단어를 입력하세요:');
              if (kw) window.find(kw);
            }}
            title="찾기/바꾸기 (Ctrl+F)"
          >
            <Search size={18} color="#d97706" />
            <span>찾기</span>
          </button>
          <button type="button" className="rhwp-tool-btn" onClick={() => alert('문서 변경 이력 관리 (SQLite 로컬 스냅샷)')} title="이력 관리">
            <History size={18} color="#475569" />
            <span>이력관리</span>
          </button>
          <button type="button" className="rhwp-tool-btn" onClick={() => alert('문서 비교 기능: 이전 버전과의 차이점을 한눈에 확인합니다.')} title="문서 비교">
            <GitCompare size={18} color="#475569" />
            <span>문서비교</span>
          </button>
        </div>
      </div>

      {/* 2. 하단 서식줄 (Lower Formatting Bar) */}
      <div className="omni-lower-ribbon">
        {/* 스타일 드롭다운 */}
        <select
          className="format-select"
          style={{ width: '85px' }}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'h1') onExecCommand('formatBlock', '<h1>');
            else if (val === 'h2') onExecCommand('formatBlock', '<h2>');
            else if (val === 'h3') onExecCommand('formatBlock', '<h3>');
            else onExecCommand('formatBlock', '<p>');
          }}
          defaultValue="p"
          title="문단 스타일"
        >
          <option value="p">바탕글</option>
          <option value="body">본문</option>
          <option value="h1">개요 1 (대제목)</option>
          <option value="h2">개요 2 (중제목)</option>
          <option value="h3">개요 3 (소제목)</option>
        </select>

        {/* 언어 구분 */}
        <select className="format-select" style={{ width: '60px' }} title="글꼴 언어군">
          <option value="ko">대표</option>
          <option value="han">한글</option>
          <option value="en">영문</option>
          <option value="ch">한자</option>
        </select>

        {/* 글꼴 드롭다운 */}
        <select
          className="format-select"
          style={{ width: '130px' }}
          value={fontFamily}
          onChange={(e) => {
            onChangeFontFamily(e.target.value);
            onExecCommand('fontName', e.target.value);
          }}
          title="글꼴체 선택"
        >
          <option value="'Batang', '바탕', '함초롬바탕', serif">함초롬바탕 (공공표준)</option>
          <option value="'Malgun Gothic', '맑은 고딕', sans-serif">맑은 고딕 (오피스)</option>
          <option value="'Nanum Myeongjo', '나눔명조', serif">나눔명조</option>
          <option value="'Dotum', '돋움', sans-serif">돋움</option>
          <option value="'Gulim', '굴림', sans-serif">굴림</option>
          <option value="'Gungsuh', '궁서', serif">궁서</option>
        </select>

        {/* 글자 크기 스피너 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <input
            type="number"
            className="format-number-input"
            value={fontSize}
            min={6}
            max={72}
            step={0.5}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 10;
              onChangeFontSize(val);
              onExecCommand('fontSize', '4');
            }}
            title="글자 크기 (pt)"
          />
          <span style={{ fontSize: '11px', color: '#666' }}>pt</span>
          <button
            type="button"
            className="format-spin-btn"
            onClick={() => {
              const next = Math.min(72, fontSize + 1);
              onChangeFontSize(next);
            }}
          >
            +
          </button>
          <button
            type="button"
            className="format-spin-btn"
            onClick={() => {
              const next = Math.max(6, fontSize - 1);
              onChangeFontSize(next);
            }}
          >
            -
          </button>
        </div>

        {/* 줄간격 스피너 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '4px' }}>
          <input
            type="number"
            className="format-number-input"
            value={lineHeight}
            min={100}
            max={300}
            step={10}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10) || 160;
              onChangeLineHeight(val);
            }}
            title="줄간격 (%)"
          />
          <span style={{ fontSize: '11px', color: '#666' }}>%</span>
          <button type="button" className="format-spin-btn" onClick={() => onChangeLineHeight(Math.min(300, lineHeight + 10))}>
            +
          </button>
          <button type="button" className="format-spin-btn" onClick={() => onChangeLineHeight(Math.max(100, lineHeight - 10))}>
            -
          </button>
        </div>

        <div className="format-divider" />

        {/* 글자 서식 버튼 (굵게, 기울임, 밑줄, 취소선) */}
        <button type="button" className="format-icon-btn" onClick={() => onExecCommand('bold')} title="굵게 (Ctrl+B)">
          <Bold size={14} />
        </button>
        <button type="button" className="format-icon-btn" onClick={() => onExecCommand('italic')} title="기울임 (Ctrl+I)">
          <Italic size={14} />
        </button>
        <button type="button" className="format-icon-btn" onClick={() => onExecCommand('underline')} title="밑줄 (Ctrl+U)">
          <Underline size={14} />
        </button>
        <button type="button" className="format-icon-btn" onClick={() => onExecCommand('strikeThrough')} title="취소선">
          <Strikethrough size={14} />
        </button>

        {/* 글자색 / 형광펜 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <label className="format-color-label" title="글자색 변경" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: textColor }}>가</span>
            <input
              type="color"
              value={textColor}
              style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              onChange={(e) => {
                onChangeTextColor(e.target.value);
                onExecCommand('foreColor', e.target.value);
              }}
            />
            <div style={{ width: '12px', height: '3px', backgroundColor: textColor, marginTop: '12px', position: 'absolute' }} />
          </label>

          <label className="format-color-label" title="형광펜 / 음영색" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1px', marginLeft: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: highlightColor, padding: '1px 3px', borderRadius: '2px' }}>형</span>
            <input
              type="color"
              value={highlightColor}
              style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              onChange={(e) => {
                onChangeHighlightColor(e.target.value);
                onExecCommand('hiliteColor', e.target.value);
              }}
            />
          </label>
        </div>

        <div className="format-divider" />

        {/* 문단 정렬 (양쪽, 왼쪽, 가운데, 오른쪽, 배분) */}
        <button type="button" className="format-icon-btn" onClick={() => onExecCommand('justifyFull')} title="양쪽 맞춤 (Ctrl+Shift+M)">
          <AlignJustify size={14} />
        </button>
        <button type="button" className="format-icon-btn" onClick={() => onExecCommand('justifyLeft')} title="왼쪽 정렬 (Ctrl+Shift+L)">
          <AlignLeft size={14} />
        </button>
        <button type="button" className="format-icon-btn" onClick={() => onExecCommand('justifyCenter')} title="가운데 정렬 (Ctrl+Shift+C)">
          <AlignCenter size={14} />
        </button>
        <button type="button" className="format-icon-btn" onClick={() => onExecCommand('justifyRight')} title="오른쪽 정렬 (Ctrl+Shift+R)">
          <AlignRight size={14} />
        </button>
      </div>
    </div>
  );
};
