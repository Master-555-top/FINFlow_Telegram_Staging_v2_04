# CURRENT STATE — v2.41

Current focus: n8n Automation Contract + API Safety.

The project remains in global system-building mode. v2.41 defines the automation layer without enabling unsafe external calls: webhook contracts, dry-run payloads, workflow safety gates and credentials policy are now visible in System → Cloud → n8n.

Current honest readiness:
- Strong fully working mini app: about 74% complete by weighted delivery model.
- Remaining: about 26%.
- Realistic remaining scope: about 3–5 large build packages, not counting final UI polish.

Added in v2.41:
- n8n Automation Contract model.
- System → Cloud → n8n panel.
- `/api/automation/n8n/dry-run` endpoint.
- Dry-run payloads for daily report / morning brief / backup / import / cloud / weekly review.
- Credentials policy and forbidden payload key list.

Locked decisions preserved:
- No standalone global History screen.
- History remains inside each section.
- System remains storage/reset/backup/cloud/QA/tools.
- Sleep remains `Обзор / История / Редактор`.
- Sleep storage keys remain unchanged.
- Visual baseline screens remain locked: Sleep History list, Sleep weekly chart, System grid.
- Cloud writes remain safe-off until backup + RLS + conflict tests pass.
- External n8n calls remain blocked until private staging/auth/redaction are ready.
- MASTER/private/secrets never go to GitHub/Vercel/public cloud.

Next recommended build:
- v2.42 — Real Local Apply UI + Import/Template Confirm: turn preview/apply/rollback foundations into a practical working UI for daily use.
