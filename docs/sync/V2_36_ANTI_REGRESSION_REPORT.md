# FINFlow v2.36 Anti-Regression Report

## Scope

Build package: Templates Engine.

## Preserved

- No global UI redesign.
- User-approved visual baseline remains intact.
- Sleep tabs remain Обзор / История / Редактор.
- Sleep localStorage keys remain unchanged.
- History remains section-scoped.
- System grid remains the main System entry style.
- Cloud writes remain safe-off.
- Deploy-safe excludes private vault, raw data, MASTER docs, node_modules, .next and env secrets.

## Added

- Templates Engine registry.
- System → Data → Шаблоны subsection.
- Compact template cards in Money/Work context.
- Template readiness in mini app progress model.

## Not added yet

- Real recurring application.
- Supabase template writes.
- n8n template automation.
- Exact sync from old template documents.

## Result

Safe to continue to v2.37: Recurring + Import Apply.
