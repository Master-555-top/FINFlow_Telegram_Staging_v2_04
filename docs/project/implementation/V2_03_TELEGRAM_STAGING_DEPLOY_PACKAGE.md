# v2.03 — Telegram Mini App Staging Deploy Package / BotFather Runbook

## Goal
Prepare FINFlow for the first real Telegram Mini App staging launch without exposing MASTER PRIVATE FULL, private_vault, private_raw_data, or secrets.

## Implemented
- Added `src/lib/deployment/telegramStagingRunbook.ts` as the staging checklist model.
- Added `src/components/deployment/TelegramStagingDeployPanel.tsx` in the System tab.
- Added `scripts/create-telegram-staging-package.mjs`.
- Added `vercel.json` with safe build commands and basic security headers.
- Generated `exports/FINFlow_v3_TELEGRAM_STAGING_DEPLOY_SAFE_v2_03.zip`.
- Updated readiness board to show `было → стало` percentages.
- Updated `.env.example` for Telegram staging env discipline.

## Preserved
- v2.02 static shell/server cleanup.
- v2.01 Active Day Session / New Day rollover.
- v2.00 daily live-state/cross-tab persistence.
- v1.99 deploy-footprint hardening.
- v1.98 Daily Mode Polish.
- v1.97 six-tab navigation.
- v1.95 cloud save preflight and v1.94 rollback safety.

## Anti-regression result
No existing daily flow, backup, cloud preflight, verification checklist, live-state or New Day rollover code was removed. v2.03 adds a staging layer and deploy-safe packaging only.
