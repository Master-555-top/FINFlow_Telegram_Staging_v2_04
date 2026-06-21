# 04 — Context Update Protocol

## Mandatory rule

Before packaging every future version, update project context files.

## Required updates each turn/version

1. Append user message or user intent to `01_CHAT_CHRONICLE.md`.
2. Append assistant response/action summary to `01_CHAT_CHRONICLE.md`.
3. If the user created or clarified a requirement, update `02_USER_REQUIREMENTS_LEDGER.md`.
4. If a decision was made, update `03_ASSISTANT_RESPONSE_DECISION_LOG.md`.
5. If reality/live/demo status changed, update `05_LIVE_REALITY_REGISTER.md`.
6. If a new uncertainty appears, update `06_OPEN_CONTEXT_GAPS.md`.
7. Update `CHANGELOG_LATEST.md`.
8. Update `docs/project/state/CURRENT_STATE.md`.
9. Update `docs/project/memory/PROJECT_MEMORY.md`.
10. Include validation and security files.

## Verbatim vs summary rule

Use exact user text when available in the current context.

If exact old text is not available, write:
- "reconstructed from available context"
- "summary, not verbatim"

Never claim a reconstructed summary is an exact quote.

## Assistant response logging

Do not store hidden reasoning.

Store:
- final answer summary
- implementation action
- files changed
- validation result
- next step

## Privacy rule

Do not paste raw bank data, private raw archives, `.env`, tokens or secrets into context files.

For private data, store only:
- source name
- processing status
- safe extracted requirements or aggregates
- review status

## Anti-regression check

Before any code edit, read:
- context ledger
- current state
- changelog
- security scan
- regression checklist

After any code edit:
- run TypeScript/build
- create manifest
- create security scan
- create build report
- package ZIP

## v1.40 strengthened protocol

For every future version, context update is not optional.

Minimum required context update:
- append exact current user message when available;
- append assistant final action summary;
- update requirement ledger if any requirement changed;
- update live/demo status if implementation status changed;
- update source recheck register if source files are used;
- update current state and project memory.

Before saying a feature is complete, confirm:
- context files updated;
- protocols checked;
- changelog updated;
- build/validation completed.

## v1.46 transcript ledger extension

Every future context update must also update:

```text
docs/project/context/13_FULL_CHAT_TRANSCRIPT_LEDGER.md
```

Minimum:
- exact current user message;
- assistant action/final answer summary;
- implementation impact;
- locked rule if any.
