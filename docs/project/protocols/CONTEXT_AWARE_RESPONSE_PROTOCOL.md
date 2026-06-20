# Context-Aware Response Protocol

Version: v1.10  
Updated: 2026-06-15 04:18

## Purpose

Every FinFlow answer, design decision, code change, documentation update, and Codex prompt must be interpreted through the full project context, not only the latest user message.

FinFlow is a long-term personal operating system for money, taxi work, vehicle costs, time, goals, AI decisions, and life planning. Therefore isolated answers are unsafe.

## Mandatory context sources

Before important project decisions, the assistant must consider:

1. Current conversation context.
2. Uploaded source files and historical data.
3. `docs/project/memory/PROJECT_MEMORY.md`.
4. `docs/project/protocols/LOCKED_DECISIONS.md`.
5. `docs/project/protocols/AI_DEVELOPMENT_PROTOCOL.md`.
6. `docs/project/protocols/ANTI_REGRESSION_CHECKLIST.md`.
7. `docs/project/protocols/PROJECT_UPDATE_PROTOCOL.md`.
8. `CHANGELOG_LATEST.md`.
9. Current archive/package version.
10. Existing implementation state.

## Required behavior

When the user writes casually, for example:

- "add this"
- "improve this"
- "change this"
- "this should work differently"

the assistant must translate it into:

1. Requirement.
2. Affected module.
3. Dependencies.
4. Risk of regression.
5. Required document updates.
6. Smallest safe implementation step.
7. Verification checklist.

## Anti-isolation rule

Do not answer FinFlow/project questions as isolated one-off requests.

Every response should preserve:

- Day Core.
- Live reactive system.
- Full editing/export.
- Smart allocation.
- Real current balance.
- Taxi operating cost model.
- Time/calendar realism.
- n8n AI architecture.
- Error log system.
- Private raw data protection.
- Incremental change protocol.

## Output rule

If a new important requirement appears, update project files without waiting for the user to remind you.

Required update targets may include:

- Project memory.
- Locked decisions.
- Changelog.
- Requirements coverage audit.
- Current state.
- Data/spec files.
- Backlog.

## v1.11 strengthening — mandatory file-backed context

For FinFlow, the assistant must not rely only on visible memory or quick recall. Before important decisions, it must explicitly use the project files as the source of truth.

Mandatory behavior:
- check current project version;
- check memory/spec/protocol/changelog files when relevant;
- update files when a new important decision appears;
- avoid "from memory only" answers for project-critical requirements;
- if a previous value is corrected, mark the old value obsolete in project files.

This rule exists because the project contains many layered requirements and old decisions must not disappear when new ones are added.

## v1.14 required response integrity check

Every important FinFlow response should include a "Проверка целостности" section covering:
- what was added;
- what remains unchanged;
- whether anything was deleted;
- files/modules affected;
- next verification step.

This is mandatory because the user wants continuous confirmation that nothing is lost across many changes.
