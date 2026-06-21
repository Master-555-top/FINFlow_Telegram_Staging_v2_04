# FINFlow v2.33 — Visual Baseline Lock

Date: 2026-06-22

This lock is based on the user's latest Telegram screenshots and explicit feedback.

## Locked as ideal for now

The following screens from the previous working visual direction are treated as the current baseline:

1. Sleep History list
   - Compact date groups.
   - One clear sleep record card per night.
   - Edit/delete actions visible.
   - Status badges are short and meaningful.
   - No extra explanatory text.

2. Sleep 7-day chart
   - Weekly view from Monday to Sunday.
   - Day labels: ПН, ВТ, СР, ЧТ, ПТ, СБ, ВС.
   - Dates are secondary, lowercase and visually calm.
   - No duplicated header such as “Последние дни / 8 записей”.
   - Chart is alive and data-driven, but visually concise.

3. System grid
   - Telegram / Audit / Data / Cloud / Backup / QA / Dev tiles.
   - Large readable icons.
   - Brief labels.
   - No overloaded text.
   - Current dark glass/purple visual direction stays.

## Rule

Do not globally redesign these screens while working on data, import, Supabase, templates or n8n. Future UI work should use these screenshots as the compactness and clarity benchmark.

## Allowed changes

- Functional fixes.
- Data synchronization fixes.
- Safe-area fixes for Telegram.
- Small spacing/readability improvements when they preserve the same visual language.

## Not allowed without explicit user request

- New visual concept direction.
- Replacing the current dark/glass/cosmic style.
- Large text-heavy cards that duplicate data from History/Editor/System tools.
- Moving section history into a global History screen.
