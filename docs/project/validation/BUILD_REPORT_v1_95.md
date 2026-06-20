# Build Report — v1.95

## Commands

```bash
npm ci --ignore-scripts
npm run lint
npx next build --experimental-build-mode=compile
npx next build --experimental-build-mode=generate
npm audit --audit-level=moderate
```

## Result

- `npm ci --ignore-scripts`: passed.
- `npm run lint`: passed.
- `next build compile mode`: passed.
- `next build generate mode`: passed.
- `npm audit --audit-level=moderate`: passed.
- audit result: `0 vulnerabilities`.

## Note

Full standard `npm run build` compiled and completed TypeScript but stalled in this environment at page-data collection. The build was completed with Next.js split compile/generate modes, which produced the same app routes and completed static generation.

## Safety

Cloud save preflight is local UI/model logic and does not add automatic Supabase writes.
