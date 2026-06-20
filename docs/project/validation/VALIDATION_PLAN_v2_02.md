# Validation Plan — v2.02 Claude Audit Sync

Date: 2026-06-20

## Required checks

1. `npm ci --ignore-scripts --no-audit --prefer-offline`
2. `npm run lint`
3. `npm run build`
4. `npm audit --audit-level=moderate`
5. Confirm no active imports reference removed dead Supabase draft files.
6. Confirm final zip excludes `node_modules`, `.next`, `.npm-cache`, and `tsconfig.tsbuildinfo`.
7. Confirm final zip integrity.

## Functional smoke checklist

- App shell renders.
- Six tabs remain present.
- Day tab keeps morning plan / work quick-flow / evening summary.
- v2.00 shared live-state code remains present.
- v2.01 New Day rollover code remains present.
- System tab keeps cloud, backup, deployment, verification and acceptance panels.
