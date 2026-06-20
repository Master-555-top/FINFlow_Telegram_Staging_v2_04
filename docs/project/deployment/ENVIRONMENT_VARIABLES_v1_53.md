# Environment Variables — v1.53

## Public

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

These may be used in browser code.

## Server-only

```text
TELEGRAM_BOT_TOKEN
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
```

These must never be used in client components or exposed to the browser.

## Feature flags

```text
FINFLOW_ENABLE_SUPABASE_WRITES=false
FINFLOW_ENABLE_BANK_IMPORT=false
```

Use false by default until production auth and RLS are tested.
