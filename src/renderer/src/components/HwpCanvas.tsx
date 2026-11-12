import React, { useRef } from 'react';

interface HwpCanvasProps {
  htmlContent: string;
  onContentChange: (newHtml: string) => void;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  zoomLevel: number;
  showControlMarks: boolean;
  showParagraphMarks: boolean;
  showGridLines: boolean;
  pageMargins?: { top: number; bottom: number; left: number; right: number };
}

export const HwpCanvas: React.FC<HwpCanvasProps> = ({
  htmlContent,
  onContentChange,
  fontFamily,
  fontSize,
  lineHeight,
  zoomLevel,
  showControlMarks,
  showParagraphMarks,
  showGridLines,
  pageMargins,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // 1cm ~ 20cm 눈금 생성
  const cmTicks = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div className="hwp-canvas-root">
      {/* 1. 상단 가로 눈금자 (Horizontal Ruler) */}
      <div className="hwp-ruler-horizontal-container">
        <div className="hwp-ruler-corner-blank" />
        <div className="hwp-ruler-scale">
          {/* 첫 줄 들여쓰기 마커 */}
          <div className="ruler-marker-indent-first" title="첫 줄 들여쓰기" />
          {/* 왼쪽 여백/내어쓰기 마커 */}
          <div className="ruler-marker-indent-left" title="왼쪽 여백" />

          {cmTicks.map((cm) => (
            <div key={cm} className="ruler-tick-cm">
              <span className="ruler-tick-label">{cm}</span>
              <div className="ruler-tick-half" />
            </div>
          ))}

          {/* 오른쪽 여백 마커 */}
          <div className="ruler-marker-indent-right" title="오른쪽 여백" />
        </div>
      </div>

      {/* 2. 주 뷰포트 (A4 용지 렌더링) */}
      <div className="hwp-viewport">
        <div
          className={`hwp-page-sheet ${showGridLines ? 'show-grid' : ''} ${showParagraphMarks ? 'show-para-marks' : ''} ${showControlMarks ? 'show-ctrl-marks' : ''}`}
          style={{
            zoom: `${zoomLevel}%`,
            fontFamily,
            fontSize: `${fontSize}pt`,
            lineHeight: `${lineHeight}%`,
            padding: pageMargins ? `${pageMargins.top}mm ${pageMargins.right}mm ${pageMargins.bottom}mm ${pageMargins.left}mm` : undefined,
          }}
        >
          {/* A4 용지 네 모서리 재단 마커 (┌ ┐ └ ┘) */}
          <div className="hwp-corner-guide guide-tl" />
          <div className="hwp-corner-guide guide-tr" />
          <div className="hwp-corner-guide guide-bl" />
          <div className="hwp-corner-guide guide-br" />

          {/* 실제 편집 본문 영역 (dangerouslySetInnerHTML 전용 단독 요소) */}
          <div
            className="hwp-editor-content"
            contentEditable
            suppressContentEditableWarning
            ref={editorRef}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            onInput={(e) => {
              onContentChange(e.currentTarget.innerHTML);
            }}
          />
        </div>
      </div>
    </div>
  );
};
