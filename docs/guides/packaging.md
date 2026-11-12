---
title: 데스크톱 인스톨러 패키징 가이드 (omni-office)
created: 2026-11-12
updated: 2026-11-12
domain: packaging
---

# 데스크톱 인스톨러 패키징 가이드 (omni-office)

## 개요

Tauri 2.x 기반으로 Windows(exe/msi), macOS(dmg), Linux(deb/AppImage) 인스톨러를 제작하는 규칙과 절차 모음이다.

- **제품명**: `omni-office`
- **표시명**: `Omni Office`
- **앱 ID (Identifier)**: `com.omnioffice.app`
- **백엔드 바이너리**: Rust 네이티브 머신 코드 (별도 asar 압축 없이 단일 실행 파일 또는 번들)
- **프론트엔드 리소스**: Vite 프로덕션 빌드 번들 (`dist/`)

## 공통 규칙

1. 릴리스 전 전체 검증 통과 필수 (`cargo check`, `cargo test`, `npm run build`).
2. 산출물 디렉토리(`src-tauri/target/release/bundle/`)는 `.gitignore` 대상이며 Git 저장소에 커밋하지 않는다.
3. 릴리스 자산 파일명은 ASCII 규칙을 따른다 (예: `OmniOffice-Setup-<v>.exe`, `OmniOffice-<v>-arm64.dmg`, `omni-office_<v>_amd64.deb`).
4. 라이센스 동의 페이지(`LICENSE`)와 저작권(Copyright (C) 2026 SeongHyun Lee) 메타데이터를 인스톨러에 포함한다.

## 플랫폼별 빌드 명령

| 플랫폼      | 타깃 산출물                  | 빌드 명령             |
| ----------- | ---------------------------- | --------------------- |
| **Windows** | NSIS (`.exe`) / WiX (`.msi`) | `npm run tauri build` |
| **macOS**   | `.dmg` / `.app`              | `npm run tauri build` |
| **Linux**   | `.deb` / `.AppImage`         | `npm run tauri build` |

## 아키텍처 명칭 규약 (macOS)

| 대상                  | 파일명 접미사 | 빌드 타깃              |
| --------------------- | ------------- | ---------------------- |
| Apple Silicon (M1~M4) | `arm64`       | `aarch64-apple-darwin` |
| Intel Mac             | `x64`         | `x86_64-apple-darwin`  |

- 내부 번들 이름은 반드시 ASCII(`CFBundleName`: `OmniOffice`, `CFBundleExecutable`: `omni-office`).
- 표시 이름(`CFBundleDisplayName`)은 한글 지원 가능.
