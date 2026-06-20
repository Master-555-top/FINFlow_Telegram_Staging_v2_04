# SOURCE REVIEW 05 — Semantic Review

Version: v1.23  
Created: 2026-06-17 15:44:14  
Source: `private_raw_data/source_intake/SOURCE_05_context_archive_original.7z`  
Status: semantic review completed; no production import performed.

## 1. Executive summary

Source 05 is not a replacement for the current project base. It is a context archive with historical requirements, old UI/code artifacts, project rules, taxi-income history, expense logs, financial goals, and AI-development protocols.

The correct merge strategy remains:

```text
FINFlow current working base v1.22
+ Source 05 semantic requirements and import candidates
= FINFlow working package v1.23
```

No application code was changed in this step. This package only adds the semantic review, import-readiness documents, and project-memory updates needed before safe implementation.

## 2. Strongly confirmed project meaning

FINFlow must be treated as a personal operating system, not as a simple expense tracker.

Core chain:

```text
current time
→ sleep / food / errands / meetings / car condition
→ available taxi work window
→ gross taxi forecast
→ work costs: fuel, Drivee/platform commission, oil/car wear reserve
→ real net
→ obligations and funds
→ daily decision
→ AI recommendation
```

The main product object is the Day Core. Week and month are management layers above the day:
- Day: action, survival, work decision, immediate allocation.
- Week: correction, recovery, discipline, weak-zone detection.
- Month: obligations, goals, growth, relocation, car repair and stability.

## 3. Source-by-source semantic findings

| Source | Semantic role | Import / implementation meaning |
|---|---|---|
| `README.md` | Canonical UI/project overview and v2.0 UI Safe inheritance | Preserve UI base; use as design guardrail, not as raw data |
| `PROJECT_MEMORY.md` | Project memory and purpose | Keep as high-priority memory anchor |
| `DECISIONS.md` | Locked decisions and anti-regression rules | Must be checked before each feature change |
| `CORE_REQUIREMENTS.md` | Core product definition | Confirms OS-of-life concept |
| `FEATURE_MAP.md` | Feature areas and navigation | Use for module map: Today, Work, Expenses, Funds, AI |
| `FULL_EDITING_SPEC.md` | Editing/soft-delete requirements | Every entity must support edit/delete/restore/history |
| `IMPORT_PLAN.md` | Historical import strategy | Import must go through review queue, not blind insert |
| `INTEGRITY_AUDIT.md` | Preservation rules | Prevents repeated regression and context loss |
| `REGRESSION_CHECKLIST.md` | Release checklist | Must be run after every package/version |
| `Вставленный текст(3).txt` | Taxi / Indriver context, goals, order logic | Candidate source for taxi shift/order import review |
| `Вставленный текст(4).txt` | Expense context | Candidate source for expense categorization review |
| `Вставленный текст(5).txt` | Daily expense patterns | Candidate source for expense import review |
| `Вставленный текст(12).txt` | AI development protocol | Must become part of dev process and agent instructions |
| `Вставленный текст(13).txt` | Expense history | Candidate source for historical expense review queue |
| `Вставленный текст(14).txt` | Taxi income and shift analytics | Candidate source for shift/order history review queue |
| `Вставленный текст(15).txt` | Financial model and targets | Confirms gross/net targets and fund logic |

## 4. Requirements extracted from Source 05

### 4.1 Day Core

FINFlow must always know:
- current date and current time;
- remaining realistic day window;
- sleep/food/rest status;
- errands and meetings;
- taxi shift status;
- gross already earned today;
- real work costs;
- real net available;
- obligations due soon;
- fund gaps and deadlines;
- whether the daily plan is realistic.

If the target is impossible, FINFlow must not pretend everything is fine. It should switch to Recovery or Emergency planning.

### 4.2 Taxi income and work model

Required fields:
- shift start/end;
- active time;
- full shift time;
- order count;
- gross amount;
- platform/Drivee commission;
- fuel cost;
- estimated car wear reserve;
- real net;
- hourly KPI;
- zone/time analysis;
- daily and weekly plan/fact.

