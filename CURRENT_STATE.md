# CURRENT STATE — v2.26

Current safe base: v2.26 History/System Data Foundation.

Main state:
- Bottom nav hardened for Telegram/iPhone safe-area.
- Sleep history now follows Year → Month → Day → Record.
- Sleep editor supports Russian date text input and ISO normalization.
- System now has Data section: Storage + Reset MVP.
- DailyQuickInput history/rollover/cloud restore actions moved to a dedicated hook.
- Latest screenshot showed v2.22; user must deploy v2.26 deploy-safe and may need Telegram cache busting.

Next recommended version:
- v2.27 — build unified History engine for all sections, with exact period filters inside nested data records.

# CURRENT STATE — v2.25

Current safe base: v2.25 DailyQuickInput Action Handlers Split.

Status:
- v2.24 live-state/persistence hook is preserved.
- v2.25 extracts action handler groups from DailyQuickInputPanel.
- DailyQuickInputPanel is smaller and less mixed: UI remains there; records/day edit actions moved into hooks.
- Sleep → Day → Work bridge remains active.
- Telegram safe-area remains active.
- Deploy-safe remains private-clean.

Next recommended step:
- v2.26: extract history/rollover/cloud restore actions from DailyQuickInputPanel after Telegram smoke test.
