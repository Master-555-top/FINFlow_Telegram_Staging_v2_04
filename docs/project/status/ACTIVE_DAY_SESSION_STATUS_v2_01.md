# Active Day Session Status — v2.01

Date: 2026-06-20

Status: implemented.

## User-facing result

Daily Mode now has an Active Day Session block:

- current active date/day id;
- latest closed day information;
- close current day and start a new day;
- restore latest rollover transition.

## Readiness impact

- Local mini app / Day Core improved.
- Daily local use improved.
- Telegram Mini App staging can be the next step.

## Remaining Telegram work

- Build deploy-safe package.
- Configure Vercel/hosting env vars.
- Configure BotFather mini app URL.
- Verify Telegram initData route in real Telegram client.
- Run Supabase readiness and cloud save/load acceptance tests.
