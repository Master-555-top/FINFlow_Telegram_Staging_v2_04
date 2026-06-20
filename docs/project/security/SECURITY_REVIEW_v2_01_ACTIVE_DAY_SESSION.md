# Security Review — v2.01 Active Day Session

Date: 2026-06-20

## Scope

Reviewed v2.01 Active Day Session / New Day Roll-over.

## Result

No secrets, tokens, raw bank files, private vault imports or public cloud writes were added.

## Data handling

- Rollover archive is browser-local localStorage only.
- Daily history remains browser-local.
- No automatic Supabase writes are introduced.
- No Telegram initData, bot token or Supabase service role secret is exposed.

## Risks

- localStorage is not encrypted; it is acceptable for local MVP/testing but not enough for production sensitive data.
- Telegram production usage still requires server-side auth checks, HTTPS hosting, env-only secrets and acceptance tests.

## Locked rule

`private_vault` and `private_raw_data` must never be uploaded to GitHub public, Vercel root, Supabase Storage or public cloud.
