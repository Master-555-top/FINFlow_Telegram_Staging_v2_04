# Audit — v2.05 System Menu UX

## Anti-regression review

Preserved:
- v2.04.1 Vercel install hotfix and `.npmrc` behavior.
- v2.04 Telegram Device Test.
- v2.03 Telegram staging runbook.
- v2.02 static shell and server-only Telegram/Supabase routes.
- v2.01 active day rollover.
- v2.00 daily live-state.
- v1.95 cloud save preflight backup gate.
- local backup/restore and conflict wizard.

Rejected/avoided:
- No rewrite of DailyQuickInputPanel.
- No removal of System panels.
- No cloud write enablement.
- No introduction of secrets into client code.

## UX decision

System panels must stay grouped by task. Future panels should be attached to one of the System sections or a new section, not appended blindly to the main System feed.
