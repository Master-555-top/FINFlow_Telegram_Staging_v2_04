# FinFlow — Unified Design System (v2.17 baseline)

Author: Claude (reviewer/dev). Purpose: one visual language for every tab, so the app stops
looking "stitched from two different apps". This is the contract both contributors (Claude +
the GPT/Codex build tool) should follow so global UI work stops diverging on each merge.

Grounded in the already-premium tabs (Система, Сон) + the owner's reference board (Image 3:
"deep purple / cosmic · минимум текста · версия сверху · детали внутри · one screen = one idea").

---

## 0. The core problem this solves

Two visual languages currently coexist:
- **Premium (good):** Система, Сон — cosmic deep-navy/purple, glass cards, one focal element.
- **Legacy (cluttered):** День, Деньги, Работа, Фонды, AI — long stacked panels, dev strips in
  the product view (e.g. the «Live-state» banner), weak hierarchy. День renders ~11,500px tall.

Goal: bring the 5 legacy tabs up to the premium language; don't redesign the premium ones.

## 1. Tokens — ONE canonical set (fix the duplication first)

`globals.css :root` currently defines several tokens **twice** with conflicting values
(`--ff-panel`, `--ff-cyan`, `--ff-violet`, `--ff-blue`, `--ff-magenta`). Collapse to one set;
the second (cosmic) definitions are the ones the premium tabs actually use:

```
--ink:        #04071b      /* page base */
--ink-2:      #091438
--panel:      rgba(18,26,63,.78)
--panel-2:    rgba(25,28,72,.62)
--line:       rgba(185,198,255,.16)
--line-bright:rgba(158,134,255,.34)
--text:       rgba(255,255,255,.96)
--soft:       rgba(216,218,246,.66)
--faint:      rgba(216,218,246,.42)
--violet:     #8c5cff   --violet-2:#6d4bff
--blue:       #6288ff   --cyan:#40d8ff   --magenta:#df5cff
--green:      #43e6a0   --amber:#ffb34d
--r-card:28px  --r-tile:20px  --r-pill:999px
```

Page background (every screen, fixed): pink orb top-left + cyan orb top-right + a large violet
orb lower-centre + the deep-navy gradient. The violet orb MUST have empty space to show through
— it is the signature, and it disappears when cards fill the screen top to bottom.

## 2. Shared components (build once, use on every tab)

1. **Header** — bold 30px title left, version pill right. Version is the ONLY chrome up top.
2. **Segmented control** — pill group; active = violet gradient. (Sleep uses Обзор/Сейчас/История;
   Day can use План/Смена/Вечер; etc.)
3. **Hero card** — one per tab. Big number (~52px, −2.5px tracking) + optional progress ring +
   one sub-line. This is the single focal element.
4. **Stat tile row** — 3 across, calm/low-weight glass; label + value. Colour-code only the value
   (green = good, cyan = neutral-accent) — never the whole tile.
5. **Decision card** — one bold gradient card with a corner glow (the AI advice / key action).
6. **Soft list row** — subtle glass row `label … value / ›` for progressive disclosure.
7. **Bottom nav** — 7 tabs (День/Деньги/Работа/Фонды/Сон/AI/Система), active in white + violet dot.
8. **Badge** — pill: blue / green / amber / magenta tones (already standardised in Sleep history).
9. **Input form** — the owner-approved "Новая ночь / Редактор" form pattern (date с/на, times,
   live preview + badge, save/cancel). Reuse this exact pattern for any data entry.

## 3. Layout rules (the "единый" discipline)

- **One screen = one idea.** First screen of every tab = header + segments + ONE hero +
  at most 2–3 cards. Everything else goes one level down (a segment, a `›` row, or an expander).
- **No dev/diagnostic chrome in product tabs.** The «Live-state», sync timestamps, readiness
  strips, etc. move to Система → QA. (Data is relocated, never deleted.)
- **Let the orb breathe** — keep vertical space so the background glow is visible (see prototype).
- **Version always top-right**, derived from one source (see §5), never hand-typed per screen.
- **Minimal text.** Labels short; long explanations live inside the card the user opened, not on
  the overview.

## 4. Per-tab target (one hero each)

| Tab | Hero | Then |
|-----|------|------|
| День | Осталось добить ₽ + day ring | decision card · 3 stats · Вечер/Бензин rows |
| Деньги | Текущий баланс / свободно | obligations (6-е,15-е) · funds split |
| Работа | Смена сегодня (₽ / часы) | quick-flow entry · last orders |
| Фонды | Всего накоплено | per-fund progress rows |
| Сон | (done) live session / остаток | (done) |
| AI | one current recommendation | history of advices |
| Система | (done) Neo tiles | (done) |

Reference: `finflow_day_unified.html` (shipped) renders the День target at 390×844.

## 5. Kill the recurring drifts (process)

- **Version**: stop hand-typing `dayCoreModel.version` and `SYSTEM_UI_VERSION`. Derive the
  displayed version from `package.json` `version` at build time (or a single exported constant
  imported everywhere). It has drifted back to `v2.02` on **every** recent merge — a derived
  value cannot drift.
- **Tokens/components**: this file + the shared components are the source of truth. New work
  should reference them, not re-introduce parallel token sets or one-off card styles.
- **Owner-approved patterns are locked** (the sleep input form; security/no-secrets rules;
  static home route; `private_raw_data` never deployed). Don't silently revert these on merge.

## 6. Suggested order of work

1. Collapse tokens to the canonical set (§1) — pure cleanup, no visual change to premium tabs.
2. Extract the shared components (§2) into one place.
3. Convert legacy tabs one at a time: **День → Деньги → Работа → Фонды → AI**, each verified
   against the one-hero rule and by screenshot, without touching the underlying logic.
4. Relocate dev strips to Система → QA.
5. Wire the derived-version fix (§5).
