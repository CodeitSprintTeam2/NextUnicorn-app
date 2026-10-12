# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.


## 일하는 방식

- 이슈를 맡으면 코드를 쓰기 전에 계획부터 보여준다. 바꿀 파일과 순서, 파일마다 할 일을 적고, 「진행해주세요」를 들은 뒤에 코드를 쓴다.
- 명세가 정하지 않은 것은 추측하지 말고 계획에 질문으로 적는다.
- 명세 파일은 고쳐달라는 말을 듣기 전에는 고치지 않는다. 명세를 바꿔야 할 것 같으면 먼저 묻는다.
- 명세를 고칠 때 결정 기록의 이유와 「다시 볼 때」는 사람이 말한 것만 적는다. 말하지 않았으면 비워두고 묻는다.
- 터미널 명령은 직접 실행하지 않는다. 패키지 설치, 프로젝트 만들기, 데이터베이스 켜기처럼 터미널에서 칠 명령은 사람이 칠 수 있게 순서대로 적는다.

## 하지 않는 것

- 요청과 응답의 필드 이름을 계약과 다르게 쓰거나, 계약에 없는 필드를 더하지 않는다.
- 실패 문구를 README 실패 목록과 다르게 쓰지 않는다.
- README 범위에서 「이번엔 안 함」에 있는 기능은 만들지 않는다.
- `.env` 파일을 열거나 출력하지 않는다.

## 끝나면 알려줄 것

- 바꾼 파일 목록
- 사람이 칠 명령(순서대로)
- 확인에 쓸 `api.http` 요청과 그 요청이 받아야 할 상태 코드, 또는 화면에서 확인할 것
