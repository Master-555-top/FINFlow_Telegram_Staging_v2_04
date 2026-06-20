# Combined Transcript Processing Protocol

Version: v1.19  
Updated: 2026-06-17 11:30

## Purpose

The user clarified that user messages and assistant messages will not be separated into two separate files.

Therefore the source intake process must support mixed/raw chat transcripts where both sides are in one document.

## New rule

Do not require the user to split messages manually.

A combined transcript is acceptable.

## Processing approach

When a combined transcript is uploaded, process it as one source and extract several layers:

1. User requirements.
2. User corrections.
3. User priorities.
4. User frustrations and anti-regression warnings.
5. Assistant commitments.
6. Assistant assumptions.
7. Assistant mistakes or hallucinations.
8. Decisions that were accepted.
9. Decisions that were corrected or rejected.
10. App mechanics and data models.
11. Financial/taxi/car/time/relationship data.
12. Required project file updates.

## Speaker identification

If the transcript has clear markers, use them:

- user;
- assistant;
- ChatGPT;
- system;
- tool;
- file upload.

If markers are unclear, infer carefully from context and mark uncertain parts as:

```text
speaker_uncertain
```

Do not invent certainty.

## Priority rule

User statements and corrections have higher priority than assistant interpretations.

Assistant messages are still important because they may contain:

- commitments;
- architecture drafts;
- generated specs;
- implementation notes;
- incorrect assumptions to fix.

## Output for combined transcript

For each combined transcript source, create:

```text
docs/project/import/source_reviews/SOURCE_REVIEW_<number>_<name>.md
```

The review must include:

- extracted user requirements;
- extracted assistant commitments;
- confirmed decisions;
- corrected/obsolete decisions;
- possible mistakes;
- missing items;
- affected modules;
- files updated;
- integrity check.

## Queue adjustment

The previous separate plan:

```text
Source 02 — all user messages
Source 03 — all assistant messages
```

is replaced by:

```text
Source 02 — combined transcript / mixed user + assistant messages
```

After that, the sequence continues with:

```text
Source 03 — bank document
Source 04 — previous chats / Telegram channel documents
```

## No-loss guarantee

Merging user and assistant messages into one file must not reduce audit quality.

Instead of relying on pre-separated documents, the review must explicitly extract both:

- what the user actually requested;
- what the assistant promised or assumed.
