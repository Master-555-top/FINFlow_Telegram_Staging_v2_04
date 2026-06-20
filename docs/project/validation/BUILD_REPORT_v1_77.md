# Build Report — v1.77 Codex Sync

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
- audit after Supabase pin adjustment: `0 vulnerabilities`.
- static route `/`: generated.
- dynamic route `/api/telegram/verify`: generated.
- dynamic route `/api/supabase/readiness`: generated.
- dynamic route `/api/assistant/dry-run`: generated.
- ZIP integrity test: passed.

## Merge-specific checks

- Codex package was based on v1.72.
- Latest active branch was v1.76.
- v1.73-v1.76 code files are preserved.
- Codex stabilization fixes are merged selectively.
- No wholesale replacement with older Codex branch.
- `.next`, `node_modules`, and `.npm-cache` are excluded from ZIP.
