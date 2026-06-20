# Build Report — v1.96

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
- `npm run build`: passed through `scripts/build-next.mjs`.
- `npm audit --audit-level=moderate`: passed.
- audit result: 0 vulnerabilities.

## Build fix

Normal Next build showed worker/page-data instability in this environment.

Fixed with:
- `app/page.tsx` dynamic route;
- `next.config.js` one-worker build configuration;
- `scripts/build-next.mjs` using Next compile + generate modes.
