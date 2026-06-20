# SOURCE 05 — Conflicts and Locked Decisions

Version: v1.23

## Locked decisions

1. Source 05 is a context/import source, not the new project base.
2. Current working package stays the base; Source 05 adds requirements and import candidates.
3. v2.0 UI Safe remains the visual base.
4. Day Core remains the central product object.
5. Import of old history must go through review queue.
6. Full editing, soft delete, restore, export and audit log are mandatory.
7. Smart allocation is required; equal splitting is insufficient.
8. Raw private data stays private.

## Potential conflicts

### Duplicate taxi histories
`Вставленный текст(3).txt` and `Вставленный текст(14).txt` contain overlapping taxi/income material.

Resolution:
- use import batch IDs;
- de-duplicate by date/time/amount/order text;
- require review before import.

### Gross vs net ambiguity
Some historical taxi amounts may be gross, some net, and some may already subtract fuel/commission.

Resolution:
- store `amount_type` as gross/net/unknown;
- require manual confirmation for unknown;
- preserve original raw text reference.

### Expense category ambiguity
Old expense text can mix food, car, work, girlfriend, misc, games and transfers.

Resolution:
- parser suggests category;
- user approves/edits;
- AI should explain confidence.

### Bank data vs chat logs
Bank PDF data may conflict with manually logged expenses/income.

Resolution:
- bank transactions are candidates;
- manual/project logs are also candidates;
- final record should reference source and review decision.

### Public package vs private package
The working package may include private raw data for continuity, but deployment/public packages must exclude it.

Resolution:
- keep private package separate;
- add public-safe packaging step later.

## Anti-regression reminder

Before coding:
- check DECISIONS.md;
- check REGRESSION_CHECKLIST.md;
- preserve Day Core;
- do not remove current UI;
- do not overwrite user context;
- test after every change.
