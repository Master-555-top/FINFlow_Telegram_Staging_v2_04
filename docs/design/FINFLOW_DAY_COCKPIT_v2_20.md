# FINFlow v2.20 — Unified Day Cockpit

Date: 2026-06-21

## Base

Built on v2.19 Sleep → Day → Work bridge. This is not a rewrite and not a Claude rollback.

## Design references

The new `UI Design.zip` was extracted and reviewed. The visual direction used for v2.20:

- premium deep purple / navy background;
- one large hero card per screen;
- short labels, not long dev text;
- soft glass cards, radial glow, rounded iPhone-like surfaces;
- segmented navigation inside the screen;
- status colours are semantic, not decorative.

The archive and contact sheet are stored in MASTER/private context only:

- `private_vault/design_references_v2_20_uploaded_2026_06_21/UI_Design_v2_20.zip`
- `private_vault/design_references_v2_20_uploaded_2026_06_21/contact_sheet.jpg`

## Implemented

- Day tab now has a premium cockpit shell: `План / Смена / Дела`.
- Day now reads sleep history and live sleep session from localStorage.
- Day shows Sleep → Work → Money → Tasks bridge directly on the Day screen.
- Morning bridge cards show wake options without scores.
- Potential gross, safe work hours, task fit and start time are visible on the Day screen.
- v2.20 keeps the same sleep rules: 10h+ remains red oversleep.
- Added root `package-lock.json` for reproducible install.
- Fixed deploy-safe script version drift from old v2.17.2 text.

## Preserved locked decisions

- Sleep storage keys remain v2_17 to avoid losing local history.
- No score system.
- Manual sleep editor remains secondary and editable.
- Live `Лёг / Встал` remains primary for sleep capture.
- `private_vault` and `private_raw_data` remain MASTER-only.
- Deploy-safe is still clean and upload-safe.

## Next

v2.21 should continue with Telegram safe area hardening and split large CSS/components without changing behaviour.
