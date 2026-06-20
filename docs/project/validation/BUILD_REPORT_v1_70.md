# Build Report — v1.70

## Commands

```bash
npm install --ignore-scripts
npx tsc --noEmit
NEXT_TELEMETRY_DISABLED=1 npx next build
```

## Result

- `npm install --ignore-scripts`: passed earlier in v1.70 flow.
- `npx tsc --noEmit`: passed.
- `next build`: passed after rerun following technical interrupt.
- static route `/`: generated.
- dynamic route `/api/telegram/verify`: generated.
- dynamic route `/api/supabase/readiness`: generated.
- dynamic route `/api/assistant/dry-run`: generated.
- ZIP integrity test: passed.

## Note

Next.js may print a workspace-root warning in `/mnt/data` because the artifact environment contains multiple lockfiles. This is not an application failure.

Packaging note: `.next`, `node_modules`, and `.npm-cache` are excluded from the ZIP.
