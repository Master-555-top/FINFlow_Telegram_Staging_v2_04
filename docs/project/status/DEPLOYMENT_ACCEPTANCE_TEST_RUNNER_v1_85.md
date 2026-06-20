# Deployment Acceptance Test Runner Draft — v1.85

## Purpose

After v1.84 added verification handoff export, v1.85 adds a safe acceptance test runner draft.

## Safe automated checks

- `/api/deployment/readiness`
- `/api/supabase/readiness`
- `/api/telegram/verify` only when Telegram Mini App initData exists
- `/api/sync/day` GET read-preview only when Telegram initData exists

## Manual guarded checks

- cloud save;
- two-session conflict test;
- RLS/security review.

These remain manual because automatic writes could risk overwriting real data or creating false confidence before infrastructure is ready.
