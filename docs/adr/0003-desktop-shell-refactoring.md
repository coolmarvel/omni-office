---
title: ADR-0003 데스크톱 쉘 단일화 및 코드베이스 리팩토링
created: 2026-11-12
status: accepted
---

# ADR-0003: 데스크톱 쉘 단일화 및 코드베이스 리팩토링

## 상태

Accepted

## 맥락

프로젝트 초기화 및 런처 제작 과정에서 3개의 소스 디렉토리가 혼재하여 구조적 혼선이 발생했다:

1. `src-tauri`: 초기 킥오프 시 Tauri 2.0 스캐폴딩. WSL2 환경에서 Windows 크로스컴파일 도구 체인(MinGW) 부재로 인해 윈도우 인스톨러 직접 빌드가 중단됨.
2. `src-launcher`: Windows 인스톨러 요청에 대응하기 위해 C# .NET 기반 Edge WebView 앱 모드 런처를 임시 구현했으나, 사용자가 "웹 브라우저 같고 빈 껍데기"라는 피드백을 제시하여 폐기 결정.
3. `src`: sh-compositor, sh-video-editor, pdf-editor 등에서 검증된 Electron + electron-builder 아키텍처로 전환하여 단일 데스크톱 서비스를 구축함. 그러나 이 과정에서 초기 Vite 단일 페이지 파일(src/App.tsx, src/main.tsx, src/components)이 루트에 남아 중복이 발생함.

또한 사용자는 상단 타이틀바 중복 문제(OS 기본 타이틀바와 내부 커스텀 타이틀바 중복), [파일] 탭 분리, edwardkim/rhwp 데모 사이트 수준의 풍부한 리본/눈금자/A4 레이아웃 및 genspark-ai/genoffice 스프레드시트 엔진 융합, Prettier printWidth 200 설정을 요구했다.

## 결정

1. **디렉토리 정리 및 단일화**:
   - 임시 런처인 `src-launcher/` 및 구 인스톨러 `installer/` 디렉토리를 완전히 삭제함.
   - `src/` 루트에 방치되었던 레거시 파일(`src/App.tsx`, `src/main.tsx`, `src/index.css`, `src/types.ts`, `src/components/`)을 제거함.
   - `src/`는 오직 `main/`(Electron 메인 프로세스), `preload/`(IPC 컨텍스트 브리지), `renderer/`(React 18 + TS UI) 3계층으로만 엄격히 관리함.
   - `src-tauri/`는 Tauri 앱 호스트가 아닌 Rust 기반 HWP/HWPX WASM 파서 및 계산 라이브러리 엔진의 위치로 재정의함.

2. **UI 모듈화 및 기능 융합**:
   - `BrowserWindow`에 `frame: false`를 적용하고 단일 커스텀 `TitleBar`로 일원화함.
   - 독립적인 `FileMenuDropdown`을 구축하여 새 문서(HWP, XLSX, DOCX, MD), 열기, 저장, 인쇄를 체계화함.
   - `HwpRibbon`(rhwp 스타일 2단 리본 + 서식줄)과 `ExcelRibbon`(genoffice 스타일 툴바 + 수식줄)을 분리 구현하고 문서 탭에 따라 동적 전환함.
   - A4 실물 용지 뷰포트, cm 가로/세로 눈금자, 모서리 재단 마커(상하좌우 재단선)를 탑재함.
   - 컴포넌트를 `TitleBar`, `MenuBar`, `FileMenuDropdown`, `HwpRibbon`, `ExcelRibbon`, `DocTabs`, `HwpCanvas`, `SheetCanvas`, `StatusBar`로 모듈화함.

3. **코드 스타일 규격화**:
   - `.prettierrc`에 `printWidth: 200`을 적용하고 `npm run format`을 등록함.

## 근거

- 다중 소스 디렉토리(`src`, `src-launcher`, `src-tauri`)로 인한 관리 분산을 종식시키고, sh-* 계열의 검증된 단일 데스크톱 서비스 패턴을 완성함.
- 브라우저 느낌을 완전히 제거한 100% 독립 데스크톱 패키지(NSIS 인스톨러) 제공.

## 결과

- 코드 가독성과 유지보수성이 대폭 향상됨.
- 빌드 파이프라인이 `npm run build && electron-builder --win`으로 단일화되어 일관된 105MB 정식 설치 파일이 생성됨.
