# Validation Plan — v2.01 Active Day Session

Date: 2026-06-20

## Manual checks

- Add several orders and expenses.
- Click “закрыть день → новый день”.
- Confirm previous day appears in Daily History.
- Confirm new active day has zero records/orders/fuel paid.
- Confirm balances, obligations, funds, templates and fuel settings remain.
- Click restore latest rollover archive.
- Confirm previous day records and state return.
- Switch Day / Money / Work / Funds / AI / System and confirm live-state remains consistent.

## Automated checks

- `npm ci --ignore-scripts --no-audit --prefer-offline`
- `npm run lint`
- `npm run build`
- `npm audit --audit-level=moderate`

## Acceptance

v2.01 is accepted if build passes and the New Day flow is rollback-safe.
