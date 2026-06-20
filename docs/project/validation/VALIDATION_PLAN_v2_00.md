# Validation Plan v2.00 — Daily Persistence / Cross-tab State Hardening

Date: 2026-06-20

## Automated checks

Required before package handoff:

```text
npm ci --ignore-scripts --no-audit --prefer-offline
npm run lint
npm run build
npm audit --audit-level=moderate
zip integrity test
```

## Manual QA checklist

1. Open the app on the Day tab.
2. Add a taxi order.
3. Confirm Day Core totals update without switching tabs.
4. Switch to Work tab.
5. Confirm the order remains visible and totals are still current.
6. Add fuel on Work tab.
7. Switch to Money tab.
8. Confirm net calculation reflects the same active-day state.
9. Open the app in a second browser tab.
10. Add a record in one tab.
11. Confirm the other tab receives the updated live-state snapshot.
12. Confirm System tab cloud/backup panels still receive the current document.
13. Confirm no System/Dev panels appear in the default Day mode.

## Regression checklist

- v1.98 Daily Mode remains focused and uncluttered.
- v1.97 navigation remains functional.
- v1.95 cloud save preflight remains in System flow.
- Legacy localStorage fallback still exists.
- No private_vault/private_raw_data runtime import exists.
