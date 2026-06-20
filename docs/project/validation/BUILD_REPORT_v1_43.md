# Build Report — v1.43

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

Next.js may print a workspace-root warning in `/mnt/data` because the artifact environment contains multiple lockfiles. This is not an application failure.
