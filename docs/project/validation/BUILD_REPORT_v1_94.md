# Build Report — v1.94

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
- `npm audit --audit-level=moderate`: passed.
- audit result: `0 vulnerabilities` if audit passed.

## Safety

Cloud apply rollback snapshot is local-only and does not write to Supabase.
