# Build Report — v1.54

## Commands

```bash
npm install --ignore-scripts
npx tsc --noEmit
NEXT_TELEMETRY_DISABLED=1 npx next build
```

## Result

- `npm install --ignore-scripts`: passed using local npm cache after environment cache permission issue.
- `npx tsc --noEmit`: passed.
- `next build`: passed.
- static route `/`: generated.
- dynamic route `/api/telegram/verify`: generated.
- dynamic route `/api/supabase/readiness`: generated.
- ZIP integrity test: passed.

## Note

Next.js may print a workspace-root warning in `/mnt/data` because the artifact environment contains multiple lockfiles. This is not an application failure.

TypeScript 6 deprecation warning for `baseUrl` was handled by adding `"ignoreDeprecations": "6.0"` to `tsconfig.json` to preserve current alias structure without refactoring.
