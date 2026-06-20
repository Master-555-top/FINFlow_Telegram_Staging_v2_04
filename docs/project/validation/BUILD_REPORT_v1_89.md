# Build Report — v1.89

## Commands

```bash
npm ci --ignore-scripts
npm run lint
npm run check
npm audit --audit-level=moderate
```

## Result

- `npm ci --ignore-scripts`: passed.
- `npm run lint`: passed.
- `npm run check`: passed.
- `next build`: passed through `npm run check`.
- `npm audit --audit-level=moderate`: passed.
- audit result: `0 vulnerabilities`.
- static route `/`: generated.
- dynamic route `/api/telegram/verify`: generated.
- dynamic route `/api/supabase/readiness`: generated.
- dynamic route `/api/assistant/dry-run`: generated.
- dynamic route `/api/sync/day`: generated.
- dynamic route `/api/deployment/readiness`: generated.
- ZIP integrity test: passed.

## Packaging note

`.next`, `node_modules`, and `.npm-cache` are excluded from ZIP.
