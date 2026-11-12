---
title: ADR-0002 스택 및 데스크톱 아키텍처 확정
created: 2026-11-12
updated: 2026-11-12
status: accepted
---

# ADR-0002: 기술 스택 및 데스크톱 아키텍처 확정

## 상태

Accepted: 사용자 피드백(sh-* 제품군과의 일관성 및 독립 서비스 요구)을 반영하여 확정됨.

## 맥락

한글(HWP/HWPX) 및 스프레드시트(XLSX) 문서를 통합하여 다루는 데스크톱 오피스 편집기를 구축해야 한다.
초기 프로토타입에서 웹 브라우저 느낌이 나는 문제를 해결하고, 기존 `sh-*` 제품군(`sh-compositor`, `pdf-editor`, `sh-video-editor`)과 동일하게 완벽한 자체 독립 데스크톱 서비스로 구동되어야 한다.

## 결정

### 1. 하이브리드 아키텍처: Rust/WASM 코어 + Electron 데스크톱 셸

- **핵심 연산 및 문서 파싱 엔진 (Rust + WebAssembly)**:
  - `rhwp` Rust 코어를 WASM으로 컴파일하여 백그라운드 워커에서 초고속으로 HWP 바이너리 파싱, 표/문단 구조 분석 수행.
  - `genoffice`의 스프레드시트 수식 계산 및 바이트 보존(byte-preserving) 방식 저장 로직 연동.
- **데스크톱 애플리케이션 프레임 (Electron + electron-builder)**:
  - 브라우저 느낌 없는 단일 독립 프로세스(`Omni Office.exe`)로 구동.
  - Windows 네이티브 파일 다이얼로그(`dialog.showOpenDialog`, `dialog.showSaveDialog`), 로컬 파일시스템 직접 입출력, 인쇄 연동.
  - `electron-builder --win`을 통한 NSIS 기반 Windows 전용 인스톨러 생성.
- **오피스 UI 레이어 (React + TypeScript + Fluent / SH-Classic)**:
  - 한글 A4 용지 캔버스(여백, 룰러, 표 서식, 한글 글꼴)와 엑셀 그리드(수식줄 fx, 다중 시트 탭, 동적 수식 계산) 통합 제공.

## 근거 및 장점

1. **완벽한 자체 서비스**: 웹 브라우저 종속성 없이 자체 프로세스로 실행되며 사용자에게 친숙한 데스크톱 UI/UX 제공.
2. **검증된 배포 파이프라인**: WSL 환경에서 `electron-builder --win`을 통해 안정적으로 Windows Setup 실행 파일(.exe) 생성 가능.
3. **고성능 연산**: 무거운 문서 파싱과 수식 계산은 Rust/WASM 엔진으로 최적화하여 반응성 확보.
