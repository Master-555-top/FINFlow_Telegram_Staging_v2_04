# Cloud Sync Verification Export / Handoff Report — v1.84

## Purpose

After v1.83, verification checklist progress could be saved locally.

v1.84 adds safe export/handoff:
- Markdown report;
- JSON report;
- copy button;
- secret-safe note sanitization;
- progress summary;
- next unfinished stage;
- per-stage status and notes.

## Safety

The export intentionally excludes real secrets.

Notes are sanitized for obvious token-like strings and secret-key names. Users still must not paste real secrets into checklist notes.
