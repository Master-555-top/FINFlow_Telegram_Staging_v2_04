# Source Intake & Canonicalization Protocol

Version: v1.17  
Updated: 2026-06-15 08:19

## Purpose

Before continuing direct application development, the project will perform a controlled source intake and canonization phase.

The user will provide source files one by one:
1. Archive of the current chat.
2. All user messages as a text document.
3. All assistant messages as a text document.
4. Bank document.
5. Documents from previous chats and Telegram channels.

Each file must be analyzed separately, cleaned, classified, summarized, and integrated into the existing project memory without overwriting current decisions.

## Core rule

Sources are not dumped blindly into the project.

Every source must pass through:

```text
receive
→ identify
→ privacy classification
→ full read / extraction
→ source inventory record
→ requirement extraction
→ data extraction
→ contradiction check
→ duplicate check
→ canonical formulation
→ mapping to modules
→ update project docs
→ update changelog
→ integrity check
```

## Source types

### 1. Current chat archive

Purpose:
- reconstruct exact project decision sequence;
- verify what was promised;
- recover missing requirements;
- separate user messages from assistant messages;
- update timeline and source-to-requirement map.

### 2. User messages document

Purpose:
- extract true user requirements;
- extract priorities;
- extract personal constraints;
- extract exact wording and intent;
- detect important casual requirements.

Important:
User messages have higher priority than assistant interpretations.

### 3. Assistant messages document

Purpose:
- identify commitments;
- identify generated architecture;
- find possible hallucinations/incorrect assumptions;
- verify whether assistant promised something that must be added or corrected;
- build accountability log.

### 4. Bank document

Purpose:
- prepare financial import mapping;
- understand real transaction categories;
- build import/review rules;
- prepare privacy-safe normalized format.

Important:
Bank documents are sensitive private raw data.

### 5. Previous chats / Telegram channels

Purpose:
- extract older decisions;
- extract old data models;
- extract financial history;
- extract taxi/shift logic;
- extract mistakes/regressions;
- extract old working ideas.

## Privacy classes

Every source must be tagged:

```text
PUBLIC_SAFE
PROJECT_INTERNAL
PRIVATE_CONTEXT
PRIVATE_FINANCIAL
PRIVATE_SECRETS
THIRD_PARTY_PERSONAL
```

Rules:
- `PRIVATE_FINANCIAL`, `PRIVATE_SECRETS`, and `THIRD_PARTY_PERSONAL` must never be uploaded to GitHub/cloud/public storage.
- Only redacted summaries and normalized safe data may enter ordinary docs.
- Raw files stay in `private_raw_data` only.

## Output per file

For each uploaded source, create/update a report:

```text
docs/project/import/source_reviews/SOURCE_REVIEW_<number>_<short_name>.md
```

Each report must include:

1. Source name.
2. File type.
3. Privacy class.
4. Extraction status.
5. Main contents.
6. Requirements found.
7. Financial data found.
8. App mechanics found.
9. Contradictions with current project.
10. Duplicates already covered.
11. New items to add.
12. Items not added and why.
13. Affected modules.
14. Required document/code changes.
15. Integrity check.

## Canonical project outputs

After processing all sources, update:

- `PROJECT_MEMORY.md`
- `LOCKED_DECISIONS.md`
- `MASTER_REQUIREMENTS_INDEX.md`
- `SOURCE_TO_REQUIREMENT_MAP`
- `LOST_REQUIREMENTS_RECOVERY_REPORT`
- `CHAT_TIMELINE_AND_DECISION_HISTORY.md`
- `CONVERSATION_PROVENANCE_AND_SOURCE_DATES.md`
- `DATA_SOURCES_AND_IMPORT_PLAN.md`
- `FEATURE_BACKLOG.md`
- `CURRENT_STATE.md`
- `CHANGELOG_LATEST.md`

## Coding pause rule

During this source intake phase:

- do not expand app functionality unless required for extraction/import tooling;
- preserve current v1.16 code;
- do not rewrite Foundation;
- only documentation, memory, import plans, and audit files should change unless explicitly approved.

## Completion criteria

Source intake phase is complete only when:

1. All submitted files are listed in source inventory.
2. Each file has a review report.
3. Requirements are deduplicated.
4. Contradictions are resolved or marked.
5. Sensitive/private data is classified.
6. Final canonical requirement map is updated.
7. App implementation backlog is updated.
8. The user approves moving back to coding.

## v1.19 combined transcript rule

The user will not separate user and assistant messages into different files.

This is accepted.

The process now supports mixed combined transcripts. For such files, extract:
- user requirements;
- user corrections;
- assistant commitments;
- assistant assumptions;
- incorrect/obsolete assistant statements;
- final accepted decisions;
- affected app modules.

User corrections have higher priority than assistant-generated text.
