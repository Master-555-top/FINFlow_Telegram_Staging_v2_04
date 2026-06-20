# INCREMENTAL FILE AND CODE UPDATE PROTOCOL

Version: v1.8
Status: LOCKED / mandatory

## Core rule

FinFlow project files and code must not be recreated from scratch on every change. Every improvement must be integrated into the current system harmoniously.

## What this means

When a new requirement, correction, idea, mechanic, or bugfix appears:

1. Identify the affected module.
2. Check existing files and decisions.
3. Update only the necessary sections/files.
4. Preserve existing architecture, UI, data model, and working behavior unless a deliberate migration is approved.
5. Update project memory, changelog, requirements coverage, and relevant specs.
6. Run the anti-regression checklist.

## Forbidden by default

- Rewriting the whole project because of one new feature.
- Replacing existing docs with a shorter summary that loses decisions.
- Deleting old context, protocols, changelog, requirements, data specs, or normalized historical candidates.
- Resetting the app structure without a written migration plan.
- Changing locked decisions without explicitly marking them as updated.

## Allowed

- Local targeted edits.
- Adding a new spec file when a new module is genuinely introduced.
- Updating existing files by appending or modifying only relevant sections.
- Creating migrations when the data model changes.
- Creating versioned archives after meaningful updates.

## Required update path

For every meaningful project change, update as needed:

- `docs/project/memory/PROJECT_MEMORY.md`
- `docs/project/state/CURRENT_STATE.md`
- `CHANGELOG_LATEST.md`
- `docs/project/audit/REQUIREMENTS_COVERAGE_AUDIT.md`
- module-specific spec files under `docs/project/data/`
- protocol files under `docs/project/protocols/` if the rule/process changed
- backlog files if the idea is not implemented yet

## Code work rule

When editing code:

1. State the exact goal.
2. State files to change.
3. State files not to touch.
4. Make the smallest safe change.
5. Show changed files.
6. Run or instruct checks.
7. Confirm no existing systems broke.

## Documentation work rule

When editing docs:

1. Do not rewrite the whole documentation bundle unless explicitly requested.
2. Preserve all prior locked decisions.
3. Append dated timeline entries for new decisions.
4. Keep source-of-truth files synchronized.
5. Never move private raw data into public/project export folders.

## Private data reminder

`private_raw_data` is local-only. It must not be uploaded to GitHub, cloud storage, Vercel, public archives, or Supabase Storage without a separate explicit security decision.