Important rule: the user thinks in gross taxi turnover, so FINFlow must show gross and net together.

### 4.3 Expenses

Expense import must support:
- category;
- source text;
- date;
- amount;
- confidence;
- review status;
- manual correction;
- history/audit log.

Main expense groups from Source 05:
- work costs: fuel, platform commission;
- food/products;
- car;
- girlfriend/meetings;
- obligations;
- misc;
- entertainment/games when present.

### 4.4 Funds and goals

Funds must support deadlines and smart allocation, not equal tiny splits by default.

Confirmed high-priority funds/goals:
- car payment: 45,000 ₽ by every 6th;
- bankruptcy/bank: 15,000 ₽ by every 15th;
- working fund;
- safety cushion;
- car repair/suspension: about 50,000 ₽;
- relocation/flight: 300,000 ₽;
- girlfriend birthday: 50,000 ₽;
- girlfriend work base: 10,000 ₽;
- meetings/flexible life fund.

Allocation modes required:
- Even;
- Priority;
- Recovery;
- Emergency;
- Buffer Build;
- Goal Sprint.

### 4.5 AI decision layer

FINFlow AI should answer:
- how much to work today gross and net;
- when to start;
- whether the plan is realistic;
- what to pay/fund first;
- what to postpone;
- how to fit errands, repair, food, sleep and girlfriend meetings;
- how to recover if the day started late.

The AI must not overwrite locked decisions or invent financial data. It should explain assumptions.

### 4.6 Import and review queue

Historical data must not be blindly inserted into the live model.

Required import states:
- raw;
- parsed;
- categorized;
- needs_review;
- approved;
- imported;
- rejected;
- archived.

Each imported item should preserve:
- source file;
- original text snippet or reference;
- parser confidence;
- manual correction;
- audit history.

### 4.7 Editing, export, and audit

Every major entity must support:
- create;
- edit;
- soft delete;
- restore;
- archive;
- export to CSV/JSON/PDF or equivalent;
- audit log.

Entities:
- shifts;
- orders;
- income entries;
- expenses;
- funds;
- goals;
- obligations;
- tasks;
- calendar items;
- AI plans/recommendations;
- imports.

### 4.8 Security and IP protection

Source 05 contains sensitive context and may contain raw personal material. It must stay private.

Rules:
- `private_raw_data` must never be pushed to GitHub or public archives.
- `.env`, tokens, database URLs, raw bank statements, raw chat exports, and source archives stay out of public repositories.
- Use `.gitignore` and release packaging that excludes private raw data for public/deployment versions.
- If secrets are found in old files, rotate them rather than preserving them as usable secrets.
- Backend/business logic and AI prompts should be protected where possible.

## 5. Conflicts and locked decisions

The following decisions are locked after this review:

1. Source 05 does not replace v1.22. It enriches it.
2. v2.0 UI Safe remains the visual base.
3. New logic must not break existing Day Core, Time Core, dashboard, or editing/export expectations.
4. Historical data import requires review queue.
5. Equal daily splitting across all funds is not enough; smart priority allocation is required.
6. Day targets must respect reality. If 8,500 ₽ net is impossible today, FINFlow must say so and switch mode.
7. Raw private data is private and must remain excluded from public/deployment packages.

## 6. Next implementation path

### Phase 1 — completed in v1.23
Semantic review of Source 05 and requirement extraction.

### Phase 2 — next
Create Import Review Queue model and UI shell:
- import batches;
- import items;
- confidence;
- approve/reject/edit;
- source references.

### Phase 3
Build Day Core input model:
- current money;
- current time;
- tasks/meetings;
- taxi status;
- gross/net plan;
- today forecast.

### Phase 4
Build Allocation Engine:
- obligations;
- funds;
- deadlines;
- smart modes;
- emergency/recovery logic.

### Phase 5
Build AI Planner:
- daily recommendation;
- explanations;
- assumptions;
- warning flags.

### Phase 6
Harden full editing/export/audit.

## 7. v1.23 conclusion

Source 05 is now semantically reviewed and ready to be transformed into implementation tasks. The next actual coding step should be Import Review Queue + Day Core input model, not another archive analysis.
