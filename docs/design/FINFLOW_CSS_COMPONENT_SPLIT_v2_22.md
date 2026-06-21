# FINFlow v2.22 — CSS and Component Split

Date: 2026-06-21

Goal:
- Reduce code bulk safely without changing product behavior.
- Keep the ecosystem stable while moving toward a cleaner design system.

Changes:
- `app/finflow-ui-overrides.css` now contains v2.18.1+ feature overrides, so `app/globals.css` is less overloaded.
- `src/components/ui/CockpitCards.tsx` centralizes shared cockpit cards: metric tile, finance tile, progress bar, shift bar, allocation row.
- `DayCoreDashboard.tsx` imports these shared cards instead of keeping all local UI atoms inside one file.

Preserved:
- Day cockpit.
- Sleep → Day → Work bridge.
- Telegram safe-area behavior.
- AppIcon extraction from v2.21.
- All storage keys and safety decisions.

Next safe cleanup:
- Split `DailyQuickInputPanel.tsx` into smaller modules.
- Move more shared cards from Sleep/System into `src/components/ui`.
- Gradually move feature CSS into grouped files imported from root layout.
