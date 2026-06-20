# Build Report — v1.27

Updated: 2026-06-17 22:54

## Commands

```bash
npm install --ignore-scripts
npx tsc --noEmit
NEXT_TELEMETRY_DISABLED=1 npx next build
```

## Result

- npm install: passed
- TypeScript: passed
- Next.js build: passed
- Static route `/`: generated

## Notes

Next.js showed the known workspace-root warning caused by multiple lockfiles under `/mnt/data`. This is not an application build failure.
