# Security Scan — v1.79

No secrets added.

Cloud sync is gated by:
- server-side Telegram `initData` verification;
- `FINFLOW_ENABLE_CLOUD_SYNC=true`;
- `FINFLOW_ENABLE_SUPABASE_WRITES=true`;
- server-only `SUPABASE_SERVICE_ROLE_KEY`.

The browser does not receive the service role key.

Cloud loading remains preview-first: loaded cloud data is not silently applied.

No bank raw PDFs/CSVs, private_raw_data, `.env.local`, tokens, runtime logs, `.next` or `node_modules` are included.
