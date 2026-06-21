# FINFlow n8n Automation Plan v2.32

## Rule

n8n is not connected before FINFlow has stable canonical data, private Supabase staging and safe API contracts.

## First workflows later

1. Daily summary: День / Деньги / Работа / Сон / Фонды.
2. Backup reminder and export pipeline.
3. Historical import helper: file/text -> preview draft -> manual confirmation.
4. Telegram notification: only summary, never raw secrets.
5. AI reflection: only sanitized section summaries.

## Security rules

- No Telegram bot token or Supabase service role in client bundle.
- n8n credentials must live in n8n credentials/external secrets, not in repo.
- Webhooks must use signed/secret headers.
- Workflows that touch money data start as dry-run.
- Run n8n security audit before production workflows.

## Not now

- No automatic writes to Supabase from n8n until RLS and rollback are tested.
- No direct processing of private raw archives through public cloud.
- No LLM agent workflow with access to secrets until prompt-injection risks are reviewed.
