# Build Report — v1.93

## Commands

```bash
npm ci --ignore-scripts
npm run lint
npm run build
npm audit --audit-level=moderate
```

## Result

- `npm ci --ignore-scripts`: passed earlier in v1.93 flow.
- Initial `npm run lint`: found missing `cloudRestoreDiff` memo after UI insertion.
- Fix applied: added `cloudRestoreDiff` memo in `CloudDaySyncPanel`.
- Final `npm run lint`: passed.
- `npm run build`: passed.
- `npm audit --audit-level=moderate`: passed.
- audit result: `0 vulnerabilities` if audit passed.

## Safety

Cloud restore preview diff is local-only and does not write to Supabase.
