# FINFlow v2.41 — n8n Automation Contract + API Safety

## Purpose

v2.41 introduces the safe automation contract layer for future n8n integration. It does **not** connect to an external n8n instance yet. The goal is to define webhook payloads, redaction rules, workflow boundaries, dry-run endpoints, and blocked production gates before any external automation can touch FINFlow data.

## Added

- `src/lib/automation/n8nAutomationContract.ts`
  - workflow registry;
  - dry-run payload builder;
  - credentials policy;
  - forbidden payload keys;
  - production blockers.
- `src/components/automation/N8nAutomationPanel.tsx`
  - System → Cloud → n8n panel;
  - workflow contract cards;
  - dry-run selector;
  - credentials policy and remaining production checklist.
- `app/api/automation/n8n/dry-run/route.ts`
  - server-side dry-run endpoint;
  - returns compact payload only;
  - never returns env values, webhook URL, tokens, Telegram initData/hash, private vault, private raw data.

## Workflows defined

1. `daily_morning_brief` — daily morning planning summary.
2. `daily_evening_report` — evening money/work/day report.
3. `backup_snapshot` — backup preflight signal.
4. `historical_import_review` — import review summary only.
5. `cloud_sync_watch` — blocked until Supabase/RLS/backup smoke test.
6. `weekly_money_work_review` — planned weekly aggregates.

## Locked safety gates

- n8n cannot perform blind writes into FINFlow.
- n8n cannot auto-apply historical imports.
- n8n cannot auto-resolve cloud conflicts.
- Payloads must be versioned and dedupe-safe.
- Daily/weekly reports must use compact aggregates by default.
- Raw order addresses, bank raw data, screenshots, private notes, private vault, env values and secrets are excluded until a separate consent/redaction layer exists.
- External webhook calls are blocked in this build.

## Why external n8n is still not enabled

The project still needs:

- private n8n instance / webhook URL in server-only env;
- webhook auth/callback verification;
- redaction/consent screen for sensitive payloads;
- 7-day dry-run on real local data;
- Supabase staging smoke test for cloud-sensitive workflows;
- backup workflow connected to cloud preflight/rollback.

## Anti-regression

Do not move `FINFLOW_PRIVATE_N8N_WEBHOOK_URL` or any future automation secret into `NEXT_PUBLIC_` variables. Do not expose webhook URLs in client payloads or UI. Do not allow n8n to write directly to local/Supabase data without preview → confirm → rollback.
