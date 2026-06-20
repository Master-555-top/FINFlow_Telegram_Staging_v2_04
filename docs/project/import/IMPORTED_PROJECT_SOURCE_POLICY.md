# Imported Project Source Policy

Version: v1.13  
Updated: 2026-06-15 04:30

## Purpose

FinFlow has many source layers:

1. Current active conversation.
2. Previous ChatGPT conversations.
3. Uploaded project files.
4. Uploaded text exports.
5. Telegram-style financial records.
6. Bank PDF statements.
7. Generated project documentation.
8. Current code archive.
9. External share links.

This policy defines how to treat previous/imported project materials.

## Rule

Previous imported files and project conversations must be part of project memory.

They may contain:

- old requirements;
- working features;
- mistakes to avoid;
- architectural decisions;
- user preferences;
- prompts;
- historical calculations;
- UX decisions;
- data examples;
- parser rules;
- old code behavior.

## Extraction process

For each imported project source:

1. Identify source type.
2. Record file/link/date if known.
3. Extract decisions.
4. Extract unresolved questions.
5. Extract bugs/regressions.
6. Extract data examples.
7. Extract any "do not break" rules.
8. Update relevant project docs.
9. Update changelog.
10. Mark source as reviewed / partially reviewed / pending.

## Status labels

Use:

```text
raw_received
indexed
partially_reviewed
fully_reviewed
normalized
pending_user_review
approved_into_master_spec
```

## Do not mix with private raw data

Imported sources may contain personal data, tokens, bank details, or private context.

If sensitive, store only in `private_raw_data` locally and never upload to GitHub/cloud/public archives.

## Required project files to update after extraction

- PROJECT_MEMORY.md
- LOCKED_DECISIONS.md
- REQUIREMENTS_COVERAGE_AUDIT.md
- CHAT_TIMELINE_AND_DECISION_HISTORY.md
- DATA_SOURCES_AND_IMPORT_PLAN.md
- FEATURE_BACKLOG.md
- CHANGELOG_LATEST.md
