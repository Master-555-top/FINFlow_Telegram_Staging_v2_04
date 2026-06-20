# Bank Statement Status — v1.60

## Current source

```text
T-Bank statement
Period: 01.12.2025–06.06.2026
Pages: 105
```

## Extracted candidate rows

```text
Total candidates: 2,766
Expense candidates: 1,631
Income/replenishment candidates: 1,135
Review status: all need manual review
```

## Important

These rows are not final accounting.

They are import/review candidates.

## Current safe flow

```text
Bank PDF
→ extracted/redacted candidates
→ review queue
→ user confirms category/type
→ only then imported into FINFlow records
→ analytics recalculates
```

## Risk

Replenishments/internal transfers may look like income but must not be automatically counted as income.

## Next implementation direction

Improve bank review from sample/paginated preview into real persistence:
- save decisions;
- approve/reject/postpone;
- convert approved candidates to records;
- keep raw bank files private.
