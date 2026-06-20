# Security Scan — v1.85

No secrets added.

Acceptance runner stores only safe statuses/messages in browser localStorage. It does not store tokens.

Automated checks are read-only/safe:
- readiness routes;
- Telegram verify with Telegram-provided initData;
- cloud read-preview GET.

Cloud save, conflict test and RLS review remain manual guarded.
