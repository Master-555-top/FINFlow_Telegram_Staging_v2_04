# Build Report — v1.92

## Commands

```bash
npm ci --ignore-scripts
npm run lint
npm run build
npm audit --audit-level=moderate
```

## Result

- `npm ci --ignore-scripts`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `next build`: passed.
- `npm audit --audit-level=moderate`: passed.
- audit result: `0 vulnerabilities`.

## Routes

```text
/
/_not-found
/api/assistant/dry-run
/api/deployment/readiness
/api/supabase/readiness
/api/sync/day
/api/telegram/verify
```
