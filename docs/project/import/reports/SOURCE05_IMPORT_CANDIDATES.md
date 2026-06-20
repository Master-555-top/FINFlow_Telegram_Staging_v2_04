# SOURCE 05 — Import Candidates

Version: v1.23

## Import-ready only after review

### Taxi / income
Candidate sources:
- `Вставленный текст(14).txt`
- `Вставленный текст(3).txt`

Target modules:
- shifts;
- orders;
- taxi zones/time analytics;
- gross/net plan-fact;
- weekly/monthly taxi KPI.

Required review:
- de-duplicate overlapping messages;
- confirm dates;
- confirm whether amounts are gross or net;
- confirm if costs were already subtracted.

### Expenses
Candidate sources:
- `Вставленный текст(4).txt`
- `Вставленный текст(5).txt`
- `Вставленный текст(13).txt`

Target modules:
- expenses;
- categories;
- daily spending timeline;
- monthly category summary.

Required review:
- category confidence;
- duplicate detection;
- date correction;
- merchant normalization;
- distinguish food/products/car/work/girlfriend/misc.

### Finance model / goals
Candidate source:
- `Вставленный текст(15).txt`

Target modules:
- settings;
- obligation templates;
- funds;
- allocation engine;
- daily planner defaults.

Confirmed values:
- 11,000 ₽ gross daily taxi target;
- 8,500 ₽ net daily target;
- 59,500 ₽ net weekly target;
- 212,500 ₽ net monthly target;
- 45,000 ₽ car payment by 6th;
- 15,000 ₽ bank/bankruptcy payment by 15th;
- car repair/suspension goal about 50,000 ₽.

### AI / development protocol
Candidate source:
- `Вставленный текст(12).txt`

Target:
- development protocol;
- agent prompt;
- release checklist;
- anti-regression rules.

### Bank PDF
Candidate source:
- `Чаплыгин Дмитрий Сергеевич.pdf`

Status:
- private-only;
- review-only;
- not final accounting until transaction classification is approved.

## Not import data, only reference

- `README.md`
- `PROJECT_MEMORY.md`
- `DECISIONS.md`
- `CORE_REQUIREMENTS.md`
- `FEATURE_MAP.md`
- `FULL_EDITING_SPEC.md`
- `IMPORT_PLAN.md`
- `INTEGRITY_AUDIT.md`
- `REGRESSION_CHECKLIST.md`
- UI screenshots and old static exports
