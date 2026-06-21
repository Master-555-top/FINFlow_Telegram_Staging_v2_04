# FINFlow v2.26 Anti-Regression Report

## Preserved systems

- Day Core calculations, funds, obligations, tasks, taxi orders, fuel, bank review.
- Sleep live session, manual editor, history, statistics, wake planner.
- Sleep → Day → Work potential earnings bridge.
- Daily live-state and cross-tab sync.
- Rollover archive and last rollover restore.
- Cloud sync panels and local backup panels.
- Telegram viewport/safe-area hook.
- File delivery protocol.

## Dependency check

- New `useDailyQuickInputHistoryActions` uses existing daily history, active day rollover and cloud day document types.
- New System data panels use localStorage registry and do not create a second independent database.
- Date parser normalizes display dates into ISO strings before records are saved.

## Risk notes

- System reset MVP removes whole localStorage blocks within selected category. It creates one undo backup before removing keys.
- Fine-grained period reset inside nested JSON records is intentionally deferred to avoid data corruption.
- User screenshot showed v2.22; after deploy, Telegram cache may need cache-busting with `?v=226`.

## Verification

- `npm run lint` passed.
- `npm run build` passed.
- `npm audit --audit-level=moderate` returned 0 vulnerabilities.
