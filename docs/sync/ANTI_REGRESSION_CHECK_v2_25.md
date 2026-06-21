# FINFlow v2.25 Anti-Regression Check

Protocol used:
1. Start from v2.24, the latest safe base.
2. Extract only action handlers with clear boundaries.
3. Preserve UI props and function names used by JSX.
4. Run TypeScript, production build and npm audit.
5. Generate deploy-safe without private folders or build artifacts.
6. Verify final files exist before sending links.

Locked decisions preserved:
- FINFlow remains a full ecosystem, not a simple finance tracker.
- No private raw data or vault in deploy-safe.
- Sleep >10h remains critical red.
- Sleep storage keys remain stable.
- Telegram safe-area remains active.
- Daily live-state hook from v2.24 remains active.
- Manual editing/export/history flows remain active.
