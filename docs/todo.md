---
title: TODO
created: 2026-11-12
updated: 2026-11-12
domain: development
---

# TODO (미해결 향후 작업만, 완료분은 session-log 로)

우선순위: P1 다음 릴리스에서 다뤄야 함, P2 가까운 로드맵, P3 품질, P4 아이디어.
항목에는 대상 파일 경로와 (있다면) 과거 사고 근거를 함께 적는다.

## P1 - 다음 릴리스에서 다뤄야 함

- [ ] rhwp Rust 코어 파서 및 WASM 렌더러 모듈 바인딩 (`src-tauri/`, `src/renderer/src/components/HwpCanvas.tsx`)
- [ ] 실제 대용량 HWP 5.0 바이너리 파일 열기 및 로컬 파싱 무결성 검증 (`src/renderer/src/components/HwpCanvas.tsx`)

## P2 - 가까운 로드맵

- [ ] SQLite 자동 복구 세션 복원 다이얼로그 연동 (`src/main/index.ts`, `src/renderer/src/App.tsx`)
- [ ] HWP 및 XLSX 파일 저장 및 바이트 보존 무결성 검증 (`src/main/index.ts`)

## P3 - 품질

- [ ] 대용량 HWP/XLSX 파일 열람 시 렌더링 성능 및 메모리 점유율 프로파일링 (< 100MB)
- [ ] 다크 모드 오피스 테마 스위처 (`src/renderer/src/styles.css`)

## P4 - 아이디어

- [ ] DOCX 및 PDF 뷰어 탭 확장
