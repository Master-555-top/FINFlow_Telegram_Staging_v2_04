# Validation Plan — v2.05 System Menu Polish

## Automated checks

- `npm install --ignore-scripts --no-audit`
- `npm run lint`
- `npm run build`
- `npm audit --audit-level=moderate`
- `node scripts/create-telegram-staging-package.mjs`
- zip integrity tests for deploy-safe and MASTER packages

## Manual checks

1. Open FINFlow in browser/Vercel staging.
2. Tap `Система` in bottom navigation.
3. Confirm System hub appears with buttons: Telegram, Аудит, Cloud, Backup, Deploy, Dev.
4. Confirm default section is Telegram and Real Telegram Device Test is visible without deep scrolling.
5. Tap every System section and confirm the old panel content is still available.
6. Confirm no cloud write button is newly enabled.
7. In Telegram, open BotFather-connected Mini App and run System → Telegram → Real Telegram Device Test.
