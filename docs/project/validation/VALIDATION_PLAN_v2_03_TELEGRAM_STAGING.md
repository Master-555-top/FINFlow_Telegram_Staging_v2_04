# Validation Plan v2.03 — Telegram Staging

## Automated checks
- `npm ci --ignore-scripts --no-audit --prefer-offline`
- `npm run lint`
- `npm run build`
- `npm audit --audit-level=moderate`
- `node scripts/create-telegram-staging-package.mjs`
- `zip -T` for deploy-safe package and MASTER PRIVATE FULL

## Manual checks
- Deploy-safe package contains no `private_vault`, `private_raw_data`, `.env.local`, `node_modules`, `.next`, `.npm-cache`.
- System tab shows Telegram staging panel.
- Readiness board shows `было → стало`, not only current percentages.
- `/api/deployment/readiness` works after deploy and hides secrets.
- Telegram phone test opens from BotFather Mini App button.
- Cloud writes remain blocked until flags/backups/checklist are ready.
