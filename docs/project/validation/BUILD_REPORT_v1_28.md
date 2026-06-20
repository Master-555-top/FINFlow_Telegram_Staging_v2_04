# Build Report — v1.28

## Commands

```bash
npm install --ignore-scripts
npx tsc --noEmit
NEXT_TELEMETRY_DISABLED=1 npx next build
```

## Result

- `npm install --ignore-scripts`: passed
- `npx tsc --noEmit`: passed
- `next build`: passed
- static route `/`: generated
- ZIP integrity test: passed

## Note

Next.js still prints a workspace-root warning because `/mnt/data` contains multiple lockfiles during artifact building. This is not a TypeScript or application build failure.
