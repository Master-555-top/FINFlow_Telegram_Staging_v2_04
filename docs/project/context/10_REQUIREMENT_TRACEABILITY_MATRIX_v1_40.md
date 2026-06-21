# 10 — Requirement Traceability Matrix v1.40

| Requirement | Evidence source | Current implementation status | Next protection action |
|---|---|---|---|
| Project must preserve and update context memory | Current user message + v1.39 context system | Context files exist, v1.40 hardens them | Update context on every version before packaging |
| Reanalyze chat from earliest available message and all files | SOURCE_01 current chat text + SOURCE_05 archive reviews | Deep reanalysis report added | Do not answer from memory only when files exist |
| All base data editable, analytics derived | User v1.36 clarification | Editable daily data + funds/obligations UI | Extend to record-level income/expense/order editing |
| Clean shift income = gross - commission - fuel | User clarification before v1.30 | Net model and labels implemented | Protect formula from regression |
| Demo/local values must not be called real production data | v1.31 audit + live reality register | Reality register exists | Update whenever storage/data status changes |
| Historical sources must go through review | IMPORT_PLAN + SOURCE05 semantic review | Import review queue and docs exist | No blind import |
| Security-first: private_raw_data stays private | Security protocols + repeated user requirement | Security scans and context rules exist | Never publish raw/private data |
| Day Core is central | SOURCE05 semantic review + project memory | Day Core dashboard, quick input, history, allocation exist | Do not fragment into isolated modules |
| Allocation after clean calculation | User goals and v1.37 | Allocation panel exists | Make records/funds production-persistent later |
