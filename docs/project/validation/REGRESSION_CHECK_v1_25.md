# Regression Check — v1.25

## Checks

- [x] v1.24 package opened successfully.
- [x] Existing Day Core files preserved.
- [x] Existing Import Review Queue model preserved.
- [x] New action layer added as separate module.
- [x] UI uses local state only; no raw private files exposed.
- [x] Build passed with `NEXT_TELEMETRY_DISABLED=1 npx next build`.
- [x] No blind import of old data performed.
- [x] No deletion of source documents.

## Known warning

Next.js workspace-root warning appears because `/mnt/data` contains multiple lockfiles. It is not a project TypeScript/build failure.
