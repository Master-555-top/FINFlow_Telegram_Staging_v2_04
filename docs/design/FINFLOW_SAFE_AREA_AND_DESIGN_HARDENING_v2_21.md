# FINFlow v2.21 — Telegram Safe-Area + Design Hardening

Date: 2026-06-21

## Base

Built from v2.20 Unified Day Cockpit.

## Uploaded design archive

`UI Design.zip` was reviewed as the latest curated visual reference set. It contains 24 images. Main extracted direction:

- dark premium/cosmic surfaces;
- large hero panels and circular progress elements;
- glass cards with controlled glow;
- compact tab/segmented navigation;
- minimal text on first-level screens;
- dense information only inside progressive detail layers;
- strong bottom mobile navigation with safe spacing.

The archive is stored in MASTER/private vault only and must not enter deploy-safe.

## External design/platform constraints used

- Apple Design Resources reinforce using official platform templates, SF-family type direction, and symbol consistency as a baseline for iOS-like layout quality.
- Telegram Mini Apps viewport can change because mobile apps open in a BottomSheet; viewport stability and safe-area data must be respected.
- Next.js recommends keeping CSS modules scoped and global CSS truly global. v2.21 does not migrate all CSS yet, but prepares for safe module extraction.
- WCAG 2.2 target-size guidance uses a 24 CSS px minimum baseline; FINFlow uses larger 44px mobile touch targets for primary app controls.

## Implemented

- Added `useTelegramViewportCss()` to read Telegram viewport/safe-area data and export CSS variables.
- Added robust CSS variables: `--tg-viewport-height`, `--tg-content-safe-bottom`, `--finflow-bottom-nav-space`, etc.
- Hardened bottom navigation for Telegram Mini App safe areas.
- Increased scroll padding and content bottom padding to avoid button overlap.
- Calmed active/pressed interaction states.
- Extracted shared `AppIcon` into `src/components/ui/AppIcon.tsx`, reducing `DashboardShell` size and preparing the design-system component layer.
- Updated visible versions to v2.21.

## Preserved

- Sleep B + D logic, no score points.
- Sleep >10h remains red critical oversleep.
- Live `Лёг / Встал`, manual editor, history, statistics.
- Sleep → Day → Work bridge.
- Premium System UI.
- Claude v2.17.2 duration fix.
- localStorage keys for sleep history.
- private/deploy-safe separation.

## Next

v2.22 should start CSS modularization by extracting Day/Sleep/System CSS blocks into component-scoped modules or smaller feature CSS files while preserving behavior.
