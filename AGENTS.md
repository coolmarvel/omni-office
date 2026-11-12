# AGENTS.md - omni-office

이 파일은 **모든 AI 코딩 에이전트**(Claude Code, Codex, Cursor, Copilot 등)를 위한 진입점이다.
도구에 상관없이 아래 규칙을 따른다. Claude Code 전용 상세(부팅 프로토콜·하네스)는 `CLAUDE.md`.
이 파일을 자동 로드하지 않는 에이전트에는 리드 또는 실행 연결부가 명시적으로 전달한다.
도구별 설정 파일·슬래시 명령의 자동 호환을 가정하지 않는다.

## 이 프로젝트가 무엇인가

omni-office는 공공/행정/기업 실무자를 위해 한글(HWP/HWPX) 및 스프레드시트(XLSX) 문서를 별도의 무거운 상용 프로그램 설치 없이 초고속으로 열람하고 편집할 수 있는 크로스플랫폼 데스크톱 문서 편집기다.
스택은 Rust + Tauri 2.x 백엔드, Web/WASM (React 18 + TypeScript + Fluent UI) 프론트엔드, 로컬 파일 시스템 + SQLite 임베디드 캐시를 사용하며, 오픈소스 `edwardkim/rhwp`와 `genspark-ai/genoffice`의 엔진을 통합한다.

## 절대 규칙 (위반 금지)

1. **작업 전에 읽는다**: `docs/current-state.md`, `docs/todo.md`, session-log 최신 1~2개 블록, 작업 관련 계획 순서로. 전체 과거 이력은 필요할 때 검색한다.
2. **코드를 바꾸면 같은 작업 단위에 문서를 갱신한다**: current-state + session-log 최상단 블록 + todo. 팀에서는 리드만 통합 문서를 갱신하고 worker는 결과를 반환한다. 규칙은 `docs/writing-guide.md`와 `docs/agent-workflow.md`.
3. **검증 없이 전달하지 않는다**: `cd src-tauri && cargo check && cargo test` 및 루트의 `npm run lint && npm run build` 통과가 커밋 메시지 작성의 전제.
4. **`.env` 를 직접 수정하지 않는다.** `.env.example` 수정 또는 사용자에게 요청.
5. **`git add -A` / `git add .` 금지.** 파일을 지정해서 stage 한다. **커밋/푸시는 사용자가 직접.**
6. **스택·구조 변경은 ADR 로**: 구조적 결정은 `docs/adr/NNNN-*.md` 에 근거와 함께 기록한다.
7. **버전의 MINOR 승격은 사용자 선언이 있을 때만.**
8. **브리프가 판정 기준**: 설계 논쟁·스코프 논쟁은 `docs/brief.md` 로 돌아와 판정한다.
9. **도메인 근거와 완료 증거**: 업무 규칙은 `docs/domain-contract.md`의 확인 상태를 따른다. 실행하지 않은 검사를 통과했다고 보고하지 않는다. 훅은 도구별 실제 차단 검증이 필요하다.
10. **특수기호 금지**: 문서, 주석, 커밋 메시지에 em-dash, 유니코드 화살표, 원문자, 이모지 같은 특수기호를 쓰지 않는다.

## 커밋 컨벤션

Conventional Commits - `<type>: <한국어 제목>` + 리스트형 본문 + `Co-Authored-By` 트레일러.
type: feat, fix, refactor, chore, docs, style, test, perf, ci, build, revert, init, remove, rename, hotfix.

## 더 읽을 것

- `CLAUDE.md` - 부팅 프로토콜, 변경 후 자동 규칙, 코드 지도, 하네스 상세
- `docs/brief.md` - 왜/무엇 SSOT · `docs/writing-guide.md` - 문서 규칙
- `docs/agent-workflow.md` - 위임·예산·검증·통합 계약
- `docs/domain-contract.md` - 업무 불변조건·기준 예시·unknown
