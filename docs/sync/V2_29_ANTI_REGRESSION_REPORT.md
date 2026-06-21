# v2.29 Anti-Regression Report

Base: v2.28 Section-Scoped History.

Changed only local Sleep UI composition and CSS.

Preserved:
- Sleep live `Лёг / Встал`.
- Wake decision options.
- Morning work planner.
- History edit/delete/export.
- Manual editor date parsing.
- Sleep stats component, now embedded inside `Обзор`.
- Existing localStorage keys.
- System data storage/reset logic.
- Section-scoped history decision.

Checks required before release:
- TypeScript lint.
- Next build.
- npm audit.
- Deploy-safe forbidden scan.
- Archive existence and checksum.
