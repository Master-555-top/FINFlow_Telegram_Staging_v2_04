# Review Actions Layer Architecture — v1.25

## Purpose

v1.25 turns Import Review Queue from a passive list into a controlled action layer.

Old data from chats, banks, taxi logs, expenses, goals and notes must never go directly into FinFlow calculations. Every item remains an `ImportCandidate` until an explicit review action changes its state.

## Supported actions

- `approve` — marks a safe candidate as approved.
- `reject` — rejects a candidate and prevents it from affecting calculations.
- `edit_before_apply` — changes title, amount, category, or day before use.
- `merge_duplicate` — marks a candidate as merged with another candidate.
- `attach_to_day` — links a candidate to a Day Core date without applying it yet.
- `create_audit_log_event` — records a note without changing the candidate.

## Safety rules

Sensitive or high-risk candidates are not auto-applied.

Approved candidates can affect Day Core only when:

1. status is `approved`;
2. risk is not `sensitive` or `high`;
3. a `proposedDayId` exists;
4. entity type is known.

## Audit rule

Every action creates an `ImportReviewAuditEvent` with:

- candidate id;
- action;
- actor;
- before and after status;
- timestamp;
- note;
- `sensitiveDataIncluded: false`.

Raw bank lines, personal messages, unredacted PDF fragments and private source files must not be copied into audit logs.

## v1.25 implementation

Added:

- `src/lib/import-review/importReviewActions.ts`
- interactive actions in `src/components/import-review/ImportReviewQueuePanel.tsx`
- UI styles for candidate selection, action buttons, editor and audit preview

This is a local/demo layer only. It does not write to a database yet.
