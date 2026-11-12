---
title: 세션 로그
created: 2026-11-12
updated: 2026-11-12
domain: development
---

# 세션 로그 (최신이 위)

이 파일이 **"언제 무슨 일이 있었나"의 SSOT**다. 세션마다 최상단에 블록 추가.
(커밋/푸시는 사용자가 직접 성긴 단위, git history 를 이력 SSOT 로 삼지 않는다.)

블록 형식: `## YYYY-MM-DD - 제목` 아래에 **요청/피드백, 수정, 검증, 다음** 순서로 간결하게.

## 2026-11-12 - 흰 화면(React Error #60) 버그 수정, NSIS 인스톨러 재배포 및 Git 커밋

- **요청/피드백**:
  1. 바이너리 실행 시 흰 화면만 노출되는 현상 수정 요청 (feedback/스크린샷 2026-11-12 134436.png)
  2. 이전 인스톨러 삭제 및 포터블 바이너리 제외(NSIS 인스톨러 단일 배포) 요청
  3. Git 커밋 및 푸시 대행 요청 (Claude, GPT, Gemini 다중 Co-Authored-By 포함)
- **수정**:
  - 원인 분석: `HwpCanvas.tsx`에서 A4 용지 div에 `dangerouslySetInnerHTML`과 자식 요소(재단 마커 4개 div)가 공존하여 React 18 런타임 오류(Minified React error #60: "Can only set one of children or props.dangerouslySetInnerHTML")가 발생하고 전체 렌더링이 중단됨
  - `src/renderer/src/components/HwpCanvas.tsx`: 모서리 재단 마커와 실제 편집 본문 영역(`.hwp-editor-content`)을 분리하여 dangerouslySetInnerHTML 전용 단독 요소로 분리
  - `src/renderer/src/styles.css`: `.hwp-editor-content` 스타일 추가
  - `package.json`: 사용자 요청에 따라 `win.target`을 NSIS 단일 타겟으로 복원하고 portable 설정 제거
  - 바탕화면 `seonghyun` 디렉토리: 구버전 `OmniOffice-Setup-0.1.0.exe` 및 `OmniOffice-0.2.0-portable.exe` 삭제 완료, 수정된 `OmniOffice-Setup-0.2.0.exe` (105MB, MD5: b91199de1d867a4596be449537077434) 배포
  - 피드백 스크린샷 아카이빙 (`docs/feedback-archive/2026-11-12-white-screen-fix/`)
- **검증**: `xvfb-run` 헤드리스 환경에서 Electron 구동 테스트 진행, React 런타임 오류 0건 및 정상 UI 마운트 확인
- **다음**: 사용자 Windows 실기 설치 확인 및 피드백 수렴

## 2026-11-12 - 인스톨러 및 단독 바이너리 자동 버저닝(v0.2.0) 구축 및 다중 모델 Co-Authored-By 반영

- **요청/피드백**:
  1. 커밋 트레일러 Co-Authored-By에 Claude, GPT, Gemini 모두 및 공식 이메일 포함 요청
  2. 인스톨러와 실행 바이너리 모두에 SemVer 버저닝(메이저/마이너/패치) 반영 및 자동 조절 파이프라인 구축 요청
- **수정**:
  - `scripts/bump-version.js`: 메이저/마이너/패치 버전을 단일 명령으로 올려 `package.json`, `package-lock.json`, `src-tauri/Cargo.toml`, `src/renderer/src/version.ts`를 원자적으로 동기화하는 스크립트 작성
  - `package.json`:
    - `version`을 0.2.0으로 승격
    - `bump:patch`, `bump:minor`, `bump:major` 스크립트 추가
    - `win.target`을 NSIS 인스톨러(`OmniOffice-Setup-${version}.exe`) 및 단독 포터블 바이너리(`OmniOffice-${version}-portable.exe`) 2개 타겟 동시 생성으로 구성
  - `src/renderer/src/version.ts`: 앱 버전 상수 모듈화 (`APP_VERSION = '0.2.0'`)
  - `TitleBar.tsx` 및 `StatusBar.tsx`: 앱 버전(`v0.2.0`) 동적 표기 연동
  - `npm run dist:win` 실행으로 v0.2.0 NSIS 인스톨러 및 v0.2.0 포터블 바이너리 빌드 및 바탕화면 `seonghyun` 배포
- **검증**: `bump-version.js` 정상 작동 확인, v0.2.0 인스톨러 및 포터블 바이너리 생성 및 체크섬 검증
- **다음**: 사용자 실기 환경 테스트 및 HWP 바이너리 파서 Rust 모듈 실물 연동 (M2)

## 2026-11-12 - UI 전면 개편(rhwp 및 genoffice 융합), 소스 구조 단일화 리팩토링 및 신규 인스톨러 배포

- **요청/피드백**:
  1. 상단 타이틀바 중복 해소 (단일 커스텀 타이틀바로 통합하고 앱 아이콘 배치)
  2. [파일] 탭 독립 메뉴 생성 (새 문서: HWP, XLSX, DOCX, MD, 열기, 저장, 인쇄 등)
  3. rhwp 데모 및 genoffice 융합: 2단 리본 툴바(오려두기, 복사, 붙이기, 모양복사, 조판/문단부호, 격자, 글자/문단모양, 문단번호, 글머리표, 표, 도형, 그림, 문자표, 하이퍼링크 등) + 서식줄(스타일, 언어, 글꼴, 크기, 줄간격, 굵게, 기울임, 밑줄, 자간, 색상, 정렬) + 가로/세로 cm 눈금자 + A4 용지 및 모서리 재단 마커(상하좌우)
  4. 스프레드시트 수식줄(fx) 및 셀 그리드 연동
  5. src, src-launcher, src-tauri 분리 이유 설명 및 코드 리팩토링 요청
  6. Prettier printWidth 200 설정 적용 요청
- **수정**:
  - `src/main/index.ts`: `frame: false` 설정으로 OS 기본 타이틀바 제거
  - `src/renderer/src/components/`:
    - `TitleBar.tsx`: 앱 공식 아이콘 및 단일 윈도우 컨트롤(_ □ X) 일원화
    - `MenuBar.tsx`: 파일, 편집, 보기, 입력, 서식, 쪽, 표, 도구 상단 메뉴
    - `FileMenuDropdown.tsx`: 독립 드롭다운 파일 메뉴
    - `HwpRibbon.tsx`: rhwp 스타일 2단 리본 및 서식줄
    - `ExcelRibbon.tsx`: genoffice 스타일 스프레드시트 리본 및 수식줄(fx)
    - `DocTabs.tsx`: 다중 문서 탭 바
    - `HwpCanvas.tsx`: cm 가로/세로 눈금자, 들여쓰기 마커, A4 모서리 재단 마커
    - `SheetCanvas.tsx`: 엑셀 그리드 및 하단 워크시트 탭
    - `StatusBar.tsx`: 용지/포맷/배율/엔진 상태 표시줄
  - 리팩토링: `src/` 루트의 레거시 파일 및 불필요한 `src-launcher`, `installer/` 삭제, `src/`를 main, preload, renderer 3계층으로 단일화
  - `.prettierrc`: `printWidth: 200` 설정 추가 및 `npm run format` 실행
  - `ADR-0003`: 데스크톱 쉘 단일화 및 코드베이스 리팩토링 결정 기록
  - `npm run dist:win` 재빌드 -> 신규 105MB NSIS 인스톨러 생성 및 바탕화면 복사
- **검증**: `npm run format`, `npm run build`, `npm run dist:win` 통과, MD5: `5c9d14708efaee3bc1daa777ad9945ff` 일치 확인
- **다음**: 사용자 실기 설치 및 동작 확인

## 2026-11-12 - sh-* 표준 자체 데스크톱 서비스(Electron + NSIS) 전환 및 실물 HWP/XLSX 탑재 (v0.1.0)

- **요청/피드백**: 이전 빌드가 웹 브라우저 같고 빈 껍데기라는 피드백. 기존 `sh-*` 프로젝트(`sh-compositor`, `pdf-editor`)처럼 완전한 자체 독립 데스크톱 서비스로 구동되고 즉시 사용 가능한 실물 에디터 탑재 요청.
- **수정**:
  - 아키텍처 재정립: 핵심 엔진은 Rust + WASM (`rhwp` 및 수식 엔진), 데스크톱 셸은 Electron + electron-builder로 일원화
  - `src/main/index.ts`: Native BrowserWindow, Windows 파일 열기/저장 다이얼로그, 로컬 파일시스템 직접 입출력, 인쇄 연동
  - `src/renderer/src/App.tsx`:
    - Tab 1: **2026년 공공기관 디지털 전환 추진 계획서.hwp** 실물 기획안 탑재 (문서번호, 제목, 메타데이터 표, 3개 본문 섹션, A4 용지 캔버스)
    - Tab 2: **2026년도 사업별 예산 및 집행 명세서.xlsx** 실물 재정 스프레드시트 탑재 (수식줄 fx, 동적 집행률 계산, 합계 수식 연동, 다중 시트 탭)
    - 오피스 리본 툴바(글꼴, 크기, 굵게, 기울임, 밑줄, 취소선, 정렬, 표 삽입, 날짜 삽입, 확대/축소)
  - `npm run dist:win` (`electron-builder --win`) 실행으로 정식 Windows NSIS 인스톨러 생성
  - 바탕화면 `seonghyun` 디렉토리에 `OmniOffice-Setup-0.1.0.exe` (105MB) 최종 배치
- **검증**: `electron-vite build` 및 `electron-builder` 통과, MD5 체크섬(`5b01965b6fc6b164048ab06429180feb`) 일치 확인
- **다음**: 사용자 실기 설치 확인 후 세부 HWPX 파서 확장

## 2026-11-12 - 바탕화면 seonghyun 폴더에 Windows 인스톨러 배포 (v0.1.0)

- **요청/피드백**: 바탕화면 `seonghyun` 디렉토리에 Omni Office 인스톨러 빌드 및 배포 요청.
- **수정**:
  - `src-launcher`: Windows 네이티브 초경량 런처(`OmniOffice.exe`) 구현
  - `installer/omni-office.iss`: Inno Setup 6 인스톨러 스크립트 작성 (한국어 마법사, 바탕화면/시작메뉴 바로가기, 제거 프로그램 포함)
  - `installer/publish`: 앱 런처 및 React/Fluent UI 프로덕션 번들 스테이징
  - Inno Setup 컴파일(`ISCC.exe`)을 통해 `OmniOffice-Setup-0.1.0.exe` (2.3MB) 생성
  - 생성된 인스톨러를 `/mnt/c/Users/user/Desktop/seonghyun/`에 복사
- **검증**: Inno Setup 컴파일 무결성 검증, 2.3MB 단일 파일 복사 및 권한 확인
- **다음**: 사용자 실기 설치 테스트 및 HWP/HWPX 문서 파싱 엔진 연동(M2)

## 2026-11-12 - omni-office 프로젝트 킥오프 완료

- **요청/피드백**: edwardkim/rhwp와 genspark-ai/genoffice를 통합하여 한글(HWP/HWPX) 및 엑셀(XLSX) 문서를 초고속/최적화로 다룰 수 있는 크로스플랫폼 데스크톱 문서 편집기 omni-office 킥오프 요청.
- **수정**:
  - 발사대 템플릿 인스턴스화 (`omni-office`, `2026-11-12`, `2026` 플레이스홀더 치환)
  - `docs/brief.md`, `docs/adr/0002-stack.md`, `docs/plans/0001-mvp.md`, `docs/guides/packaging.md` 작성
  - 하네스 문서(`current-state.md`, `domain-contract.md`, `agent-workflow.md`, `writing-guide.md`) 및 `CLAUDE.md`, `AGENTS.md` 완성
  - Rust Tauri 백엔드(`src-tauri/src/db.rs`, `commands.rs`, `lib.rs`, `main.rs`) 및 React 프론트엔드(`src/components/RibbonBar.tsx`, `DocumentTabs.tsx`, `EditorCanvas.tsx`, `HwpEditor.tsx`, `SheetEditor.tsx`, `StatusBar.tsx`) 스캐폴딩
  - SQLite 임시저장 캐시 및 최근 문서 이력 관리 로직 구현
- **검증**: Rust 백엔드 단위 테스트(`db::tests`, `commands::tests`) 및 프론트엔드 컴포넌트 구조 검증
- **다음**: rhwp Rust/WASM 파서 모듈 실물 연동 및 HWP 바이너리 파싱 테스트 (M2 착수)
