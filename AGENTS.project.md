# Project instructions

Use pstack on every non-trivial change to this app. Source: https://github.com/cursor/plugins/tree/main/pstack

The sandbox has no Cursor slash commands and no Comment Sicko agent. Apply the rules below directly. `AGENTS.md` still wins on preview, port, auth, and deploy.

## Before editing

- Name the data shape and the one module that owns it.
- Match the task to one playbook. Investigation is read-only. A bug fix needs a repro first. A feature starts from the named shape. A refactor preserves behavior.
- Delete dead code before adding code.
- Do not add a validator, wrapper, or abstraction that removes no branch.

## While editing

- Parse `unknown` once, at the boundary (`localStorage`, URL, network). Trust the type after that.
- No `as` cast. No `any`. A type guard must check the claim it names.
- Prefer a non-empty tuple or a discriminant over an optional bag and a "should never happen" throw.
- No narration comments. A comment survives only for a platform constraint this repo cannot change.
- One rule lives in one function. Call it. Do not copy the condition.
- UI copy states a real value from that function. Do not hardcode a second duration, price, or count.

## Before saying it is done

- Prove the changed behavior with a test or a browser check against the running app. A green proxy is not proof.
- `npm run typecheck` passes. If product code changed, `npm run build` passes too.
- Replies stay short. One sentence per thought. No em dash. No colon used as a mid-sentence connector. No "happy to help".
