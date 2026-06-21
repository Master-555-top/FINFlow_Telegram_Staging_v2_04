# FINFlow Context System

Version: v1.39  
Updated: 2026-06-18T00:57:00Z

## Purpose

This folder exists so FINFlow development does not depend only on chat memory.

The project must preserve:
- user messages and requirements
- assistant responses and implementation decisions
- locked product rules
- context sources and what was extracted from them
- open questions
- decisions that must guide future edits
- continuity rules for every future version

## Core rule

Every future development step must update the context files before packaging a new ZIP.

## Files

- `00_CONTEXT_INDEX.md` — map of context files and how to use them.
- `01_CHAT_CHRONICLE.md` — chronological log of user requests and assistant actions from available context.
- `02_USER_REQUIREMENTS_LEDGER.md` — normalized user requirements.
- `03_ASSISTANT_RESPONSE_DECISION_LOG.md` — assistant decisions, answers, implementations and package history.
- `04_CONTEXT_UPDATE_PROTOCOL.md` — mandatory protocol for updating context after every turn.
- `05_LIVE_REALITY_REGISTER.md` — which data/features are real, local, demo, imported, or not implemented.
- `06_OPEN_CONTEXT_GAPS.md` — what still needs exact source text or confirmation.
- `07_NEXT_STEP_GUARDRAILS.md` — rules to check before each next feature.
- `08_CONTEXT_SOURCE_MAP.md` — source files and archives that fed project context.

## Important limitation

The project can only store exact historic messages if they are available in the current chat context or uploaded chat export files.  
For unavailable old messages, this system stores a structured reconstruction and a requirement-level summary rather than pretending to have an exact verbatim transcript.

Going forward, each new user request and assistant response summary must be appended to this context system.
