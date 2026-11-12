---
title: ADR-0001 하네스 엔지니어링 도입
created: 2026-11-12
updated: 2026-11-12
status: accepted
---

# ADR-0001: 하네스 엔지니어링 도입

## 상태

Accepted: 운영 원칙 채택. 개별 보호 장치의 설치·작동을 보증하는 상태는 아니다.
실제 적용 상태는 `../agent-workflow.md`에 기록한다.

## 맥락

AI 에이전트와의 협업에서 지시문(프롬프트)만으로는 규칙이 지켜지지 않는다. 세션이 바뀌면 잊히고,
컨텍스트가 길어지면 무시된다. 선행 프로젝트들에서 반복 확인된 문제:
`.env` 를 직접 고치거나, `git add -A` 로 민감 파일이 staging 되거나, 검증 없이 산출물이 나가는 사고.

## 결정

규칙을 **실행 가능한 제약과 검사로 연결**한다 (Constrain, Verify, Correct):

- **Hooks** (`scripts/hooks/` + `.claude/settings.json`): 기본 2종 `env-guard`/`git-add-guard`는
  2026-10-27 감사에서 공식 stdin 입력을 읽지 않아 exit 0으로 통과하는 결함이 재현됐다.
  입력 계약 수정과 허용/차단 회귀 검사 전에는 보호 장치로 신뢰하지 않는다. format은 스택별로 작성한다.
- **Settings** (`.claude/settings.json`): 에이전트 툴의 외부 동기화를 프로젝트 단위로 끈다. Claude Code Remote Control
  (`disableRemoteControl: true`, `remoteControlAtStartup: false`). 해당 기능 설정이며 모든 외부 전송·서버 보존을 막는 보장은 아니다.
  사용자 설정(`~/.claude/settings.json`)에도 같은 값을 두되, 새 PC 에서 잊어도 프로젝트 파일이 막도록 양쪽에 둔다.
- **Commands** (`.claude/commands/`): 리뷰 체크리스트를 슬래시 커맨드로 - `/review-security`, `/deploy-check`.
  결과는 Critical/Warning/Info 로 분류하고 파일:라인을 인용하게 한다.
- **ADR** (`docs/adr/`): 구조적 결정은 근거와 함께 박제해 다음 세션/에이전트가 재논쟁하지 않게 한다.
- **문서 프로세스**: current-state는 현재 인수인계, session-log는 과거 이력이다. 최신 1~2개 블록부터 읽는다.
- **도메인 판정**: domain-contract에 업무 불변조건, 승인된 예시, 근거와 unknown을 기록한다.
- **팀 운영**: agent-workflow에 위임 범위, 결과 증거, 예산, 중단 조건을 기록한다. 작은 과제는 단일 에이전트로 처리한다.
- **검증과 관측**: 빠른/통합/릴리스 검사를 나누고 실제 실행 증거를 남긴다. usage는 실행기가 관측한 값을 쓰며 리드·worker·재시도를 합산한다. 실행기가 없으면 예산이 강제된다고 주장하지 않는다.

## 근거

- 지침·훅 파일의 존재와 실제 차단은 다르다. 강제 여부는 재현 검사와 실행 로그로 확인한다.
- 대안(전부 프롬프트에 의존)은 선행 프로젝트에서 이미 실패 사례가 축적됨.

## 결과

- (+) 근거 추적과 재현, 도구 교체와 인수인계를 개선한다.
- (-) 훅·검사·어댑터 유지보수가 필요하다. Claude 훅은 Codex/Antigravity에 자동 적용되지 않는다.
- (-) 도메인 규칙이 틀리면 테스트도 틀린 결과를 통과시킬 수 있다. 사용자 또는 업무 담당자의 수용 기준 확인이 필요하다.
