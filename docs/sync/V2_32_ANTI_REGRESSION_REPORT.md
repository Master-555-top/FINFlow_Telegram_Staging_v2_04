# V2.32 Anti-regression Report — Global Data Backbone

## Preserved

- Sleep tabs remain `Обзор / История / Редактор`.
- Sleep localStorage keys remain unchanged.
- Section-scoped history remains locked; no global History screen added.
- System remains tools/storage/reset/backup/cloud/QA.
- Existing deploy-safe/private separation preserved.

## Added safely

- Strong mini app readiness model.
- Canonical data/entity map.
- Historical import draft parser without automatic writes.
- Data Backbone panel inside System → Data.
- Draft Supabase migration with RLS pattern, not automatically applied.
- n8n plan as documentation only; no credentials or workflows added.

## Risks intentionally avoided

- No cloud write enabled.
- No real Supabase secrets added.
- No private files moved into deploy-safe.
- No global visual redesign.
- No direct destructive historical import.

## Verification target

Run:

```bash
npm run lint
npm run build
npm audit --audit-level=moderate
```
