# v1.39 — Project Context Memory Expansion

## User requirement

The user explicitly required that the project must constantly preserve chat context and concrete requirements in project files.

The project must:
- save user messages as available
- save assistant responses/actions as summaries
- rely on these context files in future work
- update them with every new message and response
- expand context files instead of depending only on chat memory

## Implemented

Added `docs/project/context/`:

- `README_CONTEXT_SYSTEM.md`
- `00_CONTEXT_INDEX.md`
- `01_CHAT_CHRONICLE.md`
- `02_USER_REQUIREMENTS_LEDGER.md`
- `03_ASSISTANT_RESPONSE_DECISION_LOG.md`
- `04_CONTEXT_UPDATE_PROTOCOL.md`
- `05_LIVE_REALITY_REGISTER.md`
- `06_OPEN_CONTEXT_GAPS.md`
- `07_NEXT_STEP_GUARDRAILS.md`
- `08_CONTEXT_SOURCE_MAP.md`

## Locked future rule

Every future version must update the context system before packaging.

## Honesty rule

Exact verbatim old messages must only be claimed when exact source text is available.
Otherwise, store structured reconstructed summaries.
