# ERROR LOG SYSTEM SPEC

## Purpose
FinFlow must contain an internal error log so the user can send exact errors during development and later track app reliability.

## Log entry fields
- id
- timestamp
- level: info/warn/error/fatal
- screen/module
- message
- stack trace
- user action before error
- app version
- status: open/reviewed/fixed/ignored

## MVP
- ErrorBoundary catches UI errors.
- DevErrorLogPanel displays entries.
- Button to add test log.
- No sensitive data in logs.

## Later
- Persist logs to Supabase.
- Export logs.
- Link errors to changelog/fixes.
