# Build Report — v1.90

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

## Merge validation

- current v1.89 package used as base;
- Codex v1.87 package analyzed;
- useful Codex hardening merged selectively;
- Codex `private_raw_data` excluded;
- newer v1.88/v1.89 safety layers preserved.

## Packaging note

`.next`, `node_modules`, `.npm-cache`, `tsconfig.tsbuildinfo`, `private_raw_data`, raw bank files and private uploaded archives are excluded from ZIP.
