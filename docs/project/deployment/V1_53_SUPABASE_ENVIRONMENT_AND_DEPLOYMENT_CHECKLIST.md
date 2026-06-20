# v1.53 — Supabase Environment & Deployment Checklist

## Goal

Before connecting FINFlow to real Supabase persistence, deployment must be checked step by step.

This checklist protects:
- personal financial data;
- bank import candidates;
- Telegram identity;
- Supabase service role key;
- project ownership/IP;
- local fallback.

## 1. Required environment variables

### Frontend-safe

These can be exposed to browser when needed:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Server-only

These must never be exposed to frontend:

```text
TELEGRAM_BOT_TOKEN
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
```

## 2. Vercel setup checklist

- [ ] Create Vercel project from private repository.
- [ ] Confirm repository is private.
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL`.
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Add `TELEGRAM_BOT_TOKEN` as server env.
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` only if server route truly needs it.
- [ ] Ensure no `.env` file is committed.
- [ ] Ensure `private_raw_data/` is not committed.
- [ ] Ensure raw bank PDFs are not committed.
- [ ] Ensure raw chat exports are not committed.

## 3. Supabase setup checklist

- [ ] Create Supabase project.
- [ ] Apply `supabase/schema_v1_48_records_bank_review.sql` in SQL editor or migration tool.
- [ ] Verify all RLS policies are enabled.
- [ ] Test that user A cannot read user B data.
- [ ] Confirm `finflow_bank_candidates` stores only redacted candidates.
- [ ] Do not upload raw bank statement PDF to public storage.
- [ ] Do not upload raw private transaction CSV to public table.

## 4. Telegram Mini App checklist

- [ ] Bot created in BotFather.
- [ ] Mini App URL points to Vercel deployment.
- [ ] `Telegram.WebApp.initData` is sent to `/api/telegram/verify`.
- [ ] Server route validates hash.
- [ ] Server route checks `auth_date`.
- [ ] Profile resolver runs only after validation passes.

## 5. Security tests before production persistence

- [ ] Build passes.
- [ ] `/api/telegram/verify` rejects missing initData.
- [ ] `/api/telegram/verify` rejects invalid hash.
- [ ] `/api/telegram/verify` rejects expired auth_date.
- [ ] Service role key is not visible in browser bundle.
- [ ] Private files are absent from GitHub.
- [ ] Private files are absent from Vercel deployment output.
- [ ] RLS blocks cross-user access.

## 6. Deployment rule

Do not enable real Supabase writes until:

```text
Telegram initData verification + profile resolver + RLS tests pass.
```

## 7. Rollback rule

If production persistence behaves incorrectly:

1. Disable cloud write feature flag.
2. Keep local fallback.
3. Export local records.
4. Inspect RLS/profile mapping.
5. Fix server route before re-enabling cloud sync.

## 8. Never upload publicly

```text
private_raw_data/
.env
.env.local
bank PDFs
raw transaction CSV
raw chat export archives
Telegram bot token
Supabase service_role key
OpenAI key
```
