# Security Review — v1.99 Claude Optimized Sync

Date: 2026-06-20

## Result

No secrets were added. The external Claude package was preserved under `private_vault` and was not imported into runtime code.

## Security improvements merged

- `.vercelignore` excludes docs, markdown, manifests, Supabase SQL drafts, local exports and private raw data from deploy upload.
- `.dockerignore` excludes docs, markdown, manifests, Supabase SQL drafts, local exports, private raw data, logs, `.env.local`, `node_modules`, `.next` and `.git` from Docker build context.
- Next.js production browser source maps remain disabled through `productionBrowserSourceMaps: false`.
- `poweredByHeader: false` avoids advertising the framework.

## Private data rule

`private_raw_data`, bank PDFs, raw chats, private archives, tokens and `.env` files must never be uploaded to GitHub public repos, Vercel root, Supabase Storage or public cloud archives.

## Runtime boundary

The deployable/runtime app remains `finflow_app`. The full MASTER PRIVATE package must remain local/private.
