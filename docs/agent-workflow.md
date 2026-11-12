---
title: 에이전트 작업 계약
created: 2026-11-12
updated: 2026-11-12
domain: development
status: confirmed
---

# 에이전트 작업 계약

운영 정책의 SSOT다. 킥오프에서 실제 명령과 적용 상태를 채운다. 단일 에이전트가 기본이며 팀 실행은 필요할 때만 사용한다.

## 프로젝트 설정

| 항목                             | 값                                                              |
| -------------------------------- | --------------------------------------------------------------- |
| 운영 모드                        | single (기본), 로컬 데스크톱 개발                               |
| 실행 방식                        | 대화형 (사용자 검토 및 피드백 기반)                             |
| 백엔드 스택 및 도구              | Rust 1.99+, Cargo, rusqlite, Tauri 2.x                          |
| 프론트엔드 스택 및 도구          | Node.js v24+, npm 11+, Vite, React 18, Fluent UI, TypeScript    |
| 빠른 검증 명령과 cwd             | `cd src-tauri && cargo check` / `npm run lint` (in root)        |
| 통합 검증 명령과 cwd             | `cd src-tauri && cargo test` && `npm run build` (in root)       |
| 릴리스 검증과 산출물             | `npm run tauri build` (산출물: deb/msi/dmg 번들)                |
| 테스트 데이터와 외부 서비스 격리 | 100% 로컬 오프라인, 외부 API 의존 없음, 임베디드 SQLite         |
| 허용 수정 경로                   | `src/`, `src-tauri/`, `docs/`, `scripts/` (외부 경로 접근 금지) |
| 동시 worker / 재시도 상한        | not-applicable (단일 모드)                                      |
| 호출별 시간 / 과제 총예산        | not-applicable                                                  |
| CLI별 보호 장치 확인             | `scripts/hooks/env-guard.sh`, `scripts/hooks/git-add-guard.sh`  |

## 작업 흐름

1. 작업 전 `current-state.md`, todo, 최신 session-log 1~2개 블록을 확인한다.
2. 코드 변경 전 수용 기준과 도메인 불변조건(`domain-contract.md`)을 대조한다.
3. 코드 수정 후 빠른 검증(`cargo check`, `npm run lint`)과 통합 검증(`cargo test`, `npm run build`)을 실행하여 통과를 확인한다.
4. 검증 완료 후 `current-state.md`, `session-log.md`, `todo.md`를 갱신한다.
5. 커밋/푸시는 사용자가 직접 수행한다. 에이전트는 커밋 메시지만 작성해 제안한다.
