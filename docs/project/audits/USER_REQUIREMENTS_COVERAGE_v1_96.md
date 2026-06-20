# User Requirements Coverage — v1.96

## 100% or near-100% implemented

### Master/private ecosystem structure

Status: `implemented`

- `finflow_app` separated from `private_vault`.
- Codex and Claude source/context preserved.
- MASTER_PRIVATE_DOCS exists.
- Private data is not deleted from the ecosystem.

### Day Core / local daily planning

Status: `usable / mostly implemented`

Implemented:
- money now: cash/card/Drivee/reserved;
- taxi gross/net;
- obligations;
- funds;
- tasks/time costs;
- records;
- templates;
- daily allocation;
- fuel/odometer;
- car maintenance/oil;
- repair fund logic;
- local assistant advice;
- daily decision summary.

### Backup / restore / rollback safety

Status: `strongly implemented`

Implemented:
- local backup;
- local restore;
- restore preview diff;
- browser localStorage backup from Codex;
- cloud restore preview diff;
- cloud apply rollback snapshot;
- cloud save preflight backup gate.

### Project memory / protocol continuity

Status: `implemented`

Implemented:
- changelog;
- current state;
- project memory;
- context ledgers;
- operation ledgers;
- security scans;
- regression checks;
- build reports.

## Partially implemented / needs real-world verification

### Telegram Mini App

Status: `implemented technically, not fully verified in real Telegram`

Done:
- Telegram SDK script;
- Telegram session pill;
- server-side verify route;
- initData validation;
- Telegram/Supabase checklist.

Remaining:
- BotFather Mini App URL;
- real phone launch;
- check initData;
- check profileReady;
- verify UX inside Telegram webview.

### Supabase cloud sync

Status: `implemented foundation, needs real infra verification`

Done:
- server client;
- sync day GET/PUT;
- feature flags;
- revision conflict logic;
- cloud preview;
- apply rollback;
- save preflight.

Remaining:
- create/apply real Supabase migration;
- set env vars;
- enable flags carefully;
- test save/load/conflict/RLS manually.

### Daily UX convenience

Status: `functional but not yet polished`

Done:
- dashboard contains all systems;
- readiness board added;
- quick input exists.

Remaining:
- Daily Mode to hide dev/safety panels;
- Development Mode toggle;
- morning plan flow;
- evening close-day flow;
- mobile spacing/buttons polish.

## Not yet fully implemented

- Real external AI/n8n production bridge.
- Automated encrypted vault handling.
- Final deploy-safe export package separate from MASTER PRIVATE.
- Full RLS penetration/negative tests.
- Real multi-day usage analytics based on actual user data.
