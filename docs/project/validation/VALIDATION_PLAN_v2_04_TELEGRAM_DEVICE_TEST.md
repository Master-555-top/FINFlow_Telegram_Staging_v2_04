# Validation Plan — v2.04 Real Telegram Device Test

## Automated validation

Run:

```bash
npm ci --ignore-scripts --no-audit --prefer-offline
npm run lint
npm run build
npm audit --audit-level=moderate
node scripts/create-telegram-staging-package.mjs
```

## Manual browser validation

1. Open FINFlow in normal browser.
2. Go to `Система`.
3. Confirm Telegram Device Test shows browser/local fallback.
4. Click `обновить диагностику`.
5. Click `запустить safe device checks`.
6. Confirm verify/cloud dry-run are skipped or safe-fail when initData is absent.
7. Confirm readiness APIs return without secret values.

## Manual Telegram validation

1. Deploy the v2.04 deploy-safe package to a private staging URL.
2. Set this URL in BotFather Mini App/Menu Button.
3. Open from real Telegram on phone.
4. Confirm Telegram bridge and initData are detected.
5. Confirm viewport height/stable height are non-zero.
6. Run safe device checks.
7. Confirm `/api/telegram/verify` result.
8. Confirm `/api/deployment/readiness` and `/api/supabase/readiness` do not expose secrets.
9. Confirm cloud read dry-run is GET-only and does not write data.

## Stop conditions

Stop before cloud writes if:

- verify fails for an unclear reason;
- Supabase readiness unexpectedly exposes anything secret;
- `FINFLOW_ENABLE_SUPABASE_WRITES` is true before backup/checklist;
- viewport makes the daily app unusable on phone.
