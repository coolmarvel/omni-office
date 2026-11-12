# CLAUDE.md - omni-office 작업 가이드

이 파일은 **세션이 바뀌어도 맥락을 즉시 복구**하기 위한 진입점이다. Claude Code는 세션 시작 시
이 파일을 자동으로 읽는다. (도구 중립 절대 규칙은 `AGENTS.md`.)

> [project-seed](https://github.com/coolmarvel/project-seed) 에서 2026-11-12 에 생성됨.

## 세션 시작 부팅 프로토콜 (매 세션 첫 작업 전에 반드시 수행)

새 세션에서 작업을 시작하면, **코드를 건드리기 전에** 순서대로:

1. `docs/current-state.md`와 `docs/session-log.md` 최신 1~2개 블록 읽기 - 현재 인수인계와 최근 이력. 과거 전체 로그는 필요할 때 검색
2. `docs/todo.md` 읽기 - 남은 일 (P1~P4)
3. 작업 관련 `docs/plans/*.md`와 `docs/domain-contract.md`의 관련 규칙 읽기 - 날짜상 최신 계획이 현재 작업과 같다고 가정하지 않음
4. 사용자 피드백 확인: 루트의 피드백 스크린샷/메모 파일 확인 후 반영, 반영 후 `docs/feedback-archive/YYYY-MM-DD-*/` 로 이동
5. `git status` 에 모르는 변경이 있으면 session-log 와 대조 - 다른 세션의 흔적일 수 있다. 출처 불명이면 사용자에게 확인.

## 변경 후 자동 규칙 (사용자가 매번 요청하지 않아도 수행)

1. 코드를 바꾸면 **같은 작업 단위에** `docs/current-state.md`·`docs/session-log.md`(최상단 블록 추가)·`docs/todo.md`
   (+릴리스급이면 `docs/changelog.md`)를 갱신한다. 문서 규칙은 `docs/writing-guide.md`.
   팀 작업에서는 worker가 증거를 반환하고 리드만 통합 문서와 버전을 갱신한다. `docs/agent-workflow.md` 참고.
2. 검증을 통과하기 전에는 커밋 메시지 작성/산출물 전달을 하지 않는다:
   `cd src-tauri && cargo check && cargo test` 및 `npm run lint && npm run build`
3. 버전을 판단해 올린다 (아래 "버전 정책").
4. 산출물 전달: 로컬 실행 안내 (`npm run tauri dev`) 또는 배포 번들 빌드 (`npm run tauri build`) 안내.

## 버전 정책 (semver `MAJOR.MINOR.PATCH`)

**MINOR 승격은 사용자만 선언한다.** 에이전트가 판단해서 올리지 않는다.

- **PATCH**: 기본값. 다듬는 중인 기능의 수정 하나 반영할 때마다 +1.
- **MINOR**: 사용자가 "이 기능은 더 수정할 게 없다, 넘어가자"라고 선언한 그 시점에만.
- **MAJOR**: 대규모 재설계/호환 깨짐. 사용자와 상의.

## 커밋 컨벤션

Conventional Commits - `<type>: <한국어 제목>` + 리스트형 본문. **커밋/푸시는 사용자가 직접**
(에이전트는 요청 시 커밋 메시지만 작성). 메시지 끝에 `Co-Authored-By` 트레일러.

type: `feat` `fix` `refactor` `chore` `docs` `style` `test` `perf` `ci` `build` `revert` `init` `remove` `rename` `hotfix`

## 협업 규칙

- **진행 이력의 SSOT 는 `docs/session-log.md`**: git history 가 아니다 (커밋이 성긴 단위라서).
- 세션이 끊겨도 이어서 작업할 수 있게 **모든 진행 사항을 `docs/` 에 파일로 기록**한다.
- 설계 논쟁이 생기면 `docs/brief.md`(왜/무엇 SSOT)로 돌아와 판정한다. 브리프 밖 기능은 스코프 확인 먼저.
- `.env` 는 직접 수정하지 않는다. `.env.example` 수정 또는 사용자에게 요청. 훅의 존재를 실제 차단으로 간주하지 않고 도구별 입력·차단 검사를 확인한다.
- 규칙이 미확정이면 이 파일에 `<!-- TODO -->` 로 남기고, 확정되는 순간 채운다.
- 문서, 주석, 커밋 메시지에 특수기호(em-dash, 유니코드 화살표, 원문자, 이모지)를 쓰지 않는다.

## 이 프로젝트가 뭔가

omni-office는 공공/행정/기업 실무자를 위해 한글(HWP/HWPX) 및 스프레드시트(XLSX) 문서를 별도의 무거운 상용 프로그램 설치 없이 초고속으로 열람하고 편집할 수 있는 통합 데스크톱 문서 편집기다.
Rust + Tauri 2.x 백엔드와 React + TypeScript 프론트엔드, 로컬 SQLite 캐시를 기반으로 하며, `edwardkim/rhwp`와 `genspark-ai/genoffice`의 엔진을 통합하여 1초 이내 기동과 메모리 100MB 이하의 초경량 반응성을 목표로 한다.

## 문서 인덱스 (docs/)

| 파일                      | 용도                                                                   |
| ------------------------- | ---------------------------------------------------------------------- |
| `docs/writing-guide.md`   | **문서 지배 규칙** (SSOT·frontmatter·코드 1:1 대조). 문서 쓰기 전 필독 |
| `docs/brief.md`           | 프로젝트 **왜/무엇 SSOT**: 킥오프 산출물                               |
| `docs/current-state.md`   | 짧은 현재 인수인계. 과거 전체 로그 대신 우선 읽기                      |
| `docs/agent-workflow.md`  | 역할, 위임, 예산, 검사, 결과와 통합 정책                               |
| `docs/domain-contract.md` | 업무 규칙, 근거, 수용 예시, 미확인 사항                                |
| `docs/session-log.md`     | 세션별 진행 이력. **"언제 무슨 일" SSOT** (최신이 위)                  |
| `docs/todo.md`            | 미해결·향후 작업만 (P1~P4). 완료분은 session-log 로                    |
| `docs/changelog.md`       | 릴리스 단위 사람용 요약                                                |
| `docs/adr/*.md`           | 구조적 결정 기록 - 왜 이렇게 했는가 (`NNNN-kebab.md`)                  |
| `docs/plans/*.md`         | 앞으로 만들 것 - 기능 단위 구현 계획 (역할 구분은 `plans/README.md`)   |
| `docs/guides/*.md`        | 현재 구현된 동작·코드 위치 (기능별)                                    |
| `docs/feedback-archive/`  | 처리 완료한 사용자 피드백 보관소                                       |

## 자주 쓰는 명령

```bash
# 개발 서버 구동 (Vite 프론트엔드)
npm run dev

# Tauri 데스크톱 개발 모드 실행
npm run tauri dev

# 빠른 검증 (Rust check + TS lint)
(cd src-tauri && cargo check) && npm run lint

# 통합 검증 (Rust tests + Vite build)
(cd src-tauri && cargo test) && npm run build

# 포맷팅 훅 실행
./scripts/hooks/format.sh

# 데스크톱 인스톨러 배포 빌드
npm run tauri build
```

## 코드 지도 (수정 시 어디를 보나)

- `src-tauri/src/main.rs`, `src-tauri/src/lib.rs`: Tauri 애플리케이션 진입점 및 IPC 핸들러 등록
- `src-tauri/src/db.rs`: SQLite 연결, 최근 문서 목록(`recent_documents`), 임시저장 캐시(`session_drafts`)
- `src-tauri/src/commands.rs`: 문서 로드(`open_document`), 저장(`save_document`), 최근 목록 조회 IPC
- `src/App.tsx`: 메인 윈도우 컨트롤러, 열린 문서 탭 관리 및 10초 주기 SQLite 자동 임시저장
- `src/components/RibbonBar.tsx`: Fluent UI 기반 오피스 상단 리본 메뉴 (홈, 삽입, 보기, 도움말)
- `src/components/DocumentTabs.tsx`: 다중 문서 열람 탭 바 (HWP, XLSX 전환)
- `src/components/HwpEditor.tsx`: HWP/HWPX 문서 렌더링 캔버스 (rhwp 연동 지점, 한글 IME 최적화)
- `src/components/SheetEditor.tsx`: XLSX 스프레드시트 그리드 (genoffice 연동 지점, 수식 입력줄)
- `src/components/StatusBar.tsx`: 하단 상태 표시줄 (포맷, 크기, 저장 상태, 인코딩)

새 기능 추가 흐름:

1. 도메인/규칙 확인 (`docs/domain-contract.md`)
2. 백엔드 IPC / SQLite 로직 (`src-tauri/src/`)
3. 프론트엔드 컴포넌트/타입 연동 (`src/`)
4. 검증 명령 실행 (`cargo check`, `cargo test`, `npm run build`)
5. 문서 갱신 (`current-state.md`, `session-log.md`, `todo.md`)

## 디자인 시스템 (Fluent)

디자인 레퍼런스: Fluent (Microsoft) 단일 스타일 유지
디자인 규약은 Microsoft Office 데스크톱 표준 툴바, 리본 탭, 세련된 대화상자 레이아웃을 엄격히 준수한다.
루트 `DESIGN.md` 및 Fluent UI React (`@fluentui/react-components`) 기반으로 색상, 간격, 타이포그래피를 일관되게 적용한다.

## 하네스 (Harness Engineering)

지시문을 실제 권한과 검사로 연결한다. 도입 근거: `docs/adr/0001-harness-engineering.md`.

| 축                                 | 내용                                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| Hooks (`scripts/hooks/`)           | `env-guard.sh` · `git-add-guard.sh`: 입력 계약 확인 및 차단 · `format.sh`: cargo fmt + prettier |
| Settings (`.claude/settings.json`) | Remote Control 차단, PreToolUse 및 PostToolUse 훅 등록                                          |
| Commands (`.claude/commands/`)     | `/review-security` · `/deploy-check`                                                            |
| MCP (`.mcp.json`)                  | `context7`(라이브러리 문서) · `playwright`(브라우저 QA)                                         |
